document.addEventListener("DOMContentLoaded", init);

async function init() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
        showError('Código de invitación inválido.');
        return;
    }

    // Load group info via public endpoint
    let group;
    try {
        const res = await fetch(`/api/private/invite/${code}`);
        if (!res.ok) throw new Error('not found');
        group = await res.json();
    } catch (e) {
        showError('El código de invitación no es válido o expiró.');
        return;
    }

    document.getElementById('groupNameTitle').textContent = group.name;

    // Check if user is logged in
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    if (!currentUser) {
        renderLoginPrompt(code);
        return;
    }

    // User is logged in — check if already a member
    const myGroupsRes = await fetch('/api/private/my-groups');
    const myGroups = myGroupsRes.ok ? await myGroupsRes.json() : [];
    const alreadyMember = myGroups.some(g => String(g.id) === String(group.id));

    if (alreadyMember) {
        window.location.href = `/pages/privategroup.html?id=${group.id}`;
        return;
    }

    renderJoinButton(code, group.id);
}

function renderLoginPrompt(code) {
    document.getElementById('actionArea').innerHTML = `
        <p style="color:var(--text-secondary);font-size:.9rem;margin-bottom:16px;">
            Iniciá sesión para unirte al grupo.
        </p>
        <button class="btn-confirmar" onclick="loginAndJoin('${code}')">
            Iniciar sesión con Google
        </button>
    `;
}

function renderJoinButton(code, groupId) {
    document.getElementById('actionArea').innerHTML = `
        <p style="color:var(--text-secondary);font-size:.9rem;margin-bottom:16px;">
            ¿Querés unirte a este grupo?
        </p>
        <button class="btn-confirmar" id="joinBtn" onclick="joinGroup('${code}', '${groupId}')">
            Unirme al grupo
        </button>
        <button class="btn-cancelar" onclick="window.location.href='/'">
            Cancelar
        </button>
    `;
}

function loginAndJoin(code) {
    localStorage.setItem('pendingJoinCode', code);
    window.location.href = '/oauth2/authorization/google';
}

async function joinGroup(code, groupId) {
    const btn = document.getElementById('joinBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Uniéndose...'; }

    try {
        const response = await fetch(`/api/private/join/${code}`, { method: 'POST' });
        if (response.ok) {
            window.location.href = `/pages/privategroup.html?id=${groupId}`;
        } else {
            if (btn) { btn.disabled = false; btn.textContent = 'Unirme al grupo'; }
            alert('No se pudo unir al grupo. Intentá de nuevo.');
        }
    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Unirme al grupo'; }
        alert('Error de conexión. Intentá de nuevo.');
    }
}

function showError(msg) {
    document.getElementById('groupNameTitle').textContent = 'Error';
    document.getElementById('actionArea').innerHTML = `
        <p style="color:var(--accent);font-size:.95rem;">${msg}</p>
        <a href="/" style="color:var(--blue-pearl);font-size:.85rem;">Volver al inicio</a>
    `;
}