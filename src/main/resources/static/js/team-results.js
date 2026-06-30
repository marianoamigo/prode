document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar(null);
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const params   = new URLSearchParams(window.location.search);
    const teamName = params.get('team');
    const container = document.getElementById('matchesContainer');

    if (!teamName) {
        container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Equipo no especificado</div>';
        return;
    }

    document.title = `${teamName} — ORSAI`;
    document.getElementById('teamName').textContent = teamName.toUpperCase();

    const res = await fetch(`/api/matches/team/${encodeURIComponent(teamName)}`);
    if (!res.ok) {
        container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Error cargando partidos</div>';
        return;
    }

    const matches = await res.json();

    const firstWithFlag = matches.find(m =>
        (m.homeTeam === teamName && m.homeFlagUrl) ||
        (m.awayTeam === teamName && m.awayFlagUrl)
    );
    if (firstWithFlag) {
        const flagUrl = firstWithFlag.homeTeam === teamName
            ? firstWithFlag.homeFlagUrl
            : firstWithFlag.awayFlagUrl;
        const flagImg = document.getElementById('teamFlag');
        flagImg.src = flagUrl;
        flagImg.style.display = 'block';
    }

    if (matches.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Sin partidos registrados</div>';
        return;
    }

    container.innerHTML = matches.map(m => buildTeamMatchCard(m)).join('');
});

function formatTeamDatePill(dt) {
    if (!dt) return '';
    const dias  = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const d = new Date(dt);
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}

function buildTeamMatchCard(match) {
    const isLive     = match.status === 'LIVE';
    const isFinished = match.status === 'FINISHED';
    const hasScore   = match.homeScore !== null && match.homeScore !== undefined;
    const hasPen     = match.homePenaltyScore !== null && match.homePenaltyScore !== undefined;

    const penaltyLine = hasPen
        ? `<div style="font-size:11px;color:#e74c3c;font-weight:700;text-align:center;margin-top:3px;">${match.homePenaltyScore}–${match.awayPenaltyScore}</div>`
        : '';

    const vsInner = hasScore
        ? `<div><span class="score-display${isLive ? ' score-live' : ''}">${match.homeScore}–${match.awayScore}</span>${penaltyLine}</div>`
        : `<span class="vs-text">VS</span>`;

    let leftLabel, leftCss;
    if (isLive) {
        leftLabel = match.timeElapsed ? `${match.timeElapsed}'` : 'EN JUEGO';
        leftCss   = 'match-time live';
    } else if (isFinished) {
        leftLabel = 'FINALIZADO';
        leftCss   = 'match-time fin';
    } else {
        leftLabel = match.dateTime ? formatTeamTime(match.dateTime) + ' hs' : '—';
        leftCss   = 'match-time sched';
    }

    const homeFlag = match.homeFlagUrl && match.homeTeam
        ? `<a href="/pages/team-results.html?team=${encodeURIComponent(match.homeTeam)}" style="line-height:0;"><img src="${match.homeFlagUrl}" class="team-flag-img" alt="${match.homeTeam}"></a>`
        : (match.homeFlagUrl ? `<img src="${match.homeFlagUrl}" class="team-flag-img" alt="">` : '');

    const awayFlag = match.awayFlagUrl && match.awayTeam
        ? `<a href="/pages/team-results.html?team=${encodeURIComponent(match.awayTeam)}" style="line-height:0;"><img src="${match.awayFlagUrl}" class="team-flag-img" alt="${match.awayTeam}"></a>`
        : (match.awayFlagUrl ? `<img src="${match.awayFlagUrl}" class="team-flag-img" alt="">` : '');

    const datePill = match.dateTime
        ? `<div class="date-pill">${formatTeamDatePill(match.dateTime)}</div>`
        : '';

    return `${datePill}
        <div class="match-card">
            <div class="match-card-header">
                <span class="${leftCss}">${leftLabel}</span>
                <span class="match-status-badge">${getTeamStageLabel(match)}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    ${homeFlag}
                    <div class="team-name">${match.homeTeam || ''}</div>
                </div>
                <div class="vs-block">${vsInner}</div>
                <div class="team">
                    ${awayFlag}
                    <div class="team-name">${match.awayTeam || ''}</div>
                </div>
            </div>
        </div>`;
}

function formatTeamTime(dt) {
    const d = new Date(dt);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function getTeamStageLabel(match) {
    const labels = {
        'GROUP_STAGE':    `GRUPO ${match.groupName || ''}`,
        'ROUND_OF_32':   '16AVOS',
        'ROUND_OF_16':   'OCTAVOS',
        'QUARTER_FINAL': 'CUARTOS',
        'SEMI_FINAL':    'SEMIFINAL',
        'THIRD_PLACE':   '3ER PUESTO',
        'FINAL':         'FINAL',
    };
    return labels[match.stage] || match.stage || '';
}
