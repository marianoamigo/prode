document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init() {

    renderNavbar(null);

        const matches = await loadMatches();
        renderMatches( matches,[],null);

        const currentUser = await loadCurrentUser();


        if(currentUser) {

        renderNavbar(currentUser);
        const predictions = await loadPredictions();

        renderMatches(
            matches,
            predictions,
            currentUser
        );
        }
}

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

async function loadMatches() {

    const response =
        await fetch("/api/matches/all");

    return await response.json();
}

async function loadPredictions() {
    const response = await fetch('/api/predictions/mine');
    return await response.json();
}

async function savePrediction(matchId){

    const homeScore =
        document.getElementById(
            `home-${matchId}`
        ).value;

    const awayScore =
        document.getElementById(
            `away-${matchId}`
        ).value;

    await fetch(
        '/api/predictions',
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({

                matchId: matchId,

                predictedHomeScore:
                    Number(homeScore),

                predictedAwayScore:
                    Number(awayScore)

            })
        }
    );

    window.location.reload();
}

function renderMatches(matches,predictions, currentUser) {

    const container =
            document.getElementById(
                "matchesContainer"
            );

        container.innerHTML = "";

        matches.forEach(match => {

            const prediction =
                predictions.find(
                    p => p.matchId === match.id
                );

            let predictionHtml = "";

            if(currentUser && match.status === "SCHEDULED"){

                predictionHtml = `

                    <hr>

                    <div class="mt-3">

                        <strong>
                            TU PRONÓSTICO
                        </strong>

                    </div>

                    <div class="row mt-2 align-items-center">

                        <div class="col">

                            <input
                                id="home-${match.id}"
                                type="number"
                                min="0"
                                class="form-control"
                                value="${prediction?.predictedHomeScore ?? ''}"
                            >

                        </div>

                        <div class="col-auto">

                            -

                        </div>

                        <div class="col">

                            <input
                                id="away-${match.id}"
                                type="number"
                                min="0"
                                class="form-control"
                                value="${prediction?.predictedAwayScore ?? ''}"
                            >

                        </div>

                    </div>

                    <button
                        class="btn btn-primary mt-2"
                        onclick="savePrediction('${match.id}')">

                        Guardar

                    </button>

                `;
            }

            container.innerHTML += `

                <div class="card match-card">

                    <div class="card-header">

                        ${getStageLabel(match.stage)}

                    </div>

                    <div class="card-body">

                        <div class="row text-center">

                            <div class="col">

                                ${match.homeTeam}

                            </div>

                            <div class="col">

                                ${match.homeScore ?? "-"}

                                -

                                ${match.awayScore ?? "-"}

                            </div>

                            <div class="col">

                                ${match.awayTeam}

                            </div>

                        </div>

                        <div class="mt-3 match-status">

                            ${getMatchStatus(match)}

                        </div>



                        ${predictionHtml}

                    </div>

                </div>

            `;
        });
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
                href="#"
                class="text-white text-decoration-none">

                Mis Pronósticos

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

function getStageLabel(stage){

    const stages = {
        GROUP_STAGE: "FASE DE GRUPOS",
        ROUND_OF_16: "OCTAVOS",
        QUARTER_FINAL: "CUARTOS",
        SEMI_FINAL: "SEMIFINAL",
        THIRD_PLACE: "TERCER PUESTO",
        FINAL: "FINAL"
    };

    return stages[stage] || stage;
}

function getMatchStatus(match){

    if(match.status === "SCHEDULED"){
            return formatMatchDate(
                match.dateTime
            );
        }

        if(match.status === "LIVE"){
            return "EN JUEGO";
        }

        if(match.status === "FINISHED"){
            return "FINALIZADO";
        }

        return match.status;
}

function formatMatchDate(dateTime){

    const date = new Date(dateTime);

    return date.toLocaleString(
        'es-AR',
        {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }
    );
}