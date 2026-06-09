let activePronoTab = 'partidos';
let allMatches = [];
let allPredictions = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    if (currentUser) {
        const predsRes = await fetch('/api/predictions/mine');
        allPredictions = predsRes.ok ? await predsRes.json() : [];
    }

    await Promise.all([
        loadAllMatchesForTab(),
        loadGroups()
    ]);
}

// ── TAB SWITCHING ──
function switchPronoTab(btn, tab) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activePronoTab = tab;

    document.getElementById('partidosContainer').style.display = tab === 'partidos' ? 'block' : 'none';
    document.getElementById('gruposContainer').style.display = tab === 'grupos' ? 'block' : 'none';
}

// ── TAB PARTIDOS ──
async function loadAllMatchesForTab() {
    const response = await fetch('/api/matches/all');
    allMatches = await response.json();
    renderPartidos();
}

function formatDateLabelGP(dateStr) {
    const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const d = new Date(dateStr + 'T12:00:00');
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}

function getMatchStatusGP(match) {
    const now = new Date();
    const kickoff = new Date(match.dateTime);
    if (match.status === "SCHEDULED" && now >= kickoff) return "EN JUEGO";
    if (match.status === "LIVE") return "EN JUEGO";
    if (match.status === "FINISHED") return "FINALIZADO";
    const stages = {
        GROUP_STAGE: "FASE DE GRUPOS", ROUND_OF_16: "OCTAVOS",
        QUARTER_FINAL: "CUARTOS", SEMI_FINAL: "SEMIFINAL",
        THIRD_PLACE: "TERCER PUESTO", FINAL: "FINAL"
    };
    return stages[match.stage] || "";
}

function renderPartidos() {
    const container = document.getElementById('partidosContainer');

    if (!allMatches.length) {
        container.innerHTML = '<div class="empty-state"><div style="font-size:40px;margin-bottom:12px;">📅</div><div>No hay partidos</div></div>';
        return;
    }

    const byDate = {};
    allMatches.forEach(m => {
        const dateKey = m.dateTime ? m.dateTime.split('T')[0] : 'unknown';
        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push(m);
    });

    let html = '';
    Object.keys(byDate).sort().forEach(dateKey => {
        html += `<div class="date-pill">${formatDateLabelGP(dateKey)}</div>`;
        byDate[dateKey].forEach(match => {
            const pred = allPredictions.find(p => String(p.matchId) === String(match.id));
            html += buildPartidoCard(match, pred);
        });
    });

    container.innerHTML = html;
}

function formatTimeGP(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function buildPartidoCard(match, pred) {
    const hasPred = !!pred;
    const canEdit = new Date() < new Date(match.dateTime);
    const matchTime = formatTimeGP(match.dateTime);
    const homeVal = hasPred ? pred.predictedHomeScore : 0;
    const awayVal = hasPred ? pred.predictedAwayScore : 0;

    const scoreBlock = canEdit
        ? `<div class="inline-score-group">
               <div class="score-ctrl">
                   <button class="score-btn plus" onclick="changeInlineScore('prono-home-${match.id}', 1)">+</button>
                   <div class="score-num" id="prono-home-${match.id}">${homeVal}</div>
                   <button class="score-btn minus" onclick="changeInlineScore('prono-home-${match.id}', -1)">−</button>
               </div>
               <span class="score-sep">-</span>
               <div class="score-ctrl">
                   <button class="score-btn plus" onclick="changeInlineScore('prono-away-${match.id}', 1)">+</button>
                   <div class="score-num" id="prono-away-${match.id}">${awayVal}</div>
                   <button class="score-btn minus" onclick="changeInlineScore('prono-away-${match.id}', -1)">−</button>
               </div>
           </div>`
        : `<div class="vs-block">
               ${hasPred
                   ? `<span class="score-display">${pred.predictedHomeScore}–${pred.predictedAwayScore}</span>`
                   : `<span class="vs-text">VS</span>`}
           </div>`;

    const actionBtn = canEdit
        ? `<button class="btn-pronosticar ${hasPred ? 'done' : ''}"
                   id="btn-${match.id}"
                   onclick="saveMatchPrediction('${match.id}')">
               ${hasPred ? 'Modificar pronóstico' : 'Pronosticar'}
           </button>`
        : `<div class="prediction-result">
               <span class="prediction-score">${hasPred ? `${pred.predictedHomeScore} – ${pred.predictedAwayScore}` : '—'}</span>
               ${hasPred ? `<span class="prediction-pts">${pred.pointsScored ?? 0} pts</span>` : ''}
           </div>`;

    return `
        <div class="match-card" id="prono-card-${match.id}">
            <div class="match-card-header">
                <span class="match-time">⏰ ${matchTime} hs</span>
                <span class="match-status-badge">${getMatchStatusGP(match)}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    ${match.homeFlagUrl ? `<img src="${match.homeFlagUrl}" class="team-flag-img" alt="${match.homeTeam || ''}">` : ''}
                    <div class="team-name">${match.homeTeam || ''}</div>
                </div>
                ${scoreBlock}
                <div class="team">
                    ${match.awayFlagUrl ? `<img src="${match.awayFlagUrl}" class="team-flag-img" alt="${match.awayTeam || ''}">` : ''}
                    <div class="team-name">${match.awayTeam || ''}</div>
                </div>
            </div>
            ${actionBtn}
        </div>`;
}

function changeInlineScore(elementId, delta) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    el.textContent = Math.max(0, current + delta);
}

