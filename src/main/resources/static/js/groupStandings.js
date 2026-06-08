document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init(){

    renderNavbar(null);

    const currentUser =
        await loadCurrentUser();

    renderNavbar(currentUser);

    await loadStandings();
}

async function loadStandings(){

    const response =
        await fetch(
            "/api/group-standings/all"
        );

    const standings =
        await response.json();

    renderStandings(
        standings
    );
}

function renderStandings(
        standings
){

    const groups = {};

    standings.forEach(standing => {

        if(
            !groups[
                standing.groupName
            ]
        ){
            groups[
                standing.groupName
            ] = [];
        }

        groups[
            standing.groupName
        ].push(
            standing
        );
    });

    const container =
        document.getElementById(
            "groupsContainer"
        );

    container.innerHTML = "";

    Object.entries(groups)
        .sort(
            (a,b) =>
                a[0].localeCompare(
                    b[0]
                )
        )
        .forEach(
            ([groupName,teams]) => {

                teams.sort(
                    (a,b) =>
                        a.position
                        -
                        b.position
                );

                container.innerHTML += `

                    <div
                        class="card mb-4">

                        <div
                            class="card-header">

                            GRUPO ${groupName}

                        </div>

                        <div
                            class="card-body">

                            ${teams.map(team => `

                                <div
                                    class="d-flex
                                           justify-content-between
                                           align-items-center
                                           mb-2">

                                    <div
                                        class="d-flex
                                               align-items-center
                                               gap-2">

                                        <span>

                                            ${team.position}

                                        </span>

                                        <img
                                            src="${team.flagUrl}"
                                            width="24"
                                            alt="">

                                        <span>

                                            ${team.teamName}

                                        </span>

                                    </div>

                                    <span>

                                        ${team.points} pts

                                    </span>

                                </div>

                            `).join("")}

                        </div>

                    </div>

                `;
            }
        );
}