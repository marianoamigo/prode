let currentGroup = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const groupId = getGroupId();
    const group = await loadGroup(groupId);
    renderGroup(group);

    document.getElementById("copyInviteButton").addEventListener("click", copyInviteLink);
    document.getElementById("deleteGroupButton").addEventListener("click", deleteGroup);
    document.getElementById("leaveGroupButton").addEventListener("click", leaveGroup);

    const [ranking, globalRanking, liveMatches] = await Promise.all([
        loadRanking(groupId),
        fetch('/api/ranking/global').then(r => r.ok ? r.json() : []).catch(() => []),
        loadLiveMatches()
    ]);
    renderRanking(ranking, currentUser, globalRanking);
    renderLiveMatches(liveMatches, groupId);
}

function getGroupId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadGroup(groupId) {
    const response = await fetch(`/api/private/${groupId}`);
    return await response.json();
}

function renderGroup(group) {
    currentGroup = group;
    document.getElementById("groupTitle").innerText = group.name;

    if (group.isOwner) {
        document.getElementById("deleteGroupButton").style.display = "block";
    } else if (group.isMember) {
        document.getElementById("leaveGroupButton").style.display = "block";
    }
}

async function loadRanking(groupId) {
    const response = await fetch(`/api/private/${groupId}/ranking`);
    return await response.json();
}

function renderRanking(ranking, currentUser, globalRanking) {
    const body = document.getElementById("rankingBody");
    body.innerHTML = "";

    // Show current user's positions
    if (currentUser) {
        const myGroupIdx = ranking.findIndex(u => u.userName === currentUser.name);
        const myGlobalIdx = (globalRanking || []).findIndex(u => u.userName === currentUser.name);

        const calcPos = (list, idx) => {
            if (idx < 0) return null;
            let pos = 1;
            for (let i = 0; i <= idx; i++) {
                if (i > 0 && list[i].totalPoints < list[i - 1].totalPoints) pos = i + 1;
            }
            return pos;
        };

        const banner = document.getElementById('myPositionBanner');
        if (banner && (myGroupIdx >= 0 || myGlobalIdx >= 0)) {
            const groupPos = calcPos(ranking, myGroupIdx);
            const globalPos = calcPos(globalRanking || [], myGlobalIdx);
            banner.style.display = 'flex';
            banner.innerHTML = `
                ${groupPos ? `<span class="pos-pill">Tu posición en el grupo: <strong>${groupPos}°</strong></span>` : ''}
                ${globalPos ? `<span class="pos-pill">Ranking global: <strong>${globalPos}°</strong></span>` : ''}
            `;
        }
    }

    if (!ranking.length) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem;">Sin miembros todavía</td></tr>`;
        return;
    }

    let pos = 1;
    ranking.forEach((user, index) => {
        if (index > 0 && user.totalPoints < ranking[index - 1].totalPoints) pos = index + 1;
        const badgeClass = pos === 1 ? 'top-1' : pos === 2 ? 'top-2' : pos === 3 ? 'top-3' : '';
        const isMe = currentUser && user.userName === currentUser.name;
        body.innerHTML += `
            <tr style="${isMe ? 'background:rgba(232,64,10,0.08);' : ''}cursor:pointer;"
                onclick="window.location.href='/pages/profile?id=${user.userId}'">
                <td><span class="rank-badge ${badgeClass}">${pos}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${user.pictureUrl ? `<img src="${user.pictureUrl}" width="30" height="30" style="border-radius:50%;border:1px solid var(--border);" alt="">` : ''}
                        <span ${isMe ? 'style="color:var(--accent);font-weight:600;"' : ''}>${user.userName}</span>
                    </div>
                </td>
                <td style="text-align:right;font-weight:600;color:var(--accent);">
                    ${user.totalPoints}
                </td>
            </tr>
        `;
    });
}

async function loadLiveMatches() {
    const res = await fetch('/api/matches/live');
    if (!res.ok) return [];
    return res.json();
}

function renderLiveMatches(liveMatches, groupId) {
    const section = document.getElementById('liveMatchesSection');
    const list = document.getElementById('liveMatchesList');
    if (!section || !list) return;
    if (!liveMatches || liveMatches.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    list.innerHTML = liveMatches.map(match => `
        <div onclick="window.location.href='/pages/live-match?groupId=${groupId}&matchId=${match.id}'"
             style="
                display:flex;align-items:center;justify-content:center;gap:10px;
                background:var(--bg-card);border:1px solid var(--border-accent);
                border-radius:12px;padding:14px 16px;margin-bottom:8px;
                cursor:pointer;transition:background 0.15s;
             "
             onmouseover="this.style.background='var(--bg-card-hover)'"
             onmouseout="this.style.background='var(--bg-card)'">
            <img src="${match.homeFlagUrl}" style="width:40px;height:28px;object-fit:cover;border-radius:3px;" alt="${match.homeTeam}">
            <span style="font-size:20px;font-weight:900;color:var(--text-primary);font-family:Impact,monospace;letter-spacing:2px;">
                ${match.homeScore} – ${match.awayScore}
            </span>
            <img src="${match.awayFlagUrl}" style="width:40px;height:28px;object-fit:cover;border-radius:3px;" alt="${match.awayTeam}">
        </div>
    `).join('');
}

async function copyInviteLink() {
    const inviteLink = `${window.location.origin}/pages/join?code=${currentGroup.inviteCode}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("✅ Invitación copiada");
}

async function deleteGroup() {
    if (!confirm("¿Eliminar grupo? Esta acción no se puede deshacer.")) return;

    const response = await fetch(`/api/private/${currentGroup.id}`, { method: "DELETE" });
    if (response.ok || response.status === 204) {
        window.location.href = "/pages/privategroups";
    } else {
        alert("No se pudo eliminar el grupo.");
    }
}

async function leaveGroup() {
    if (!confirm("¿Salir del grupo? Vas a perder tu posición en el ranking.")) return;

    const response = await fetch(`/api/private/${currentGroup.id}/leave`, { method: "POST" });
    if (response.ok) {
        window.location.href = "/pages/privategroups";
    } else {
        const msg = await response.text().catch(() => '');
        alert(msg || "No se pudo salir del grupo.");
    }
}