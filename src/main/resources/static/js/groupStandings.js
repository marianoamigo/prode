let standingsData = {};
let activeStandingsGroup = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    renderNavbar(null);
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);
    await loadStandings();
}

async function loadStandings() {
    const response = await fetch("/api/group-standings/all");
    const standings = await response.json();

    standingsData = {};
    standings.forEach(s => {
        if (!standingsData[s.groupName]) standingsData[s.groupName] = [];
        standingsData[s.groupName].push(s);
    });

    Object.keys(standingsData).forEach(g => {
        standingsData[g].sort((a, b) => a.position - b.position);
    });

    const groups = Object.keys(standingsData).sort();
    activeStandingsGroup = groups[0] || null;

    renderGroupTabs(groups);
    renderActiveGroup();
}

function renderGroupTabs(groups) {
    const container = document.getElementById('standingGroupTabs');
    if (!container) return;
    container.innerHTML = groups.map(g => `
        <button class="group-tab ${g === activeStandingsGroup ? 'active' : ''}"
                onclick="selectStandingsGroup('${g}', this)">${g}</button>
    `).join('');
}

function selectStandingsGroup(g, btn) {
    activeStandingsGroup = g;
    document.querySelectorAll('#standingGroupTabs .group-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderActiveGroup();
}

function renderActiveGroup() {
    const container = document.getElementById("groupsContainer");
    if (!activeStandingsGroup || !standingsData[activeStandingsGroup]) {
        container.innerHTML = '';
        return;
    }

    const teams = standingsData[activeStandingsGroup];

    container.innerHTML = `
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

function renderStandings(standings) {
    const groups = {};
    standings.forEach(s => {
        if (!groups[s.groupName]) groups[s.groupName] = [];
        groups[s.groupName].push(s);
    });

    const container = document.getElementById("groupsContainer");
    container.innerHTML = "";

    Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])).forEach(([groupName, teams]) => {
        teams.sort((a, b) => a.position - b.position);
        container.innerHTML += `
            <div class="tabla-card" style="margin-bottom:14px;">
                <div class="tabla-header">GRUPO ${groupName}</div>
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
    });
}