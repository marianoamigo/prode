document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) {
        document.getElementById('predictionsContainer').innerHTML =
            '<div style="text-align:center;padding:32px;color:var(--text-muted);">Perfil no encontrado</div>';
        document.getElementById('gruposPredContainer').innerHTML = '';
        return;
    }

    const profile = await loadProfile(userId);
    renderProfile(profile);
    loadProfileGroupPredictions(userId);
}

function switchProfileTab(btn, tab) {
    document.querySelectorAll('.tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('partidosContainer').style.display = tab === 'partidos' ? 'block' : 'none';
    document.getElementById('gruposContainer').style.display = tab === 'grupos' ? 'block' : 'none';
}

async function loadProfileGroupPredictions(userId) {
    const [groupsRes, standingsRes] = await Promise.all([
        fetch('/api/group/all'),
        fetch('/api/group-standings/all')
    ]);
    const groups = groupsRes.ok ? await groupsRes.json() : [];
    const allStandings = standingsRes.ok ? await standingsRes.json() : [];

    const predsByGroup = await Promise.all(
        groups.map(g =>
            fetch(`/api/profile/${userId}/group-predictions/${g.id}`)
                .then(r => r.ok ? r.json() : [])
        )
    );

    const container = document.getElementById('gruposPredContainer');
    let html = '';

    groups.forEach((group, i) => {
        const predictions = predsByGroup[i];
        if (!predictions || predictions.length === 0) return;

        const groupStandings = allStandings.filter(s => s.groupName === group.name);
        const groupFinished = groupStandings.length === 4 && groupStandings.every(s => s.played === 3);
        if (!groupFinished) return;

        const isLateGroup = predictions.some(p => p.isLate);

        html += buildProfileGroupCard(group, predictions, groupStandings, isLateGroup, groupFinished);
    });

    if (!html) {
        html = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Sin pronósticos de grupos</div>';
    }
    container.innerHTML = html;
}

function buildProfileGroupCard(group, predictions, groupStandings, isLateGroup, groupFinished) {
    const predictedIds = new Set(predictions.map(p => p.teamId));

    const orderedTeams = [
        ...group.teams
            .filter(t => predictedIds.has(t.id))
            .sort((a, b) => {
                const pa = predictions.find(p => p.teamId === a.id)?.position ?? 999;
                const pb = predictions.find(p => p.teamId === b.id)?.position ?? 999;
                return pa - pb;
            }),
        ...group.teams.filter(t => !predictedIds.has(t.id))
    ];

    const rows = orderedTeams.map(team => {
        const pred = predictions.find(p => p.teamId === team.id);
        const standing = groupStandings.find(s => s.teamName === team.name);
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
                <span class="tabla-pos ${predTop ? 'top' : ''}" style="font-family:var(--font-body);text-align:center;">${predDisplay}</span>
                <div class="tabla-team">
                    ${flagUrl ? `<img src="${flagUrl}" class="tabla-flag-img" width="22" height="15" alt="${team.name}">` : ''}
                    <span class="tabla-name">${team.name}</span>
                </div>
                <span class="tabla-stat" style="color:${realTop ? 'var(--accent)' : '#5a6e90'};font-weight:900;font-size:14px;">${realDisplay}</span>
                <span class="tabla-pts" style="color:${ptsColor};font-family:var(--font-body);">${ptsDisplay}</span>
            </div>`;
    }).join('');

    return `
        <div class="tabla-card" style="margin-bottom:14px;">
            <div class="tabla-header">GRUPO ${group.name}</div>
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

async function loadProfile(userId) {
    const res = await fetch(`/api/profile/${userId}`);
    if (!res.ok) return null;
    return await res.json();
}

function renderProfile(profile) {
    const container = document.getElementById('predictionsContainer');

    if (!profile) {
        container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Perfil no encontrado</div>';
        return;
    }

    document.title = `${profile.userName} — ORSAI`;
    document.getElementById('profileName').textContent = profile.userName;
    document.getElementById('profilePoints').textContent = `${profile.totalPoints} puntos`;

    if (profile.pictureUrl) {
        const pic = document.getElementById('profilePic');
        pic.src = profile.pictureUrl;
        pic.style.display = 'block';
    }

    if (profile.championName) {
        const badge = document.getElementById('championBadge');
        if (badge) {
            badge.style.display = 'flex';
            badge.innerHTML = `
                <div class="champion-badge">
                    <span class="champion-badge-label">CANDIDATO AL TÍTULO</span>
                    <div class="champion-badge-team">
                        ${profile.championFlagUrl ? `<img src="${profile.championFlagUrl}" class="champion-badge-flag" alt="">` : ''}
                        <span class="champion-badge-name">${profile.championName}</span>
                    </div>
                </div>`;
        }
    }

    if (!profile.predictions || profile.predictions.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Sin pronósticos en partidos terminados</div>';
        return;
    }

    let html = '';
    profile.predictions.forEach(p => {
        const pts = p.pointsScored;
        const ptsColor = pts === 6 ? '#388e3c' : pts === 3 ? '#4caf50' : pts === 1 ? 'var(--accent)' : 'var(--text-muted)';
        const stageName = getStageName(p.stage, p.groupName);

        html += `
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">${stageName}</span>
                    <span style="font-size:.82rem;font-weight:700;color:${ptsColor};">+${pts} pts</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;">
                        <img src="${p.homeFlagUrl}" width="22" height="15" style="object-fit:cover;flex-shrink:0;" alt="">
                        <span style="font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.homeTeam}</span>
                    </div>
                    <div style="text-align:center;flex-shrink:0;min-width:80px;">
                        <div style="font-weight:700;font-size:1rem;">${p.homeScore} – ${p.awayScore}</div>
                        <div style="font-size:.72rem;color:var(--text-muted);">PRED: ${p.predictedHomeScore}–${p.predictedAwayScore}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;justify-content:flex-end;">
                        <span style="font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right;">${p.awayTeam}</span>
                        <img src="${p.awayFlagUrl}" width="22" height="15" style="object-fit:cover;flex-shrink:0;" alt="">
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function getStageName(stage, groupName) {
    if (stage === 'GROUP_STAGE') return groupName ? `Fase de Grupos — Grupo ${groupName}` : 'Fase de Grupos';
    const map = {
        ROUND_OF_32:   '16avos de Final',
        ROUND_OF_16:   'Octavos de Final',
        QUARTER_FINAL: 'Cuartos de Final',
        SEMI_FINAL:    'Semifinal',
        THIRD_PLACE:   'Tercer Puesto',
        FINAL:         'Final'
    };
    return map[stage] || stage;
}