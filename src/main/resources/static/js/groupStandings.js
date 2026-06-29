let standingsData = {};
let allMatches = [];
let activeStandingsGroup = null;

const KNOCKOUT_TABS = [
    { key: 'r32', label: '16AVOS',  stages: ['ROUND_OF_32'] },
    { key: 'r16', label: 'OCTAVOS', stages: ['ROUND_OF_16'] },
    { key: 'qf',  label: 'CUARTOS', stages: ['QUARTER_FINAL'] },
    { key: 'sf',  label: 'SEMIS',   stages: ['SEMI_FINAL'] },
    { key: 'fin', label: 'FINAL',   stages: ['FINAL', 'THIRD_PLACE'] },
];

document.addEventListener("DOMContentLoaded", init);

async function init() {
    renderNavbar(null);
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);
    await loadStandings();
}

async function loadStandings() {
    const [standingsRes, matchesRes] = await Promise.all([
        fetch("/api/group-standings/all"),
        fetch("/api/matches/all")
    ]);
    const standings = await standingsRes.json();
    allMatches = await matchesRes.json();

    standingsData = {};
    standings.forEach(s => {
        if (!standingsData[s.groupName]) standingsData[s.groupName] = [];
        standingsData[s.groupName].push(s);
    });

    Object.keys(standingsData).forEach(g => {
        standingsData[g].sort((a, b) => a.position - b.position);
    });

    const groups = Object.keys(standingsData).sort();
    activeStandingsGroup = 'r32';

    renderBracketSection(allMatches);
    renderGroupTabs(groups);
    renderActiveGroup();
}

function renderGroupTabs(groups) {
    const container = document.getElementById('standingGroupTabs');
    if (!container) return;

    let html = '';
    KNOCKOUT_TABS.forEach(kt => {
        html += `<button class="group-tab ${activeStandingsGroup === kt.key ? 'active' : ''}"
                         onclick="selectStandingsGroup('${kt.key}', this)">${kt.label}</button>`;
    });
    [...groups, '3ROS'].forEach(g => {
        html += `<button class="group-tab ${g === activeStandingsGroup ? 'active' : ''}"
                         onclick="selectStandingsGroup('${g}', this)">${g}</button>`;
    });
    container.innerHTML = html;
}

