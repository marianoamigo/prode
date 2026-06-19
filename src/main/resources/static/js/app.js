let selectedDate = new Date();
let activeTab = 'hoy';
let calOpen = false;
let modalMatchId = null;
let modalScores = [0, 0];
let activeFixtureFilter = null;

document.addEventListener("DOMContentLoaded", () => {
    init();
    initModalSwipe('predModal', closeModal);
});

function toDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function updateCalLabel() {
    const label = document.getElementById('calDateLabel');
    if (!label) return;
    const todayStr = toDateStr(new Date());
    const sel = toDateStr(selectedDate);
    const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrowDate);
    const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = toDateStr(yesterdayDate);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    if (sel === todayStr) label.textContent = 'Hoy';
    else if (sel === tomorrowStr) label.textContent = 'Mañana';
    else if (sel === yesterdayStr) label.textContent = 'Ayer';
    else label.textContent = `${dias[selectedDate.getDay()]} ${selectedDate.getDate()} ${meses[selectedDate.getMonth()]}`;
}

function toggleCalendar() {
    calOpen = !calOpen;
    const strip = document.getElementById('dateStrip');
    const arrow = document.getElementById('calArrow');
    if (!strip) return;
    if (calOpen) {
        strip.classList.add('open');
        if (arrow) arrow.textContent = '▴';
        renderDateStrip();
    } else {
        strip.classList.remove('open');
        if (arrow) arrow.textContent = '▾';
    }
}

function renderDateStrip() {
    const strip = document.getElementById('dateStrip');
    if (!strip) return;

    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const selStr = toDateStr(selectedDate);
    const startMs = new Date('2026-06-11T12:00:00').getTime();
    const endMs   = new Date('2026-07-19T12:00:00').getTime();
    const dayMs   = 86400000;

    let html = '';
    let idx = 0, selIdx = 0;
    for (let ms = startMs; ms <= endMs; ms += dayMs) {
        const d = new Date(ms);
        const dateStr = toDateStr(d);
        const active = dateStr === selStr;
        if (active) selIdx = idx;
        html += `<div class="date-chip${active ? ' active' : ''}" onclick="selectDate('${dateStr}')">
            <span class="chip-day">${dias[d.getDay()]}</span>
            <span class="chip-num">${d.getDate()}</span>
            <span class="chip-month">${meses[d.getMonth()]}</span>
        </div>`;
        idx++;
    }
    strip.innerHTML = html;

    setTimeout(() => {
        const chips = strip.querySelectorAll('.date-chip');
        if (chips[selIdx]) chips[selIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
}

async function selectDate(dateStr) {
    selectedDate = new Date(dateStr + 'T12:00:00');
    activeTab = 'fecha';

    // Cerrar calendario
    calOpen = false;
    const strip = document.getElementById('dateStrip');
    const arrow = document.getElementById('calArrow');
    if (strip) strip.classList.remove('open');
    if (arrow) arrow.textContent = '▾';

    // Sync tabs
    const todayStr = toDateStr(new Date());
    const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrowDate);
    const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = toDateStr(yesterdayDate);
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    if (dateStr === todayStr) document.querySelector('[data-tab="hoy"]')?.classList.add('active');
    else if (dateStr === tomorrowStr) document.querySelector('[data-tab="manana"]')?.classList.add('active');
    else if (dateStr === yesterdayStr) document.querySelector('[data-tab="ayer"]')?.classList.add('active');

    updateCalLabel();

    const matches = await loadMatchesByDate();
    const predictions = await loadPredictions();
    const currentUser = await loadCurrentUser();
    renderMatches(matches, predictions, currentUser);
}

async function init() {
    // After OAuth login, redirect back to a pending group invite if one was saved
    const pendingJoinCode = localStorage.getItem('pendingJoinCode');
    if (pendingJoinCode) {
        const currentUser = await loadCurrentUser();
        if (currentUser) {
            localStorage.removeItem('pendingJoinCode');
            window.location.href = `/pages/join?code=${pendingJoinCode}`;
            return;
        }
    }

    renderNavbar(null);
    updateCalLabel();

    const saveBtn = document.getElementById("saveAllButton");
    if (saveBtn) saveBtn.addEventListener("click", saveAllPredictions);

    const matches = await loadMatchesByDate();
    renderMatches(matches, [], null);

    const currentUser = await loadCurrentUser();

    if (currentUser) {
        renderNavbar(currentUser);
        const matchesWithDate = await loadMatchesByDate();
        const predictions = await loadPredictions();
        renderMatches(matchesWithDate, predictions, currentUser);
        updateCandidatosPromo();
    }
}

async function loadMatches() {
    const response = await fetch("/api/matches/all");
    return await response.json();
}

async function loadMatchesByDate() {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const response = await fetch(`/api/matches/date/${formattedDate}`);
    const matches = await response.json();
    renderDateTitle();
    return matches;
}

function renderDateTitle() {
    const el = document.getElementById("matchesDateTitle");
    if (!el) return;
    const today = new Date();
    const isToday = today.toDateString() === selectedDate.toDateString();
    el.innerText = isToday
        ? "PARTIDOS DE HOY"
        : `PARTIDOS DEL ${selectedDate.toLocaleDateString("es-AR")}`;
}

async function previousDay() {
    selectedDate.setDate(selectedDate.getDate() - 1);
    const matches = await loadMatchesByDate();
    const predictions = await loadPredictions();
    const currentUser = await loadCurrentUser();
    renderMatches(matches, predictions, currentUser);
}

async function nextDay() {
    selectedDate.setDate(selectedDate.getDate() + 1);
    const matches = await loadMatchesByDate();
    const predictions = await loadPredictions();
    const currentUser = await loadCurrentUser();
    renderMatches(matches, predictions, currentUser);
}

async function loadPredictions() {
    const currentUser = await loadCurrentUser();
    if (!currentUser) return [];
    const response = await fetch('/api/predictions/mine');
    return await response.json();
}

async function savePrediction(matchId) {
    const homeInput = document.getElementById(`home-${matchId}`);
    const awayInput = document.getElementById(`away-${matchId}`);
    if (!homeInput || !awayInput) return;

    const homeScore = homeInput.value;
    const awayScore = awayInput.value;

    const response = await fetch('/api/predictions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            matchId: matchId,
            homeScore: Number(homeScore),
            awayScore: Number(awayScore)
        })
    });

    if (response.ok) {
        let saved;
        try {
            saved = await response.json();
        } catch (e) {
            saved = {
                matchId: matchId,
                predictedHomeScore: Number(homeScore),
                predictedAwayScore: Number(awayScore)
            };
        }
        if (!window._predictions) window._predictions = [];
        const idx = window._predictions.findIndex(p => String(p.matchId) === String(matchId));
        if (idx >= 0) window._predictions[idx] = saved;
        else window._predictions.push(saved);

        updateMatchCard(matchId);
    }
}

