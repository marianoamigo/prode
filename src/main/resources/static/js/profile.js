document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) {
        document.getElementById('predictionsContainer').innerHTML =
            '<div style="text-align:center;padding:32px;color:var(--text-muted);">Perfil no encontrado</div>';
        return;
    }

    const profile = await loadProfile(userId);
    renderProfile(profile);
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

    if (!profile.predictions || profile.predictions.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">Sin pronósticos en partidos terminados</div>';
        return;
    }

    let html = '';
    profile.predictions.forEach(p => {
        const pts = p.pointsScored;
        const ptsColor = pts === 3 ? '#4caf50' : pts === 1 ? 'var(--accent)' : 'var(--text-muted)';
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
                        <div style="font-size:.72rem;color:var(--text-muted);">prono: ${p.predictedHomeScore}–${p.predictedAwayScore}</div>
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
        ROUND_OF_16: 'Octavos de Final',
        QUARTER_FINAL: 'Cuartos de Final',
        SEMI_FINAL: 'Semifinal',
        THIRD_PLACE: 'Tercer Puesto',
        FINAL: 'Final'
    };
    return map[stage] || stage;
}