document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init(){

    const currentUser =
            await loadCurrentUser();

    renderNavbar(
            currentUser
    );

    document
        .getElementById(
            "groupSelect"
        )
        .addEventListener(
            "change",
            loadGroupTeams
        );

    await loadGroups();
}

async function loadGroups(){

    const response =
        await fetch(
            "/api/group/all"
        );

    const groups =
        await response.json();

    const select =
        document.getElementById(
            "groupSelect"
        );

    groups.forEach(group => {

        select.innerHTML += `

            <option
                value="${group.id}">

                ${group.name}

            </option>

        `;
    });

    await loadGroupTeams();
}

async function loadGroupTeams(){
    const groupId =
        document
            .getElementById(
                "groupSelect"
            )
            .value;
    const response =
        await fetch(
            `/api/group/${groupId}`
        );

    const group =
        await response.json();

    const predictionResponse =
        await fetch(
            `/api/group-predictions/${groupId}`
        );

    const savedPredictions =
        await predictionResponse.json();

    const container =
        document.getElementById(
            "groupPredictionContainer"
        );

container.innerHTML = "";

group.teams.forEach(team,index) => {
    const saved =
        savedPredictions.find(
            p => p.team.id === team.id
        );
        const selectedPosition =
            saved
                ? saved.position
                : index + 1;
    container.innerHTML += `

        <div
            class="row mb-2">

            <div class="col-4">

                ${team.name}

            </div>

            <div class="col-4">

                <select
                    class="form-select prediction-position"

                    data-team-id="${team.id}">

                    <option value="1" ${selectedPosition  === 1 ? "selected" : ""}>1</option>
                    <option value="2" ${selectedPosition  === 2 ? "selected" : ""}>2</option>
                    <option value="3" ${selectedPosition  === 3 ? "selected" : ""}>3</option>
                    <option value="4" ${selectedPosition  === 4 ? "selected" : ""}>4</option>

                </select>

            </div>

        </div>

    `;
});


}

async function saveGroupPrediction(){

const groupId =
    document
        .getElementById(
            "groupSelect"
        )
        .value;

const predictions =
    [];
document
    .querySelectorAll(
        ".prediction-position"
    )
    .forEach(select => {
    predictions.push({

        teamId:
            select.dataset.teamId,

        position:
            Number(
                select.value
            )
    });
    });

    const positions =
            predictions.map(
                    p => p.position
            );

    if(
            new Set(
                    positions
            ).size !== 4
    ){
        alert(
            "Las posiciones no pueden repetirse"
        );

        return;
    }

    await fetch(
        "/api/group-predictions",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                groupId,

                predictions

            })
        }
    );
}