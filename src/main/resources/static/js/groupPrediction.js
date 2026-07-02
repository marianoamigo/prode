let activePronoTab = 'partidos';
let allMatches = [];
let allPredictions = [];
let currentGPModalMatchId = null;
let activePartidoFilter = null;
const groupTeamsMap = {};
const CANDIDATOS_DEADLINE = new Date('2026-06-27T23:59:59-03:00');
const LATE_PREDICTION_DEADLINE = new Date('2026-06-24T19:00:00Z');
// Keyed by team code (stable across envs, defined in SQL migration)
const FIXED_TEAMS = {
    'mx': 1, // México (A) — 1ro
    'ht': 4, // Haití (C) — 4to
    'us': 1, // Estados Unidos (D) — 1ro
    'tr': 4, // Turquía (D) — 4to
    'de': 1, // Alemania (E) — 1ro
    'tn': 4, // Túnez (F) — 4to
    'ar': 1, // Argentina (J) — 1ro
    'jo': 4, // Jordania (J) — 4to
};
let gpAllTeams = [];
let gpChampionPrediction = null;
let gpStandingsByGroup = {};

document.addEventListener("DOMContentLoaded", () => {
    init();
    initModalSwipe('gpModal', closeGPModal);
});

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    if (!currentUser) {
        showLoginRequired();
        return;
    }

    const [predsRes, standingsRes, champRes] = await Promise.all([
        fetch('/api/predictions/mine'),
        fetch('/api/group-standings/all'),
        fetch('/api/champion-prediction/mine')
    ]);
    allPredictions = predsRes.ok ? await predsRes.json() : [];

    const standings = standingsRes.ok ? await standingsRes.json() : [];
    gpStandingsByGroup = {};
    const seen = new Set();
    gpAllTeams = [];
    standings.forEach(s => {
        if (!gpStandingsByGroup[s.groupName]) gpStandingsByGroup[s.groupName] = [];
        gpStandingsByGroup[s.groupName].push(s);
        if (!seen.has(s.teamName)) {
            seen.add(s.teamName);
            gpAllTeams.push({ name: s.teamName, flagUrl: s.flagUrl });
        }
    });
    gpAllTeams.sort((a, b) => a.name.localeCompare(b.name));

    gpChampionPrediction = champRes.ok ? await champRes.json() : null;

    await loadAllMatchesForTab();
    await loadGroups();
}

function showLoginRequired() {
    document.getElementById('mainContent').innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <p style="font-size:1.05rem;font-weight:700;letter-spacing:.05em;margin-bottom:28px;color:var(--text-primary);line-height:1.5;">
                NECESITAS ESTAR LOGUEADO PARA PRONOSTICAR
            </p>
            <a href="/oauth2/authorization/google"
               style="display:inline-block;padding:14px 32px;background:var(--accent);color:#fff;
                      border-radius:50px;font-weight:700;font-size:.85rem;letter-spacing:.08em;
                      text-transform:uppercase;text-decoration:none;font-family:var(--font-body);">
                Loguearse
            </a>
        </div>
    `;
}

// ── TABS ──
function switchPronoTab(btn, tab) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activePronoTab = tab;

    document.getElementById('partidosContainer').style.display = tab === 'partidos' ? 'block' : 'none';
    document.getElementById('gruposContainer').style.display = tab === 'grupos' ? 'block' : 'none';
    const filterBar = document.getElementById('matchdayFilterBar');
    if (filterBar) filterBar.style.display = tab === 'partidos' ? 'flex' : 'none';
}

// ── MATCHDAY FILTER ──
function setPartidoFilter(key, btn) {
    activePartidoFilter = key;
    document.querySelectorAll('.mdf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const isCandidatos = key === 'candidatos';
    document.getElementById('partidosContainer').style.display   = !isCandidatos ? 'block' : 'none';
    document.getElementById('candidatosContainer').style.display = isCandidatos ? 'block' : 'none';

    if (isCandidatos) { renderGPCandidatos(); return; }
    renderPartidos();
}

function applyPartidoFilter(matches) {
    if (!activePartidoFilter) return matches;
    if (activePartidoFilter === 'md1') return matches.filter(m => m.matchDay === 1);
    if (activePartidoFilter === 'md2') return matches.filter(m => m.matchDay === 2);
    if (activePartidoFilter === 'md3') return matches.filter(m => m.matchDay === 3);
    if (activePartidoFilter === '16avos') return matches.filter(m => m.stage === 'ROUND_OF_32');
    if (activePartidoFilter === 'r16') return matches.filter(m => m.stage === 'ROUND_OF_16' && m.homeTeam && m.awayTeam);
    if (activePartidoFilter === 'qf')  return matches.filter(m => m.stage === 'QUARTER_FINAL' && m.homeTeam && m.awayTeam);
    if (activePartidoFilter === 'sf')  return matches.filter(m => ['SEMI_FINAL','THIRD_PLACE','FINAL'].includes(m.stage) && m.homeTeam && m.awayTeam);
    return matches;
}

function getDefaultFilter() {
    const argNow = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const y = argNow.getUTCFullYear(), m = argNow.getUTCMonth(), d = argNow.getUTCDate();
    if (y !== 2026) return 'md3';
    if (m === 5 && d >= 28) return '16avos';         // June 28+
    if (m === 6 && d <= 3)  return '16avos';         // July 1-3
    if (m === 6 && d <= 8)  return 'r16';            // July 4-8
    if (m === 6 && d <= 13) return 'qf';             // July 9-13
    if (m === 6 && d >= 14) return 'sf';             // July 14+
    return 'md3';
}

// ── TAB PARTIDOS ──
async function loadAllMatchesForTab() {
    const response = await fetch('/api/matches/all');
    allMatches = await response.json();
    const urlFilter = new URLSearchParams(window.location.search).get('filter');
    const filter = urlFilter || getDefaultFilter();
    const btn = document.getElementById(`filter-${filter}`);
    if (btn) {
        setPartidoFilter(filter, btn);
    } else {
        renderPartidos();
    }
}

function formatDateLabelGP(dateStr) {
    const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const d = new Date(dateStr + 'T12:00:00');
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}

function getMatchLeftLabelGP(match) {
    if (match.status === 'LIVE') {
        const te = match.timeElapsed;
        const elapsed = te && te.toLowerCase() !== 'notstarted'
            ? (te.toLowerCase() === 'ht' ? ' - ENTRETIEMPO' : (!isNaN(te) ? ` - ${te}'` : ''))
            : '';
        return { text: `EN JUEGO${elapsed}`, css: 'match-status-live' };
    }
    if (match.status === 'FINISHED') {
        return { text: 'FINALIZADO', css: 'match-time' };
    }
    return { text: `${formatTimeGP(match.dateTime)} hs`, css: 'match-time' };
}