function updateMatchCard(matchId) {
    const match = (window._allMatches || []).find(m => String(m.id) === String(matchId));
    if (!match) return;
    const prediction = (window._predictions || []).find(p => String(p.matchId) === String(matchId));
    const canEdit = canEditPrediction(match);
    const newHtml = buildMatchCard(match, prediction, window._currentUser, canEdit);
    const card = document.getElementById(`card-${matchId}`);
    if (card) card.outerHTML = newHtml;
}

async function updateCandidatosPromo() {
    const box = document.getElementById('candidatosPromo');
    if (!box) return;
    try {
        const res = await fetch('/api/champion-prediction/mine');
        const data = res.ok ? await res.json() : null;
        box.style.display = (!data || !data.champion) ? 'block' : 'none';
    } catch {
        box.style.display = 'none';
    }
}

async function recalculateMatch(matchId) {
    await fetch(`/api/admin/recalculate/${matchId}`, { method: 'POST' });
    window.location.reload();
}

async function resetMatch(matchId) {
    if (!confirm('¿Resetear partido a SCHEDULED? Limpia el score y pone puntos en 0.')) return;
    await fetch(`/api/admin/reset/${matchId}`, { method: 'POST' });
    window.location.reload();
}

async function updateMatchResult(matchId, finished) {
    const homeScore = document.getElementById(`admin-home-${matchId}`).value;
    const awayScore = document.getElementById(`admin-away-${matchId}`).value;

    await fetch("/api/matches/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore: Number(homeScore), awayScore: Number(awayScore), finished })
    });

    window.location.reload();
}

function formatDateLabel(dateStr) {
    const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const d = new Date(dateStr + 'T12:00:00');
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}

function formatTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function buildMatchCard(match, prediction, currentUser, canEdit) {
    const hasPred = !!prediction;
    const isLive = match.status === 'LIVE';
    const leftLabel = getMatchLeftLabel(match);

    const hasRealScore = match.homeScore !== null && match.homeScore !== undefined;
    const vsInner = hasRealScore
        ? `<span class="score-display${isLive ? ' score-live' : ''}">${match.homeScore}–${match.awayScore}</span>`
        : `<span class="vs-text">VS</span>`;

    let actionSection = '';
    if (currentUser) {
        if (canEdit) {
            actionSection = `
                <button class="btn-pronosticar ${hasPred ? 'done' : ''}"
                        onclick="openPredictionModal('${match.id}')">
                    ${hasPred ? 'Modificar pronóstico' : 'Pronosticar'}
                </button>`;
        } else if (match.status === 'LIVE') {
            const livePoints = hasPred ? calculateLivePoints(prediction, match) : null;
            actionSection = `
                <div class="prediction-result">
                    <span class="prediction-score">TU PRONÓSTICO: ${hasPred ? `${prediction.predictedHomeScore} – ${prediction.predictedAwayScore}` : '—'}</span>
                    ${livePoints !== null ? `<span class="prediction-pts-live">${livePoints} pts</span>` : ''}
                </div>`;
        } else if (match.status === 'FINISHED') {
            actionSection = `
                <div class="prediction-result">
                    <span class="prediction-score">${hasPred ? `TU PRONÓSTICO: ${prediction.predictedHomeScore} – ${prediction.predictedAwayScore}` : '—'}</span>
                    ${hasPred ? `<span class="prediction-pts">${prediction.pointsScored ?? 0} pts</span>` : ''}
                </div>`;
        } else {
            actionSection = `
                <div style="text-align:center;font-size:11px;font-weight:700;color:#5a6e90;letter-spacing:.08em;margin-top:4px;">
                    PARTIDO PROGRAMADO PARA LAS ${formatTime(match.dateTime)} hs
                </div>`;
        }
    }

    let adminSection = '';
    if (currentUser?.role === 'ADMIN') {
        const isFinished = match.status === 'FINISHED';
        adminSection = `
            <div class="admin-section">
                <div class="admin-label">ADMIN</div>
                ${isFinished ? `
                <div style="color:#5a6e90;font-size:12px;text-align:center;">Partido finalizado</div>
                <div class="admin-btns">
                    <button class="admin-btn update" onclick="recalculateMatch('${match.id}')">Re-calcular puntos</button>
                    <button class="admin-btn reset" onclick="resetMatch('${match.id}')">Reiniciar partido</button>
                </div>` : `
                <div class="admin-inputs">
                    <input id="admin-home-${match.id}" type="number" min="0" class="admin-input" value="${match.homeScore ?? 0}">
                    <span style="color:#5a6e90;">–</span>
                    <input id="admin-away-${match.id}" type="number" min="0" class="admin-input" value="${match.awayScore ?? 0}">
                </div>
                <div class="admin-btns">
                    <button class="admin-btn update" onclick="updateMatchResult('${match.id}', false)">Actualizar</button>
                    <button class="admin-btn finish" onclick="updateMatchResult('${match.id}', true)">Finalizar</button>
                    <button class="admin-btn reset" onclick="resetMatch('${match.id}')">Resetear</button>
                </div>`}
            </div>`;
    }

    return `
        <div class="match-card" id="card-${match.id}">
            <div class="match-card-header">
                <span class="${leftLabel.css}">${leftLabel.text}</span>
                <span class="match-status-badge">${getStageLabel(match)}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    ${match.homeFlagUrl ? `<img src="${match.homeFlagUrl}" class="team-flag-img" alt="${match.homeTeam || ''}">` : ''}
                    <div class="team-name">${match.homeTeam || ''}</div>
                </div>
                <div class="vs-block">
                    ${vsInner}
                </div>
                <div class="team">
                    ${match.awayFlagUrl ? `<img src="${match.awayFlagUrl}" class="team-flag-img" alt="${match.awayTeam || ''}">` : ''}
                    <div class="team-name">${match.awayTeam || ''}</div>
                </div>
            </div>
            ${actionSection}
            ${adminSection}
            <input type="hidden" id="home-${match.id}" value="${prediction?.predictedHomeScore ?? ''}">
            <input type="hidden" id="away-${match.id}" value="${prediction?.predictedAwayScore ?? ''}">
        </div>`;
}