function selectStandingsGroup(g, btn) {
    activeStandingsGroup = g;
    document.querySelectorAll('#standingGroupTabs .group-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderActiveGroup();
}

function renderActiveGroup() {
    const container = document.getElementById("groupsContainer");
    if (!activeStandingsGroup) { container.innerHTML = ''; return; }

    const kt = KNOCKOUT_TABS.find(t => t.key === activeStandingsGroup);
    if (kt) {
        renderStageMatches(kt, container);
        return;
    }

    if (activeStandingsGroup === '3ROS') {
        renderThirdPlaceTable(container);
        return;
    }

    const teams = standingsData[activeStandingsGroup] || [];
    const groupMatches = allMatches
        .filter(m => m.groupName === activeStandingsGroup)
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    container.innerHTML = buildStandingsTable(teams) + buildGroupMatchesSections(groupMatches);
}

function renderStageMatches(kt, container) {
    const stageMatches = allMatches
        .filter(m => kt.stages.includes(m.stage))
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const definedMatches = stageMatches.filter(m => m.homeTeam && m.awayTeam);
    const toShow = kt.key === 'r32' ? stageMatches : definedMatches;

    if (toShow.length === 0) {
        container.innerHTML = `<div class="empty-state"><div style="font-size:40px;margin-bottom:12px;">⏳</div><div>Partidos a definir</div></div>`;
        return;
    }

    const dias  = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

    const byDate = {};
    toShow.forEach(m => {
        const dk = m.dateTime ? m.dateTime.split('T')[0] : 'unknown';
        if (!byDate[dk]) byDate[dk] = [];
        byDate[dk].push(m);
    });

    let html = '<div class="group-matches-section">';
    Object.keys(byDate).sort().forEach(dk => {
        const d = new Date(dk + 'T12:00:00');
        html += `<div class="group-matches-label">${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}</div>`;
        byDate[dk].forEach(m => { html += buildGroupMatchRow(m); });
    });
    html += '</div>';
    container.innerHTML = html;
}

function buildStandingsTable(teams) {
    return `
        <div class="tabla-card">
            <div class="tabla-header">GRUPO ${activeStandingsGroup}</div>
            <div class="tabla-cols">
                <span class="tabla-col-pos">#</span>
                <span class="tabla-col-team">Equipo</span>
                <span class="tabla-col-stat">PJ</span>
                <span class="tabla-col-stat">G</span>
                <span class="tabla-col-stat">E</span>
                <span class="tabla-col-stat">P</span>
                <span class="tabla-col-stat">DG</span>
                <span class="tabla-col-pts">PTS</span>
            </div>
            ${teams.map((t, i) => `
                <div class="tabla-row">
                    <span class="tabla-pos ${i < 2 ? 'top' : ''}">${i + 1}</span>
                    <div class="tabla-team">
                        ${t.flagUrl ? `<img src="${t.flagUrl}" class="tabla-flag-img" width="22" height="15" alt="${t.teamName || ''}">` : ''}
                        <span class="tabla-name">${t.teamName}</span>
                    </div>
                    <span class="tabla-stat">${t.played}</span>
                    <span class="tabla-stat">${t.wins}</span>
                    <span class="tabla-stat">${t.draws}</span>
                    <span class="tabla-stat">${t.losses}</span>
                    <span class="tabla-stat">${t.goalDifference >= 0 ? '+' : ''}${t.goalDifference}</span>
                    <span class="tabla-pts">${t.points}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function buildGroupMatchesSections(matches) {
    if (!matches || matches.length === 0) return '';

    const byDay = {};
    matches.forEach(m => {
        const day = m.matchDay || 0;
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(m);
    });

    let html = '<div class="group-matches-section">';
    Object.keys(byDay).sort((a, b) => Number(a) - Number(b)).forEach(day => {
        html += `<div class="group-matches-label">Fecha ${day}</div>`;
        byDay[day].forEach(m => { html += buildGroupMatchRow(m); });
    });
    html += '</div>';
    return html;
}

function buildGroupMatchRow(m) {
    const isLive     = m.status === 'LIVE';
    const isFinished = m.status === 'FINISHED';
    const hasScore   = m.homeScore !== null && m.homeScore !== undefined;

    let statusLabel;
    if (isLive)     statusLabel = `<span class="gmatch-status live">EN JUEGO</span>`;
    else if (isFinished) statusLabel = `<span class="gmatch-status fin">FINALIZADO</span>`;
    else statusLabel = `<span class="gmatch-status sched">${formatGMatchTime(m.dateTime)} hs</span>`;

    const scoreBlock = hasScore
        ? `<span class="gmatch-score${isLive ? ' live' : ''}">${m.homeScore} – ${m.awayScore}</span>`
        : `<span class="gmatch-vs">VS</span>`;

    const homeName = m.homeTeam || '?';
    const awayName = m.awayTeam || '?';

    return `
        <div class="gmatch-row">
            <div class="gmatch-status-row">${statusLabel}</div>
            <div class="gmatch-teams">
                <div class="gmatch-team">
                    ${m.homeFlagUrl ? `<img src="${m.homeFlagUrl}" class="gmatch-flag" alt="">` : ''}
                    <span class="gmatch-name">${homeName}</span>
                </div>
                <div class="gmatch-center">${scoreBlock}</div>
                <div class="gmatch-team right">
                    ${m.awayFlagUrl ? `<img src="${m.awayFlagUrl}" class="gmatch-flag" alt="">` : ''}
                    <span class="gmatch-name">${awayName}</span>
                </div>
            </div>
        </div>
    `;
}

function formatGMatchTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function renderThirdPlaceTable(container) {
    const thirds = [];
    Object.keys(standingsData).sort().forEach(g => {
        const teams = standingsData[g];
        if (teams.length >= 3) thirds.push({ ...teams[2], groupName: g });
    });

    thirds.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    if (thirds.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:24px;color:#5a6e90;font-size:.85rem;">Sin datos de terceros aún</div>`;
        return;
    }

    container.innerHTML = `
        <div class="tabla-card">
            <div class="tabla-header">MEJORES TERCEROS</div>
            <div class="tabla-cols">
                <span class="tabla-col-pos">#</span>
                <span class="tabla-col-team">Equipo</span>
                <span class="tabla-col-stat">PJ</span>
                <span class="tabla-col-stat">G</span>
                <span class="tabla-col-stat">E</span>
                <span class="tabla-col-stat">P</span>
                <span class="tabla-col-stat">DG</span>
                <span class="tabla-col-pts">PTS</span>
            </div>
            ${thirds.map((t, i) => `
                <div class="tabla-row">
                    <span class="tabla-pos ${i < 8 ? 'top' : ''}">${i + 1}</span>
                    <div class="tabla-team">
                        ${t.flagUrl ? `<img src="${t.flagUrl}" class="tabla-flag-img" width="22" height="15" alt="${t.teamName || ''}">` : ''}
                        <span class="tabla-name">${t.teamName}</span>
                        <span class="tabla-group-tag">${t.groupName}</span>
                    </div>
                    <span class="tabla-stat">${t.played}</span>
                    <span class="tabla-stat">${t.wins}</span>
                    <span class="tabla-stat">${t.draws}</span>
                    <span class="tabla-stat">${t.losses}</span>
                    <span class="tabla-stat">${t.goalDifference >= 0 ? '+' : ''}${t.goalDifference}</span>
                    <span class="tabla-pts">${t.points}</span>
                </div>
            `).join('')}
        </div>
    `;
}
