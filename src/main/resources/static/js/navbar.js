async function loadCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return null;
        const user = await response.json();
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function renderNavbar(currentUser) {
    const userSection = document.getElementById("userSection");
    if (!userSection) return;

    const icons = `
        <a href="/pages/rules" class="nav-icon-btn" title="Reglas del prode">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
        </a>
        <a href="/pages/download" class="nav-icon-btn" title="Instalar app">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
        </a>
    `;

    if (!currentUser) {
        userSection.innerHTML = `
            ${icons}
            <a href="/oauth2/authorization/google"
               style="font-size:.8rem;color:var(--text-secondary);text-decoration:none;
                      border:1px solid var(--border);padding:6px 12px;border-radius:50px;
                      font-family:var(--font-body);font-weight:500;text-transform:uppercase;
                      letter-spacing:.05em;">
                Ingresar
            </a>
        `;
        return;
    }

    const bellIcon = ('PushManager' in window) ? `
        <button id="pushBellBtn" onclick="requestPushPermission()"
                title="Activar notificaciones"
                style="background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;color:var(--text-secondary);">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
        </button>` : '';

    userSection.innerHTML = `
        ${icons}
        ${bellIcon}
        <div style="display:flex;align-items:center;gap:10px;">
            <a href="/pages/profile?id=${currentUser.id}" style="line-height:0;display:flex;align-items:center;">
                <img src="${currentUser.pictureUrl}"
                     width="32" height="32"
                     style="border-radius:50%;border:2px solid var(--border);"
                     alt="${currentUser.name}">
            </a>
            <a href="/logout"
               style="font-size:.75rem;color:var(--text-muted);text-decoration:none;">
                Salir
            </a>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", initNavbar);

async function initNavbar() {
    renderNavbar(null);
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
        if (reg && currentUser) {
            initPushSubscription(reg);
        }
    }
}

// ── Push notifications ──────────────────────────────────────────────────────

async function initPushSubscription(swReg) {
    if (!('PushManager' in window)) return;
    if (Notification.permission === 'denied') return;

    const data = await fetch('/api/push/vapid-public-key')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);
    if (!data || !data.publicKey) return;

    try {
        const existing = await swReg.pushManager.getSubscription();

        if (existing) {
            // Re-sync with backend silently (handles reinstall / DB wipe)
            const json = existing.toJSON();
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth })
            }).catch(() => {});
            document.getElementById('pushBellBtn')?.classList.add('push-active');
            return;
        }

        if (Notification.permission === 'granted') {
            await doSubscribe(swReg, data.publicKey);
            document.getElementById('pushBellBtn')?.classList.add('push-active');
        }
        // If 'default', user must click the bell
    } catch (_) {}
}

async function requestPushPermission() {
    if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
        alert('Tu navegador no soporta notificaciones push.');
        return;
    }

    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await fetch('/api/push/vapid-public-key')
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}));

    if (!publicKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    await doSubscribe(reg, publicKey);
    document.getElementById('pushBellBtn')?.classList.add('push-active');
}

async function doSubscribe(swReg, publicKey) {
    const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    const json = subscription.toJSON();
    await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth
        })
    });
}

// ── Swipe down to dismiss modal ─────────────────────────────────────────────
function initModalSwipe(modalId, closeFn) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    const content = overlay.querySelector('.prode-modal');
    if (!content) return;

    let startY = 0, lastY = 0, dragging = false;

    content.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        lastY = startY;
        dragging = true;
        content.style.transition = 'none';
    }, { passive: true });

    content.addEventListener('touchmove', e => {
        if (!dragging) return;
        lastY = e.touches[0].clientY;
        const delta = Math.max(0, lastY - startY);
        content.style.transform = `translateY(${delta}px)`;
    }, { passive: true });

    content.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        const delta = Math.max(0, lastY - startY);
        if (delta > 80) {
            content.style.transition = 'transform 0.2s ease';
            content.style.transform = 'translateY(110%)';
            setTimeout(() => { closeFn(); content.style.transform = ''; content.style.transition = ''; }, 200);
        } else {
            content.style.transition = 'transform 0.25s cubic-bezier(.4,0,.2,1)';
            content.style.transform = 'translateY(0)';
            setTimeout(() => { content.style.transition = ''; }, 250);
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}