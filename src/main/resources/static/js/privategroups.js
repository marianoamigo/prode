document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    if (!currentUser) {
        document.querySelector('main.page-container').innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <p style="font-size:1.05rem;font-weight:700;letter-spacing:.05em;margin-bottom:28px;color:var(--text-primary);line-height:1.5;">
                    NECESITAS ESTAR LOGUEADO PARA PRONOSTICAR
                </p>
                <a href="/oauth2/authorization/google"
                   style="display:inline-block;padding:14px 32px;background:var(--accent);color:#fff;
                          border-radius:50px;font-weight:700;font-size:.85rem;letter-spacing:.08em;
                          text-transform:uppercase;text-decoration:none;font-family:var(--font-body);">
                    Loguearse
                </a>
            </div>
        `;
        return;
    }

    const groups = await loadGroups();

    // Load all group rankings + global ranking in parallel
    const [rankingsArr, globalRanking] = await Promise.all([
        Promise.all(groups.map(g =>
            fetch(`/api/private/${g.id}/ranking`).then(r => r.ok ? r.json() : []).catch(() => [])
        )),
        fetch('/api/ranking/global').then(r => r.ok ? r.json() : []).catch(() => [])
    ]);

    const groupRankings = {};
    groups.forEach((g, i) => { groupRankings[g.id] = rankingsArr[i]; });

    const myGlobalIdx = globalRanking.findIndex(u => u.userName === currentUser.name);
    const myGlobalPos = myGlobalIdx >= 0 ? myGlobalIdx + 1 : null;

    renderGroups(groups, currentUser, groupRankings, myGlobalPos);
}

async function loadGroups() {
    const response = await fetch("/api/private/my-groups");
    return await response.json();
}

function renderGroups(groups, currentUser, groupRankings, myGlobalPos) {
    const container = document.getElementById("groupsContainer");
    container.innerHTML = "";

    if (!groups || !groups.length) {
        container.innerHTML = `
            <p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:24px 0;">
                Todavía no tenés grupos. ¡Creá uno!
            </p>
        `;
    } else {
        groups.forEach(group => {
            const ranking = groupRankings?.[group.id] || [];
            const myIdx = ranking.findIndex(u => u.userName === currentUser?.name);
            const myPos = myIdx >= 0 ? myIdx + 1 : null;

            container.innerHTML += `
                <div class="match-card" style="cursor:pointer;" onclick="openGroup('${group.id}')">
                    <div class="teams">
                        <span style="font-weight:600;">${group.name}</span>
                        ${myPos
                            ? `<span style="font-size:.82rem;color:var(--text-muted);">Tu posición: <strong style="color:var(--accent);">${myPos}°</strong></span>`
                            : `<span style="font-size:.8rem;color:var(--text-muted);">Ver ranking</span>`}
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML += `
        <div style="margin-top:24px;padding-bottom:8px;">
            <button class="btn-ranking-global" onclick="window.location.href='/pages/ranking'"
                    style="display:flex;justify-content:space-between;align-items:center;">
                <span>🏆 RANKING GLOBAL</span>
                ${myGlobalPos
                    ? `<span style="font-size:.85rem;font-weight:600;opacity:.9;">Tu posición: ${myGlobalPos}°</span>`
                    : ''}
            </button>
        </div>
    `;
}

function openGroup(groupId) {
    window.location.href = `/pages/privategroup?id=${groupId}`;
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
                <button class="btn-confirmar" onclick="window.location.href='/pages/privategroup?id=${group.id}'">
                    Ir al grupo
                </button>
            </div>
        </div>
    `;
}

function copyGroupInvite(inviteCode) {
    const link = `${window.location.origin}/pages/join?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert("✅ Invitación copiada");
}
