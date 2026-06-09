document.addEventListener("DOMContentLoaded", init);

async function init() {
    const groups = await loadGroups();
    renderGroups(groups);
}

async function loadGroups() {
    const response = await fetch("/api/private/my-groups");
    return await response.json();
}

function renderGroups(groups) {
    const container = document.getElementById("groupsContainer");
    container.innerHTML = "";

    if (!groups.length) {
        container.innerHTML = `
            <p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:24px 0;">
                Todavía no tenés grupos. ¡Creá uno!
            </p>
        `;
    } else {
        groups.forEach(group => {
            container.innerHTML += `
                <div class="match-card" style="cursor:pointer;" onclick="openGroup('${group.id}')">
                    <div class="teams">
                        <span>${group.name}</span>
                        <span style="font-size:.8rem;color:var(--blue-pearl);">Ver ranking →</span>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML += `
        <div style="margin-top:24px;padding-bottom:8px;">
            <button class="btn-ranking-global" onclick="window.location.href='/pages/ranking.html'">
                🏆 RANKING GLOBAL
            </button>
        </div>
    `;
}

function openGroup(groupId) {
    window.location.href = `/pages/privategroup.html?id=${groupId}`;
}

async function createGroup() {
    const name = document.getElementById("groupName").value.trim();

    if (!name) {
        alert("Ingresá un nombre para el grupo");
        return;
    }

    const response = await fetch("/api/private/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    if (!response.ok) {
        const error = await response.text();
        alert(error);
        return;
    }

    const group = await response.json();
    showCreatedSuccess(group);
}

function showCreatedSuccess(group) {
    document.querySelector('main.page-container').innerHTML = `
        <div style="text-align:center;padding-top:32px;">
            <div style="font-size:3rem;margin-bottom:12px;">🎉</div>
            <p style="color:var(--text-secondary);font-size:.9rem;margin-bottom:4px;">Creaste el grupo</p>
            <h2 style="color:var(--text-primary);margin-bottom:24px;">${group.name}</h2>

            <p style="color:var(--text-secondary);font-size:.85rem;margin-bottom:8px;">Tu código de invitación es:</p>
            <div style="font-size:2rem;font-weight:900;letter-spacing:8px;color:var(--accent);
                        background:rgba(255,255,255,0.08);border-radius:12px;padding:12px 24px;
                        display:inline-block;margin-bottom:32px;">
                ${group.inviteCode}
            </div>

            <div style="max-width:300px;margin:0 auto;display:flex;flex-direction:column;gap:12px;">
                <button class="btn-cancelar" onclick="copyGroupInvite('${group.inviteCode}')">
                    📋 Copiar invitación
                </button>
                <button class="btn-confirmar" onclick="window.location.href='/pages/privategroup.html?id=${group.id}'">
                    Ir al grupo
                </button>
            </div>
        </div>
    `;
}

function copyGroupInvite(inviteCode) {
    const link = `${window.location.origin}/pages/join.html?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert("✅ Invitación copiada");
}
