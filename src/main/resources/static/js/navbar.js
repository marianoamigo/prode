async function loadCurrentUser() {

    try {
        const response = await fetch('/api/auth/me');
        const user = await response.json();
        console.log("USER", user);
        return user;
        } catch (error) {
        console.log(error);
        return null;
        }
}

function renderNavbar(currentUser){

    const userSection =
        document.getElementById(
            "userSection"
        );

    if(!currentUser){

        userSection.innerHTML = `

            <a
                href="/oauth2/authorization/google"
                class="btn btn-outline-light">

                Login Google

            </a>

        `;

        return;
    }

    userSection.innerHTML = `

        <div class="d-flex align-items-center gap-3">

            <a
                href="/"
                class="text-white text-decoration-none">

                Partidos

            </a>

            <a
                href="/html/privategroups.html"
                class="text-white text-decoration-none">

                Mis Grupos

            </a>

            <span class="text-white">

                👤 ${currentUser.name}

            </span>

            <a
                href="/logout"
                class="btn btn-outline-light">

                Salir

            </a>

        </div>

    `;
}

document.addEventListener(
    "DOMContentLoaded",
    initNavbar
);

async function initNavbar() {

    renderNavbar(null);

    const currentUser =
        await loadCurrentUser();

    renderNavbar(currentUser);
}