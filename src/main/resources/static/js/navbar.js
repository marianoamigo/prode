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

    if (!currentUser) {
        userSection.innerHTML = `
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
        <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:.85rem;color:var(--text-secondary);">
                ${currentUser.name}
            </span>
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
}
