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
        <a href="/pages/rules.html" class="nav-icon-btn" title="Reglas del prode">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
        </a>
        <a href="/pages/download.html" class="nav-icon-btn" title="Instalar app">
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

    userSection.innerHTML = `
        ${icons}
        <div style="display:flex;align-items:center;gap:10px;">
            <img src="${currentUser.pictureUrl}"
                 width="32" height="32"
                 style="border-radius:50%;border:2px solid var(--border);"
                 alt="${currentUser.name}">
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

    // Register service worker for PWA installability
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
}