async function saveMatchPrediction(matchId) {
    const homeEl = document.getElementById(`prono-home-${matchId}`);
    const awayEl = document.getElementById(`prono-away-${matchId}`);

    if (!homeEl || !awayEl) {
        alert('Ingresá el resultado para este partido');
        return;
    }

    const response = await fetch('/api/predictions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            matchId,
            homeScore: parseInt(homeEl.textContent) || 0,
            awayScore: parseInt(awayEl.textContent) || 0
        })
    });

    if (response.ok) {
        let saved;
        try { saved = await response.json(); } catch (e) {
            saved = {
                matchId,
                predictedHomeScore: parseInt(homeEl.textContent) || 0,
                predictedAwayScore: parseInt(awayEl.textContent) || 0
            };
        }
        const idx = allPredictions.findIndex(p => String(p.matchId) === String(matchId));
        if (idx >= 0) allPredictions[idx] = saved;
        else allPredictions.push(saved);

        const btn = document.getElementById(`btn-${matchId}`);
        if (btn) {
            btn.classList.add('done');
            btn.textContent = 'Modificar pronóstico';
        }
    }
}

// ── TAB GRUPOS ──
async function loadGroups() {
    const response = await fetch("/api/group/all");
    const groups = await response.json();

    const container = document.getElementById("groupPredictionContainer");
    container.innerHTML = "";

    for (const group of groups) {
        await renderGroup(group.id, group.name);
    }
}

async function renderGroup(groupId, groupName) {
    const [groupRes, predRes] = await Promise.all([
        fetch(`/api/group/${groupId}`),
        fetch(`/api/group-predictions/${groupId}`)
    ]);

    const group = await groupRes.json();
    const savedPredictions = await predRes.json();

    const orderedTeams = [...group.teams].sort((a, b) => {
        const posA = savedPredictions.find(p => p.teamId === a.id)?.position ?? 999;
        const posB = savedPredictions.find(p => p.teamId === b.id)?.position ?? 999;
        return posA - posB;
    });

    const teamsToRender = savedPredictions.length > 0 ? orderedTeams : group.teams;

    const container = document.getElementById("groupPredictionContainer");

    container.innerHTML += `
        <div class="tabla-card" style="margin-bottom:14px;">
            <div class="tabla-header">GRUPO ${groupName}</div>
            ${teamsToRender.map((team, index) => {
                const saved = savedPredictions.find(p => p.teamId === team.id);
                const selectedPos = saved ? saved.position : index + 1;
                const flagUrl = team.code ? `https://flagcdn.com/24x18/${team.code}.png` : null;
                const isTop = selectedPos <= 2;
                return `
                    <div class="tabla-row">
                        <span class="tabla-pos group-pos-display ${isTop ? 'top' : ''}" id="pos-display-${team.id}">${selectedPos}</span>
                        <div class="tabla-team">
                            ${flagUrl ? `<img src="${flagUrl}" class="tabla-flag-img" width="22" height="15" alt="${team.name || ''}">` : ''}
                            <span class="tabla-name">${team.name}</span>
                        </div>
                        <select class="group-pos-select prediction-position"
                                data-group-id="${groupId}"
                                data-team-id="${team.id}"
                                onchange="updatePosDisplay(this, '${team.id}')">
                            <option value="1" ${selectedPos === 1 ? 'selected' : ''}>1°</option>
                            <option value="2" ${selectedPos === 2 ? 'selected' : ''}>2°</option>
                            <option value="3" ${selectedPos === 3 ? 'selected' : ''}>3°</option>
                            <option value="4" ${selectedPos === 4 ? 'selected' : ''}>4°</option>
                        </select>
                    </div>`;
            }).join('')}
        </div>`;
}

function updatePosDisplay(select, teamId) {
    const display = document.getElementById(`pos-display-${teamId}`);
    if (display) {
        display.textContent = select.value;
        display.classList.toggle('top', parseInt(select.value) <= 2);
    }
}

async function saveAllPredictions() {
    const groupsMap = {};

    document.querySelectorAll(".prediction-position").forEach(select => {
        const groupId = select.dataset.groupId;
        const teamId = select.dataset.teamId;
        const position = Number(select.value);

        if (!groupsMap[groupId]) groupsMap[groupId] = [];
        groupsMap[groupId].push({ teamId, position });
    });

    for (const groupId in groupsMap) {
        const positions = groupsMap[groupId].map(p => p.position);
        if (new Set(positions).size !== 4) {
            alert("Hay posiciones repetidas en un grupo");
            return;
        }
    }

    const groups = Object.entries(groupsMap).map(([groupId, predictions]) => ({ groupId, predictions }));

    await fetch("/api/group-predictions/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups })
    });

    alert("Pronósticos guardados");
}