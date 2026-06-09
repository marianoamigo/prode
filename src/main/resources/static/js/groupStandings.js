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

                        <div class="card-body">

                            <div class="standings-header">

                                <span></span>
                                <span></span>

                                <span>PJ</span>
                                <span>G</span>
                                <span>E</span>
                                <span>P</span>
                                <span>GF</span>
                                <span>GC</span>
                                <span>DG</span>
                                <span>PTS</span>

                            </div>

                            ${teams.map(team => `

                                <div class="standings-row">

                                    <div class="standings-team">

                                        ${
                                            team.position > 0
                                                ? `
                                                    <span class="standing-position">
                                                        ${team.position}
                                                    </span>
                                                  `
                                                : `
                                                    <span class="standing-position"></span>
                                                  `
                                        }

                                        <img
                                            src="${team.flagUrl}"
                                            width="24"
                                            alt="">

                                        <span>
                                            ${team.teamName}
                                        </span>

                                    </div>

                                    <span>${team.played}</span>
                                    <span>${team.wins}</span>
                                    <span>${team.draws}</span>
                                    <span>${team.losses}</span>
                                    <span>${team.goalsFor}</span>
                                    <span>${team.goalsAgainst}</span>
                                    <span>${team.goalDifference}</span>
                                    <span>${team.points}</span>

                                </div>

                            `).join("")}

                        </div>

                    </div>

                `;
            }
        );
}