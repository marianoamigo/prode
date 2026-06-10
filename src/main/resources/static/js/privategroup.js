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

    const [ranking, globalRanking] = await Promise.all([
        loadRanking(groupId),
        fetch('/api/ranking/global').then(r => r.ok ? r.json() : []).catch(() => [])
    ]);
    renderRanking(ranking, currentUser, globalRanking);
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
        const banner = document.getElementById('myPositionBanner');
        if (banner && (myGroupIdx >= 0 || myGlobalIdx >= 0)) {
            banner.style.display = 'flex';
            banner.innerHTML = `
                ${myGroupIdx >= 0 ? `<span class="pos-pill">Tu posición en el grupo: <strong>${myGroupIdx + 1}°</strong></span>` : ''}
                ${myGlobalIdx >= 0 ? `<span class="pos-pill">Ranking global: <strong>${myGlobalIdx + 1}°</strong></span>` : ''}
            `;
        }
    }

    if (!ranking.length) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem;">Sin miembros todavía</td></tr>`;
        return;
    }

    ranking.forEach((user, index) => {
        const badgeClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
        const isMe = currentUser && user.userName === currentUser.name;
        body.innerHTML += `
            <tr ${isMe ? 'style="background:rgba(232,64,10,0.08);"' : ''}>
                <td><span class="rank-badge ${badgeClass}">${index + 1}</span></td>
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