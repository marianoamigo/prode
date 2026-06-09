let currentGroup = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    const groupId = getGroupId();
    const group = await loadGroup(groupId);
    renderGroup(group);

    document.getElementById("copyInviteButton")
        .addEventListener("click", copyInviteLink);
    document.getElementById("deleteGroupButton")
        .addEventListener("click", deleteGroup);

    const ranking = await loadRanking(groupId);
    renderRanking(ranking);
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
    document.getElementById("deleteGroupButton").classList.remove("d-none");
}

async function loadRanking(groupId) {
    const response = await fetch(`/api/private/${groupId}/ranking`);
    return await response.json();
}

function renderRanking(ranking) {
    const body = document.getElementById("rankingBody");
    body.innerHTML = "";

    ranking.forEach((user, index) => {
        const badgeClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
        body.innerHTML += `
            <tr>
                <td><span class="rank-badge ${badgeClass}">${index + 1}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <img src="${user.pictureUrl}" width="30" height="30"
                             style="border-radius:50%;border:1px solid var(--border);" alt="">
                        <span>${user.userName}</span>
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
    const inviteLink = `${window.location.origin}/pages/join.html?code=${currentGroup.inviteCode}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("✅ Invitación copiada");
}

async function deleteGroup() {
    if (!confirm("¿Eliminar grupo? Esta acción no se puede deshacer.")) return;

    await fetch(`/api/private/${currentGroup.id}`, { method: "DELETE" });
    window.location.href = "/pages/privategroups.html";
}
