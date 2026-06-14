document.addEventListener('DOMContentLoaded', init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('groupId');
    const matchId = params.get('matchId');

    if (!groupId || !matchId) {
        document.getElementById('membersBody').innerHTML =
            '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted);">Parámetros inválidos</td></tr>';
        return;
    }

    const [group, matchData, members] = await Promise.all([
        fetch(`/api/private/${groupId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        loadMatch(matchId),
        fetch(`/api/private/${groupId}/live-match/${matchId}`).then(r => r.ok ? r.json() : []).catch(() => [])
    ]);

    const groupName = group ? group.name : 'Grupo';

    const backBtn = document.getElementById('backBtn');
    const backLabel = document.getElementById('backLabel');
    if (backBtn) backBtn.href = `/pages/privategroup?id=${groupId}`;
    if (backLabel) backLabel.textContent = `VOLVER A ${groupName.toUpperCase()}`;

    renderMatchHeader(matchData);
    renderMembers(members);
}

async function loadMatch(matchId) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const matches = await fetch(`/api/matches/date/${dateStr}`).then(r => r.ok ? r.json() : []).catch(() => []);
    return matches.find(m => String(m.id) === String(matchId)) || null;
}

function renderMatchHeader(match) {
    if (!match) return;

    const homeFlag = document.getElementById('homeFlagImg');
    const awayFlag = document.getElementById('awayFlagImg');
    const liveScore = document.getElementById('liveScore');
    const liveStatus = document.getElementById('liveStatus');

    if (homeFlag) { homeFlag.src = match.homeFlagUrl; homeFlag.alt = match.homeTeam || ''; }
    if (awayFlag) { awayFlag.src = match.awayFlagUrl; awayFlag.alt = match.awayTeam || ''; }

    if (liveScore) {
        const h = match.homeScore != null ? match.homeScore : '—';
        const a = match.awayScore != null ? match.awayScore : '—';
        liveScore.textContent = `${h} – ${a}`;
    }

    if (liveStatus && match.timeElapsed) {
        const elapsed = match.timeElapsed.toLowerCase();
        if (elapsed === 'ht') liveStatus.textContent = 'EN JUEGO · ENTRETIEMPO';
        else if (!isNaN(elapsed)) liveStatus.textContent = `EN JUEGO · ${elapsed}'`;
    }
}

function renderMembers(members) {
    const body = document.getElementById('membersBody');
    if (!body) return;

    if (!members || members.length === 0) {
        body.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem;">Sin participantes</td></tr>';
        return;
    }

    body.innerHTML = members.map(m => {
        const pred = (m.predictedHomeScore != null && m.predictedAwayScore != null)
            ? `${m.predictedHomeScore}-${m.predictedAwayScore}`
            : '—';
        const pts = m.livePoints != null ? m.livePoints : '—';
        return `
            <tr>
                <td>${m.userName}</td>
                <td style="text-align:center;font-weight:600;">${pred}</td>
                <td style="text-align:right;font-weight:700;color:var(--text-secondary);">${pts}</td>
            </tr>
        `;
    }).join('');
}