function renderMatches(matches, predictions, currentUser) {
    const container = document.getElementById("matchesContainer");
    container.innerHTML = "";

    window._allMatches = matches;
    window._predictions = predictions;
    window._currentUser = currentUser;

    if (!matches || matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size:40px;margin-bottom:12px;">📅</div>
                <div>No hay partidos este día</div>
            </div>`;
        return;
    }

    const byDate = {};
    matches.forEach(match => {
        const dateKey = match.dateTime ? match.dateTime.split('T')[0] : 'unknown';
        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push(match);
    });

    let html = '';
    const showDatePills = activeTab === 'fixture';

    Object.keys(byDate).sort().forEach(dateKey => {
        if (showDatePills) html += `<div class="date-pill">${formatDateLabel(dateKey)}</div>`;
        byDate[dateKey]
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .forEach(match => {
                const prediction = predictions.find(p => String(p.matchId) === String(match.id));
                html += buildMatchCard(match, prediction, currentUser, canEditPrediction(match));
            });
    });

    container.innerHTML = html;
}

function getStageLabel(match) {
    if (match.stage === "GROUP_STAGE") {
        return match.groupName ? `FASE DE GRUPOS - GRUPO ${match.groupName}` : "FASE DE GRUPOS";
    }
    const stages = {
        ROUND_OF_16: "OCTAVOS", QUARTER_FINAL: "CUARTOS",
        SEMI_FINAL: "SEMIFINAL", THIRD_PLACE: "TERCER PUESTO", FINAL: "FINAL"
    };
    return stages[match.stage] || match.stage;
}

function getTimeElapsedLabel(timeElapsed) {
    if (!timeElapsed || timeElapsed.toLowerCase() === 'notstarted') return '';
    if (timeElapsed.toLowerCase() === 'ht') return ' - ENTRETIEMPO';
    if (isNaN(timeElapsed)) return '';
    return ` - ${timeElapsed}'`;
}

function getMatchLeftLabel(match) {
    if (match.status === 'LIVE') {
        return { text: `EN JUEGO${getTimeElapsedLabel(match.timeElapsed)}`, css: 'match-status-live' };
    }
    if (match.status === 'FINISHED') {
        return { text: 'FINALIZADO', css: 'match-time' };
    }
    return { text: `${formatTime(match.dateTime)} hs`, css: 'match-time' };
}

function formatMatchDate(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function saveAllPredictions() {
    const inputs = document.querySelectorAll('[id^="home-"]');
    for (const input of inputs) {
        const matchId = input.id.replace("home-", "");
        const homeScore = document.getElementById(`home-${matchId}`)?.value;
        const awayScore = document.getElementById(`away-${matchId}`)?.value;
        if (!homeScore || !awayScore) continue;
        await fetch('/api/predictions/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId, homeScore: Number(homeScore), awayScore: Number(awayScore) })
        });
    }
    alert("✅ Pronósticos guardados");
    await init();
}

async function switchTab(btn, tab) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = tab;

    const filterBar = document.getElementById('fixtureFilterBar');
    if (filterBar) filterBar.style.display = tab === 'fixture' ? 'flex' : 'none';

    const currentUser = await loadCurrentUser();
    let matches;

    if (tab === 'ayer') {
        selectedDate = new Date();
        selectedDate.setDate(selectedDate.getDate() - 1);
        matches = await loadMatchesByDate();
        updateCalLabel();
    } else if (tab === 'hoy') {
        selectedDate = new Date();
        matches = await loadMatchesByDate();
        updateCalLabel();
    } else if (tab === 'manana') {
        selectedDate = new Date();
        selectedDate.setDate(selectedDate.getDate() + 1);
        matches = await loadMatchesByDate();
        updateCalLabel();
    } else {
        activeFixtureFilter = null;
        document.querySelectorAll('#fixtureFilterBar .mdf-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        matches = await loadMatches();
        window._fixtureAllMatches = matches;
    }

    const predictions = await loadPredictions();
    renderMatches(matches, predictions, currentUser);
}

function setFixtureFilter(key, btn) {
    activeFixtureFilter = key;
    document.querySelectorAll('#fixtureFilterBar .mdf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const all = window._fixtureAllMatches || window._allMatches || [];
    const filtered = applyFixtureFilter(all);
    const container = document.getElementById("matchesContainer");
    container.innerHTML = "";
    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state"><div style="font-size:40px;margin-bottom:12px;">📅</div><div>No hay partidos en esta fase</div></div>`;
        return;
    }
    const byDate = {};
    filtered.forEach(m => {
        const key2 = m.dateTime ? m.dateTime.split('T')[0] : 'unknown';
        if (!byDate[key2]) byDate[key2] = [];
        byDate[key2].push(m);
    });
    let html = '';
    Object.keys(byDate).sort().forEach(dateKey => {
        html += `<div class="date-pill">${formatDateLabel(dateKey)}</div>`;
        byDate[dateKey].forEach(m => {
            const pred = (window._predictions || []).find(p => String(p.matchId) === String(m.id));
            html += buildMatchCard(m, pred, window._currentUser, canEditPrediction(m));
        });
    });
    container.innerHTML = html;
}

function applyFixtureFilter(matches) {
    if (!activeFixtureFilter) return matches;
    if (activeFixtureFilter === 'md1') return matches.filter(m => m.matchDay === 1);
    if (activeFixtureFilter === 'md2') return matches.filter(m => m.matchDay === 2);
    if (activeFixtureFilter === 'md3') return matches.filter(m => m.matchDay === 3);
    if (activeFixtureFilter === 'r16') return matches.filter(m => m.stage === 'ROUND_OF_16');
    if (activeFixtureFilter === 'qf')  return matches.filter(m => m.stage === 'QUARTER_FINAL');
    if (activeFixtureFilter === 'sf')  return matches.filter(m => ['SEMI_FINAL','THIRD_PLACE','FINAL'].includes(m.stage));
    return matches;
}

// ── MODAL ──
function openPredictionModal(matchId) {
    modalMatchId = matchId;
    const match = (window._allMatches || []).find(m => String(m.id) === String(matchId));
    if (!match) return;

    const pred = (window._predictions || []).find(p => String(p.matchId) === String(matchId));
    modalScores = pred ? [pred.predictedHomeScore, pred.predictedAwayScore] : [0, 0];

    document.getElementById('modal-flag1').src = match.homeFlagUrl;
    document.getElementById('modal-flag2').src = match.awayFlagUrl;
    document.getElementById('modal-team1').textContent = match.homeTeam;
    document.getElementById('modal-team2').textContent = match.awayTeam;
    document.getElementById('modal-score0').textContent = modalScores[0];
    document.getElementById('modal-score1').textContent = modalScores[1];

    document.getElementById('predModal').classList.add('open');
}

function closeModal() {
    document.getElementById('predModal').classList.remove('open');
    modalMatchId = null;
}

function closeModalOutside(e) {
    if (e.target === document.getElementById('predModal')) closeModal();
}

function changeModalScore(idx, delta) {
    modalScores[idx] = Math.max(0, modalScores[idx] + delta);
    document.getElementById('modal-score' + idx).textContent = modalScores[idx];
}

async function confirmPrediction() {
    if (!modalMatchId) return;
    const match = (window._allMatches || []).find(m => String(m.id) === String(modalMatchId));
    if (match && new Date() >= new Date(match.dateTime)) {
        closeModal();
        alert("El partido ya comenzó, no se puede pronosticar");
        return;
    }
    const id = modalMatchId;
    const homeInput = document.getElementById(`home-${id}`);
    const awayInput = document.getElementById(`away-${id}`);
    if (homeInput) homeInput.value = modalScores[0];
    if (awayInput) awayInput.value = modalScores[1];
    closeModal();
    await savePrediction(id);
}

function canEditPrediction(match) {
    const now = new Date();
    const kickoff = new Date(match.dateTime);
    return now < kickoff;
}

function calculateLivePoints(prediction, match) {
    if (!prediction || match.homeScore === null || match.homeScore === undefined) return null;
    if (prediction.predictedHomeScore === match.homeScore && prediction.predictedAwayScore === match.awayScore) return 3;
    const predResult = Math.sign(prediction.predictedHomeScore - prediction.predictedAwayScore);
    const actualResult = Math.sign(match.homeScore - match.awayScore);
    return predResult === actualResult ? 1 : 0;
}