function getStageLabelGP(match) {
    if (match.stage === "GROUP_STAGE") {
        return match.groupName ? `FASE DE GRUPOS - GRUPO ${match.groupName}` : "FASE DE GRUPOS";
    }
    const stages = {
        ROUND_OF_32: "16AVOS DE FINAL",
        ROUND_OF_16: "OCTAVOS", QUARTER_FINAL: "CUARTOS",
        SEMI_FINAL: "SEMIFINAL", THIRD_PLACE: "TERCER PUESTO", FINAL: "FINAL"
    };
    return stages[match.stage] || "";
}

function renderPartidos() {
    const container = document.getElementById('partidosContainer');
    const filtered = applyPartidoFilter(allMatches);

    if (!filtered.length) {
        const msg = ['r16', 'qf', 'sf'].includes(activePartidoFilter)
            ? 'Partidos a definir'
            : 'No hay partidos en esta fase';
        container.innerHTML = `<div class="empty-state"><div style="font-size:40px;margin-bottom:12px;">⏳</div><div>${msg}</div></div>`;
        return;
    }

    const byDate = {};
    filtered.forEach(m => {
        const dateKey = m.dateTime ? m.dateTime.split('T')[0] : 'unknown';
        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push(m);
    });

    let html = '';
    Object.keys(byDate).sort().forEach(dateKey => {
        html += `<div class="date-pill">${formatDateLabelGP(dateKey)}</div>`;
        byDate[dateKey]
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .forEach(match => {
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

function calculateLivePoints(prediction, match) {
    if (!prediction || match.homeScore === null || match.homeScore === undefined) return null;
    const isFinalStage = match.stage !== 'GROUP_STAGE';
    if (prediction.predictedHomeScore === match.homeScore && prediction.predictedAwayScore === match.awayScore) {
        return isFinalStage ? 6 : 3;
    }
    const predResult = Math.sign(prediction.predictedHomeScore - prediction.predictedAwayScore);
    const actualResult = Math.sign(match.homeScore - match.awayScore);
    if (predResult === actualResult) return isFinalStage ? 3 : 1;
    if (isFinalStage && (prediction.predictedHomeScore === match.homeScore || prediction.predictedAwayScore === match.awayScore)) return 1;
    return 0;
}

function buildPartidoCard(match, pred) {
    const hasPred = !!pred;
    const canEdit = new Date() < new Date(match.dateTime);
    const isLive = match.status === 'LIVE';
    const leftLabel = getMatchLeftLabelGP(match);

    const vsBlock = `
        <div class="vs-block">
            ${hasPred
                ? `<span class="score-display" id="pred-display-${match.id}">${pred.predictedHomeScore}–${pred.predictedAwayScore}</span>`
                : `<span class="vs-text" id="pred-display-${match.id}">VS</span>`}
        </div>`;

    let actionBtn;
    if (canEdit) {
        actionBtn = `<button class="btn-pronosticar ${hasPred ? 'done' : ''}" id="btn-${match.id}"
                   onclick="openGPModal('${match.id}')">
               ${hasPred ? 'Modificar pronóstico' : 'Pronosticar'}
           </button>`;
    } else if (isLive) {
        const hasReal = match.homeScore !== null && match.homeScore !== undefined;
        const livePoints = hasPred ? calculateLivePoints(pred, match) : null;
        actionBtn = `
            <div style="text-align:center;font-size:11px;font-weight:700;color:#5a6e90;letter-spacing:.08em;margin-top:4px;">
                PRONÓSTICO CERRADO
            </div>
            <div class="prediction-result">
                <span class="prediction-score">RESULTADO PARCIAL: ${hasReal ? `${match.homeScore}–${match.awayScore}` : '—'}</span>
                ${livePoints !== null ? `<span class="prediction-pts-live">${livePoints} pts</span>` : ''}
            </div>`;
    } else if (match.status === 'FINISHED') {
        const hasReal = match.homeScore !== null && match.homeScore !== undefined;
        actionBtn = `
            <div class="prediction-result">
                <span class="prediction-score">RESULTADO FINAL: ${hasReal ? `${match.homeScore}–${match.awayScore}` : '—'}</span>
                ${hasPred ? `<span class="prediction-pts">${pred.pointsScored ?? 0} pts</span>` : ''}
            </div>`;
    } else {
        actionBtn = `
            <div style="text-align:center;font-size:11px;font-weight:700;color:#5a6e90;letter-spacing:.08em;margin-top:4px;">
                PARTIDO PROGRAMADO PARA LAS ${formatTimeGP(match.dateTime)} hs
            </div>`;
    }

    return `
        <div class="match-card" id="prono-card-${match.id}">
            <div class="match-card-header">
                <span class="${leftLabel.css}">${leftLabel.text}</span>
                <span class="match-status-badge">${getStageLabelGP(match)}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    ${match.homeFlagUrl && match.homeTeam ? `<a href="/pages/team-results.html?team=${encodeURIComponent(match.homeTeam)}" style="line-height:0;"><img src="${match.homeFlagUrl}" class="team-flag-img" alt="${match.homeTeam}"></a>` : (match.homeFlagUrl ? `<img src="${match.homeFlagUrl}" class="team-flag-img" alt="">` : '')}
                    <div class="team-name">${match.homeTeam || ''}</div>
                </div>
                ${vsBlock}
                <div class="team">
                    ${match.awayFlagUrl && match.awayTeam ? `<a href="/pages/team-results.html?team=${encodeURIComponent(match.awayTeam)}" style="line-height:0;"><img src="${match.awayFlagUrl}" class="team-flag-img" alt="${match.awayTeam}"></a>` : (match.awayFlagUrl ? `<img src="${match.awayFlagUrl}" class="team-flag-img" alt="">` : '')}
                    <div class="team-name">${match.awayTeam || ''}</div>
                </div>
            </div>
            ${actionBtn}
        </div>`;
}

// ── MODAL PARTIDOS ──
function openGPModal(matchId) {
    const match = allMatches.find(m => String(m.id) === String(matchId));
    if (!match) return;

    const pred = allPredictions.find(p => String(p.matchId) === String(matchId));

    document.getElementById('gp-modal-flag1').src = match.homeFlagUrl || '';
    document.getElementById('gp-modal-team1').textContent = match.homeTeam || '';
    document.getElementById('gp-modal-flag2').src = match.awayFlagUrl || '';
    document.getElementById('gp-modal-team2').textContent = match.awayTeam || '';
    document.getElementById('gp-modal-score0').textContent = pred ? pred.predictedHomeScore : 0;
    document.getElementById('gp-modal-score1').textContent = pred ? pred.predictedAwayScore : 0;

    currentGPModalMatchId = matchId;
    document.getElementById('gpModal').classList.add('open');
}

function closeGPModal() {
    document.getElementById('gpModal').classList.remove('open');
    currentGPModalMatchId = null;
}

function closeGPModalOutside(event) {
    if (event.target === document.getElementById('gpModal')) closeGPModal();
}

function changeGPModalScore(idx, delta) {
    const el = document.getElementById(`gp-modal-score${idx}`);
    if (!el) return;
    el.textContent = Math.max(0, parseInt(el.textContent) + delta);
}

async function confirmGPPrediction() {
    if (!currentGPModalMatchId) return;

    const match = allMatches.find(m => String(m.id) === String(currentGPModalMatchId));
    if (match && new Date() >= new Date(match.dateTime)) {
        closeGPModal();
        alert("El partido ya comenzó, no se puede pronosticar");
        return;
    }

    const homeScore = parseInt(document.getElementById('gp-modal-score0').textContent) || 0;
    const awayScore = parseInt(document.getElementById('gp-modal-score1').textContent) || 0;
    const matchId = currentGPModalMatchId;

    const response = await fetch('/api/predictions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, homeScore, awayScore })
    });

    if (response.ok) {
        let saved;
        try { saved = await response.json(); } catch (e) {
            saved = { matchId, predictedHomeScore: homeScore, predictedAwayScore: awayScore };
        }
        const idx = allPredictions.findIndex(p => String(p.matchId) === String(matchId));
        if (idx >= 0) allPredictions[idx] = saved;
        else allPredictions.push(saved);

        const display = document.getElementById(`pred-display-${matchId}`);
        if (display) {
            display.textContent = `${homeScore}–${awayScore}`;
            display.className = 'score-display';
        }
        const btn = document.getElementById(`btn-${matchId}`);
        if (btn) {
            btn.classList.add('done');
            btn.textContent = 'Modificar pronóstico';
        }

        closeGPModal();
        alert('Pronósticos guardados');
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

    groupTeamsMap[groupId] = group.teams;

    const teamNames = new Set(group.teams.map(t => t.name));
    const groupMatches = allMatches.filter(m =>
        m.stage === 'GROUP_STAGE' && teamNames.has(m.homeTeam) && teamNames.has(m.awayTeam)
    );
    const groupLocked = groupMatches.length > 0 &&
        Date.now() >= Math.min(...groupMatches.map(m => new Date(m.dateTime).getTime()));

    const hasLateExisting = savedPredictions.length > 0 && savedPredictions.some(p => p.isLate);
    const isLateMode = (savedPredictions.length === 0 || hasLateExisting)
        && groupLocked
        && new Date() < LATE_PREDICTION_DEADLINE;

    // Fixed positions for this group (keyed by team code)
    const fixedPositions = new Set(
        group.teams.filter(t => FIXED_TEAMS[t.code] !== undefined).map(t => FIXED_TEAMS[t.code])
    );
    const availablePositions = [1, 2, 3, 4].filter(p => !fixedPositions.has(p));

    // Default positions for late mode (use saved if exists, else assign in order)
    const lateDefaultPos = {};
    if (isLateMode) {
        let avIdx = 0;
        for (const team of group.teams) {
            if (FIXED_TEAMS[team.code] !== undefined) {
                lateDefaultPos[team.id] = FIXED_TEAMS[team.code];
            } else {
                const savedPos = savedPredictions.find(p => p.teamId === team.id)?.position;
                lateDefaultPos[team.id] = savedPos ?? (availablePositions[avIdx++] ?? 1);
            }
        }
    }

    const orderedTeams = [...group.teams].sort((a, b) => {
        const posA = savedPredictions.find(p => p.teamId === a.id)?.position ?? 999;
        const posB = savedPredictions.find(p => p.teamId === b.id)?.position ?? 999;
        return posA - posB;
    });

    // In late mode always show all 4 teams (fixed ones have no savedPrediction row)
    const teamsToRender = (savedPredictions.length > 0 && !isLateMode) ? orderedTeams : group.teams;

    const container = document.getElementById("groupPredictionContainer");

    if (groupLocked && !isLateMode) {
        container.innerHTML += buildComparisonGroupCard(groupId, groupName, group.teams, savedPredictions, gpStandingsByGroup[groupName] || []);
        return;
    }

    container.innerHTML += `
        <div class="tabla-card" id="group-card-${groupId}" style="margin-bottom:14px;">
            <div class="tabla-header">GRUPO ${groupName}</div>
            ${isLateMode ? `<div style="text-align:center;font-size:10px;font-weight:800;color:#f0a500;letter-spacing:.1em;padding:6px 0 2px;">PRONÓSTICO TARDÍO — 1 PUNTO POR ACIERTO</div>` : ''}
            ${teamsToRender.map((team, index) => {
                let selectedPos, isFixed, rowStyle, rightCell;
                if (isLateMode) {
                    isFixed = FIXED_TEAMS[team.code] !== undefined;
                    selectedPos = lateDefaultPos[team.id];
                    rowStyle = isFixed ? 'opacity:0.45;pointer-events:none;' : '';
                    if (isFixed) {
                        rightCell = `<span style="font-size:15px;font-weight:900;color:#f0a500;padding:0 10px;letter-spacing:.02em;">${selectedPos}°</span>`;
                    } else {
                        rightCell = `<select class="group-pos-select prediction-position"
                                data-group-id="${groupId}"
                                data-team-id="${team.id}"
                                data-fixed="false"
                                onchange="updatePosDisplay(this, '${team.id}')">
                            ${availablePositions.map(p => `<option value="${p}" ${selectedPos === p ? 'selected' : ''}>${p}°</option>`).join('')}
                        </select>`;
                    }
                } else {
                    isFixed = false;
                    const saved = savedPredictions.find(p => p.teamId === team.id);
                    selectedPos = saved ? saved.position : index + 1;
                    rowStyle = '';
                    rightCell = `<select class="group-pos-select prediction-position"
                            data-group-id="${groupId}"
                            data-team-id="${team.id}"
                            data-fixed="false"
                            onchange="updatePosDisplay(this, '${team.id}')"
                            ${groupLocked ? 'disabled' : ''}>
                        <option value="1" ${selectedPos === 1 ? 'selected' : ''}>1°</option>
                        <option value="2" ${selectedPos === 2 ? 'selected' : ''}>2°</option>
                        <option value="3" ${selectedPos === 3 ? 'selected' : ''}>3°</option>
                        <option value="4" ${selectedPos === 4 ? 'selected' : ''}>4°</option>
                    </select>`;
                }
                const flagUrl = team.code ? `/images/flags/${team.code}.svg` : null;
                const isTop = selectedPos <= 2;
                return `
                    <div class="tabla-row" id="group-row-${team.id}" style="${rowStyle}">
                        <span class="tabla-pos group-pos-display ${isTop ? 'top' : ''}" id="pos-display-${team.id}">${selectedPos}</span>
                        <div class="tabla-team">
                            ${flagUrl ? `<a href="/pages/team-results.html?team=${encodeURIComponent(team.name)}" style="line-height:0;"><img src="${flagUrl}" class="tabla-flag-img" width="22" height="15" alt="${team.name || ''}"></a>` : ''}
                            <span class="tabla-name">${team.name}</span>
                        </div>
                        ${rightCell}
                    </div>`;
            }).join('')}
            <div class="group-action-btns">
                ${groupLocked && !isLateMode
                    ? `<div style="text-align:center;font-size:11px;font-weight:700;color:#5a6e90;letter-spacing:.08em;padding:10px 0;">PRONÓSTICO CERRADO</div>`
                    : isLateMode
                        ? `<button class="${hasLateExisting ? 'btn-group-save' : 'btn-group-predict'}"
                                   id="btn-group-save-${groupId}"
                                   onclick="saveGroupPrediction('${groupId}', true)">
                               ${hasLateExisting ? 'EDITAR PRONÓSTICO' : 'PRONOSTICAR GRUPO'}
                           </button>`
                        : `<button class="btn-group-calc" onclick="calculateGroupStandings('${groupId}')">
                               Calcular con pronósticos
                           </button>
                           <button class="${savedPredictions.length > 0 ? 'btn-group-save' : 'btn-group-predict'}"
                                   id="btn-group-save-${groupId}"
                                   onclick="saveGroupPrediction('${groupId}')">
                               ${savedPredictions.length > 0 ? 'EDITAR PRONÓSTICO' : 'PRONOSTICAR'}
                           </button>`
                }
            </div>
        </div>`;
}

function updatePosDisplay(select, teamId) {
    const display = document.getElementById(`pos-display-${teamId}`);
    if (display) {
        display.textContent = select.value;
        display.classList.toggle('top', parseInt(select.value) <= 2);
    }
}

// ── GUARDAR PRONÓSTICO POR GRUPO ──
async function saveGroupPrediction(groupId, isLateMode = false) {
    if (isLateMode) {
        if (new Date() >= LATE_PREDICTION_DEADLINE) {
            alert("El plazo para pronósticos tardíos ya venció (24/06 a las 16 hs)");
            return;
        }
    } else {
        const teams = groupTeamsMap[groupId];
        if (teams) {
            const teamNames = new Set(teams.map(t => t.name));
            const groupMatches = allMatches.filter(m =>
                m.stage === 'GROUP_STAGE' && teamNames.has(m.homeTeam) && teamNames.has(m.awayTeam)
            );
            if (groupMatches.length > 0) {
                const firstMatchTime = Math.min(...groupMatches.map(m => new Date(m.dateTime).getTime()));
                if (Date.now() >= firstMatchTime) {
                    alert("No se puede pronosticar este grupo: el primer partido ya comenzó");
                    return;
                }
            }
        }
    }

    const selects = document.querySelectorAll(`.prediction-position[data-group-id="${groupId}"]`);
    const predictions = [];
    const positions = [];

    selects.forEach(select => {
        if (isLateMode && select.dataset.fixed === 'true') return; // fixed teams: no enviar
        positions.push(Number(select.value));
        predictions.push({ teamId: select.dataset.teamId, position: Number(select.value) });
    });

    if (new Set(positions).size !== positions.length) {
        alert("Hay posiciones repetidas en el grupo");
        return;
    }

    const res = await fetch("/api/group-predictions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, predictions })
    });

    if (res.ok) {
        const btn = document.getElementById(`btn-group-save-${groupId}`);
        if (btn) {
            btn.textContent = isLateMode ? 'EDITAR PRONÓSTICO' : 'EDITAR PRONÓSTICO';
            btn.className = 'btn-group-save';
        }
        alert(isLateMode ? "Pronóstico tardío guardado — vale 1 punto por acierto" : "Pronósticos guardados");
    } else {
        alert("No se pudo guardar el pronóstico. El plazo puede haber vencido.");
    }
}

// ── CANDIDATOS (inline en Pronósticos) ──
function renderGPCandidatos() {
    const container = document.getElementById('candidatosContainer');
    if (!container) return;

    const past = new Date() > CANDIDATOS_DEADLINE;
    const hasSaved = gpChampionPrediction && gpChampionPrediction.champion;

    if (past && hasSaved) {
        container.innerHTML = buildGPCandidatosReadOnly();
        return;
    }
    if (past) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:.85rem;font-weight:700;letter-spacing:.06em;">PLAZO VENCIDO — SIN PRONÓSTICO</div>`;
        return;
    }

    const roles = [
        { key: 'champion',  label: '1° CAMPEÓN' },
        { key: 'runnerUp',  label: '2° SUBCAMPEÓN' },
        { key: 'third',     label: '3° TERCER PUESTO' },
        { key: 'fourth',    label: '4° CUARTO PUESTO' },
    ];

    let html = `<div class="candidatos-form">`;
    roles.forEach(r => {
        const savedName = gpChampionPrediction?.[r.key] || '';
        const savedFlag = gpChampionPrediction?.[r.key + 'Flag'] || '';
        html += `
            <div class="candidatos-row">
                <div class="candidatos-label">${r.label}</div>
                <div class="candidatos-select-wrap">
                    <img id="gp-flag-${r.key}" src="${savedFlag || ''}"
                         class="candidatos-flag" alt=""
                         style="${savedFlag ? '' : 'display:none;'}"
                         onerror="this.style.display='none'">
                    <select id="gp-sel-${r.key}" class="candidatos-select"
                            onchange="gpOnSelectChange('${r.key}')">
                        <option value="">— Elegí un país —</option>
                        ${gpAllTeams.map(t => `
                            <option value="${t.name}" data-flag="${t.flagUrl}"
                                    ${t.name === savedName ? 'selected' : ''}>${t.name}</option>
                        `).join('')}
                    </select>
                </div>
            </div>`;
    });

    const initialLabel = (gpChampionPrediction?.champion) ? 'PRONÓSTICO GUARDADO' : 'GUARDAR PRONÓSTICO';
    const initialClass = (gpChampionPrediction?.champion) ? ' saved' : '';
    html += `
        <button class="candidatos-save-btn${initialClass}" onclick="gpSaveCandidatos()">${initialLabel}</button>
        <div class="candidatos-deadline">
            Podrás modificar tus candidatos hasta el 27/06 a las 23.59 en PRONÓSTICOS &gt; CANDIDATOS
        </div>
    </div>`;

    container.innerHTML = html;
    roles.forEach(r => gpUpdateFlagDisplay(r.key));
}

function buildGPCandidatosReadOnly() {
    const p = gpChampionPrediction;
    const picks = [
        { label: '1° CAMPEÓN',       name: p.champion,  flag: p.championFlag },
        { label: '2° SUBCAMPEÓN',    name: p.runnerUp,  flag: p.runnerUpFlag },
        { label: '3° TERCER PUESTO', name: p.third,     flag: p.thirdFlag },
        { label: '4° CUARTO PUESTO', name: p.fourth,    flag: p.fourthFlag },
    ];
    let html = `<div class="candidatos-form">`;
    picks.forEach(pk => {
        html += `
            <div class="candidatos-row">
                <div class="candidatos-label">${pk.label}</div>
                <div class="candidatos-select-wrap">
                    ${pk.flag ? `<img src="${pk.flag}" class="candidatos-flag" alt="">` : ''}
                    <span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--text-primary);">${pk.name || '—'}</span>
                </div>
            </div>`;
    });
    html += `<div class="candidatos-deadline" style="text-align:center;color:var(--text-muted);">PRONÓSTICO GUARDADO</div></div>`;
    return html;
}

function gpOnSelectChange(key) {
    gpUpdateFlagDisplay(key);
    gpUpdateSaveButtonLabel();
}

function gpUpdateSaveButtonLabel() {
    const btn = document.querySelector('#candidatosContainer .candidatos-save-btn');
    if (!btn) return;
    const hasSavedChampion = !!(gpChampionPrediction?.champion);
    if (!hasSavedChampion) {
        btn.textContent = 'GUARDAR PRONÓSTICO';
        btn.classList.remove('saved', 'update');
        return;
    }
    const keys = ['champion', 'runnerUp', 'third', 'fourth'];
    const hasChanges = keys.some(k => {
        const sel = document.getElementById(`gp-sel-${k}`);
        const saved = gpChampionPrediction?.[k] || '';
        return sel && sel.value !== saved;
    });
    if (hasChanges) {
        btn.textContent = 'ACTUALIZAR PRONÓSTICO';
        btn.classList.remove('saved');
        btn.classList.add('update');
    } else {
        btn.textContent = 'PRONÓSTICO GUARDADO';
        btn.classList.remove('update');
        btn.classList.add('saved');
    }
}

function gpUpdateFlagDisplay(key) {
    const sel = document.getElementById(`gp-sel-${key}`);
    const flagImg = document.getElementById(`gp-flag-${key}`);
    if (!sel || !flagImg) return;
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.dataset.flag) {
        flagImg.src = opt.dataset.flag;
        flagImg.style.display = 'block';
    } else {
        flagImg.style.display = 'none';
    }
}

async function gpSaveCandidatos() {
    if (new Date() > CANDIDATOS_DEADLINE) {
        alert('El plazo para modificar candidatos ya venció (27/06)');
        return;
    }
    const champion = document.getElementById('gp-sel-champion')?.value || null;
    const runnerUp = document.getElementById('gp-sel-runnerUp')?.value || null;
    const third    = document.getElementById('gp-sel-third')?.value    || null;
    const fourth   = document.getElementById('gp-sel-fourth')?.value   || null;

    if (!champion) { alert('Tenés que elegir al menos el Campeón'); return; }
    const names = [champion, runnerUp, third, fourth].filter(Boolean);
    if (new Set(names).size !== names.length) {
        alert('No podés elegir el mismo país en más de una posición');
        return;
    }

    const getFlag = key => {
        const sel = document.getElementById(`gp-sel-${key}`);
        return sel?.options[sel.selectedIndex]?.dataset.flag || null;
    };

    const body = {
        champion, championFlag: getFlag('champion'),
        runnerUp, runnerUpFlag: getFlag('runnerUp'),
        third, thirdFlag: getFlag('third'),
        fourth, fourthFlag: getFlag('fourth')
    };

    const res = await fetch('/api/champion-prediction/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        gpChampionPrediction = body;
        gpUpdateSaveButtonLabel();
        alert('¡Candidatos guardados!');
    } else {
        alert('Error al guardar. Intentá de nuevo.');
    }
}

// ── GRUPO CERRADO: VISTA COMPARACIÓN PRONO / REAL / PTS ──
function buildComparisonGroupCard(groupId, groupName, teams, predictions, standings) {
    const groupFinished = standings.length === 4 && standings.every(s => s.played === 3);
    const isLateGroup = predictions.some(p => p.isLate);

    const predictedIds = new Set(predictions.map(p => p.teamId));
    const orderedTeams = [
        ...teams
            .filter(t => predictedIds.has(t.id))
            .sort((a, b) => {
                const pa = predictions.find(p => p.teamId === a.id)?.position ?? 999;
                const pb = predictions.find(p => p.teamId === b.id)?.position ?? 999;
                return pa - pb;
            }),
        ...teams.filter(t => !predictedIds.has(t.id))
    ];

    const rows = orderedTeams.map(team => {
        const pred = predictions.find(p => p.teamId === team.id);
        const standing = standings.find(s => s.teamName === team.name);
        const predictedPos = pred ? pred.position : null;
        const realPos = standing ? standing.position : null;
        const isLate = pred ? pred.isLate : false;

        const predDisplay = predictedPos !== null ? predictedPos : '—';
        const predTop = predictedPos !== null && predictedPos <= 2;
        const realDisplay = realPos !== null ? realPos : '—';
        const realTop = realPos !== null && realPos <= 2;

        let ptsDisplay, ptsColor;
        if (!groupFinished) {
            ptsDisplay = '—';
            ptsColor = '#5a6e90';
        } else if (predictedPos === null) {
            ptsDisplay = '+0';
            ptsColor = '#5a6e90';
        } else if (predictedPos === realPos) {
            ptsDisplay = isLate ? '+1' : '+2';
            ptsColor = '#4caf50';
        } else {
            ptsDisplay = '+0';
            ptsColor = '#5a6e90';
        }

        const flagUrl = team.code ? `/images/flags/${team.code}.svg` : '';
        return `
            <div class="tabla-row">
                <span class="tabla-pos ${predTop ? 'top' : ''}">${predDisplay}</span>
                <div class="tabla-team">
                    ${flagUrl ? `<a href="/pages/team-results.html?team=${encodeURIComponent(team.name)}" style="line-height:0;"><img src="${flagUrl}" class="tabla-flag-img" width="22" height="15" alt="${team.name}"></a>` : ''}
                    <span class="tabla-name">${team.name}</span>
                </div>
                <span class="tabla-stat" style="color:${realTop ? 'var(--accent)' : '#5a6e90'};font-weight:900;font-size:14px;">${realDisplay}</span>
                <span class="tabla-pts" style="color:${ptsColor};">${ptsDisplay}</span>
            </div>`;
    }).join('');

    return `
        <div class="tabla-card" id="group-card-${groupId}" style="margin-bottom:14px;">
            <div class="tabla-header">GRUPO ${groupName}</div>
            ${isLateGroup ? `<div style="text-align:center;font-size:10px;font-weight:800;color:#f0a500;letter-spacing:.1em;padding:6px 0 2px;">PRONÓSTICO TARDÍO</div>` : ''}
            <div class="tabla-cols">
                <span class="tabla-col-pos" style="font-size:8px;">PRED</span>
                <span class="tabla-col-team"></span>
                <span class="tabla-col-stat">REAL</span>
                <span class="tabla-col-pts">PTS</span>
            </div>
            ${rows}
        </div>`;
}

// ── CALCULAR POSICIONES CON PRONÓSTICOS DE PARTIDOS ──
function calculateGroupStandings(groupId) {
    const teams = groupTeamsMap[groupId];
    if (!teams) return;

    const teamNames = new Set(teams.map(t => t.name));
    const groupMatches = allMatches.filter(m =>
        m.stage === 'GROUP_STAGE' && teamNames.has(m.homeTeam) && teamNames.has(m.awayTeam)
    );

    const missingPreds = groupMatches.filter(m =>
        !allPredictions.find(p => String(p.matchId) === String(m.id))
    );

    if (missingPreds.length > 0) {
        alert(`Faltan pronosticar ${missingPreds.length} partido${missingPreds.length !== 1 ? 's' : ''} de este grupo`);
        return;
    }

    const accs = {};
    for (const team of teams) {
        accs[team.name] = {
            name: team.name, id: team.id,
            played: 0, wins: 0, draws: 0, losses: 0,
            goalsFor: 0, goalsAgainst: 0, points: 0
        };
    }

    for (const match of groupMatches) {
        const pred = allPredictions.find(p => String(p.matchId) === String(match.id));
        const home = accs[match.homeTeam];
        const away = accs[match.awayTeam];

        home.played++;
        away.played++;
        home.goalsFor += pred.predictedHomeScore;
        home.goalsAgainst += pred.predictedAwayScore;
        away.goalsFor += pred.predictedAwayScore;
        away.goalsAgainst += pred.predictedHomeScore;

        if (pred.predictedHomeScore > pred.predictedAwayScore) {
            home.wins++; home.points += 3; away.losses++;
        } else if (pred.predictedAwayScore > pred.predictedHomeScore) {
            away.wins++; away.points += 3; home.losses++;
        } else {
            home.draws++; away.draws++; home.points++; away.points++;
        }
    }

    const sorted = Object.values(accs).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const dgA = a.goalsFor - a.goalsAgainst;
        const dgB = b.goalsFor - b.goalsAgainst;
        if (dgB !== dgA) return dgB - dgA;
        return b.goalsFor - a.goalsFor;
    });

    sorted.forEach((team, i) => {
        const pos = i + 1;
        const posDisplay = document.getElementById(`pos-display-${team.id}`);
        if (posDisplay) {
            posDisplay.textContent = pos;
            posDisplay.classList.toggle('top', pos <= 2);
        }
        const select = document.querySelector(`.prediction-position[data-team-id="${team.id}"]`);
        if (select) select.value = pos;
    });

    // Reorder rows in DOM to reflect new standings
    const card = document.getElementById(`group-card-${groupId}`);
    if (card) {
        const btnsDiv = card.querySelector('.group-action-btns');
        sorted.forEach(team => {
            const row = document.getElementById(`group-row-${team.id}`);
            if (row && btnsDiv) card.insertBefore(row, btnsDiv);
        });
    }
}
