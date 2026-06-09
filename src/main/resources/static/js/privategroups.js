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
        return;
    }

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

function openGroup(groupId) {
    window.location.href = `/pages/privategroup.html?id=${groupId}`;
}

async function createGroup() {
    const name = document.getElementById("groupName").value;

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
    window.location.href = `/pages/privategroup.html?id=${group.id}`;
}
