let selectedDate = new Date();

document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init() {

    renderNavbar(null);

    document
        .getElementById("saveAllButton")
        .addEventListener("click",saveAllPredictions);
        const matches =
                await loadMatchesByDate();

        renderMatches(
                matches,
                [],
                null
        );

        const currentUser = await loadCurrentUser();


        if(currentUser) {

        document
            .getElementById("saveAllButton")
            .classList.remove("d-none");
        renderNavbar(currentUser);
        const matchesWithDate =
                await loadMatchesByDate();

        const predictions =
                await loadPredictions();

        renderMatches(
                matchesWithDate,
                predictions,
                currentUser
        );
        }
}

async function loadMatches() {

    const response =
        await fetch("/api/matches/all");

    return await response.json();
}

async function loadMatchesByDate(){

    const year =
        selectedDate.getFullYear();

    const month =
        String(
            selectedDate.getMonth() + 1
        ).padStart(2,"0");

    const day =
        String(
            selectedDate.getDate()
        ).padStart(2,"0");

    const formattedDate =
        `${year}-${month}-${day}`;

    const response =
        await fetch(
            `/api/matches/date/${formattedDate}`
        );

    const matches =
        await response.json();

    renderDateTitle();

    return matches;
}

function renderDateTitle(){

    const today =
        new Date();

    const isToday =
        today.toDateString()
        ===
        selectedDate.toDateString();

    document
        .getElementById(
            "matchesDateTitle"
        )
        .innerText =

        isToday

        ? "PARTIDOS DE HOY"

        : `PARTIDOS DEL ${
            selectedDate
                .toLocaleDateString(
                    "es-AR"
                )
        }`;
}

async function previousDay(){

    selectedDate.setDate(
        selectedDate.getDate() - 1
    );

    const matches =
        await loadMatchesByDate();

    const predictions =
        await loadPredictions();

    const currentUser =
        await loadCurrentUser();

    renderMatches(
        matches,
        predictions,
        currentUser
    );
}

async function nextDay(){

    selectedDate.setDate(
        selectedDate.getDate() + 1
    );

    const matches =
        await loadMatchesByDate();

    const predictions =
        await loadPredictions();

    const currentUser =
        await loadCurrentUser();

    renderMatches(
        matches,
        predictions,
        currentUser
    );
}

async function loadPredictions() {
    const currentUser =
            await loadCurrentUser();

        if(!currentUser){
            return [];
        }
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

async function updateMatchResult(matchId,finished){

    const homeScore =
            document.getElementById(
                    `admin-home-${matchId}`
            ).value;

    const awayScore =
            document.getElementById(
                    `admin-away-${matchId}`
            ).value;

    await fetch(
            "/api/matches/result",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                            "application/json"
                },

                body: JSON.stringify({

                    matchId,

                    homeScore:
                            Number(homeScore),

                    awayScore:
                            Number(awayScore),

                    finished
                })
            }
    );

    window.location.reload();
}

function renderMatches(matches, predictions, currentUser) {

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
        let adminButtons = "";

        if(currentUser){

            if(canEditPrediction(match)){

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

                `;

            } else {

                predictionHtml = `

                    <hr>

                    <div class="mt-3">

                        <strong>
                            TU PRONÓSTICO
                        </strong>

                    </div>

                    <div>

                        ${
                            prediction
                                ? `${prediction.predictedHomeScore}
                                   -
                                   ${prediction.predictedAwayScore}`
                                : "-"
                        }

                    </div>

                    <div class="text-success mt-2">

                        ${
                            prediction
                                ? prediction.pointsScored
                                : 0
                        } puntos

                    </div>

                `;
            }
        }

        if(
                currentUser?.role === "ADMIN"
        ){

            adminButtons = `

                <hr>

                <div class="mt-3">

                    <strong>

                        ADMIN

                    </strong>

                </div>

                <div class="row mt-2">

                    <div class="col">

                        <input
                            id="admin-home-${match.id}"
                            type="number"
                            min="0"
                            class="form-control"
                            value="${match.homeScore ?? 0}"
                        >

                    </div>

                    <div class="col">

                        <input
                            id="admin-away-${match.id}"
                            type="number"
                            min="0"
                            class="form-control"
                            value="${match.awayScore ?? 0}"
                        >

                    </div>

                </div>

                <div class="mt-2">

                    <button
                        class="btn btn-warning btn-sm"

                        onclick="
                            updateMatchResult(
                                '${match.id}',
                                false
                            )
                        ">

                        Actualizar

                    </button>

                    <button
                        class="btn btn-danger btn-sm ms-2"

                        onclick="
                            updateMatchResult(
                                '${match.id}',
                                true
                            )
                        ">

                        Finalizar

                    </button>

                </div>

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

                            <div
                                class="d-flex
                                       align-items-center
                                       justify-content-center
                                       gap-2">

                                <span>

                                    ${match.homeTeam}

                                </span>

                                <img
                                    src="${match.homeFlagUrl}"
                                    width="24"
                                    alt="">

                            </div>

                        </div>

                        <div class="col">

                            ${match.homeScore ?? "-"}

                            -

                            ${match.awayScore ?? "-"}

                        </div>

                        <div class="col">

                            <div
                                class="d-flex
                                       align-items-center
                                       justify-content-center
                                       gap-2">

                                <img
                                    src="${match.awayFlagUrl}"
                                    width="24"
                                    alt="">

                                <span>

                                    ${match.awayTeam}

                                </span>

                            </div>

                        </div>

                    </div>

                    <div class="mt-3 match-status">

                        ${getMatchStatus(match)}

                    </div>

                    ${predictionHtml}
                    ${adminButtons}

                </div>

            </div>

        `;
    });
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

    const now =
            new Date();

        const kickoff =
            new Date(match.dateTime);

        if(
            match.status === "SCHEDULED"
            &&
            now >= kickoff
        ){
            return "EN JUEGO";
        }

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

async function saveAllPredictions() {

    const inputs =
        document.querySelectorAll(
            '[id^="home-"]'
        );

    for(const input of inputs){

        const matchId =
            input.id.replace(
                "home-",
                ""
            );

        const homeScore =
            document.getElementById(
                `home-${matchId}`
            ).value;

        const awayScore =
            document.getElementById(
                `away-${matchId}`
            ).value;

        if(
            homeScore === ""
            ||
            awayScore === ""
        ){
            continue;
        }

        console.log({
            matchId,
            homeScore,
            awayScore
        });

        await fetch(
            '/api/predictions/register',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    matchId,

                    homeScore:
                        Number(homeScore),

                    awayScore:
                        Number(awayScore)

                })
            }
        );
    }

    alert(
        "✅ Pronósticos guardados"
    );

    await init();
}

function canEditPrediction(match){

    const now =
        new Date();

    const kickoff =
        new Date(match.dateTime);

    return now < kickoff;
}