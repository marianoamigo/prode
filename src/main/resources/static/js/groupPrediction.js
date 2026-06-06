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

    await loadGroups();
}

async function loadGroups(){

    const response =
        await fetch(
            "/api/groups"
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

document
    .getElementById(
        "groupSelect"
    )
    .addEventListener(
        "change",
        loadGroupTeams
    );

async function loadGroupTeams(){
    const groupId =
        document
            .getElementById(
                "groupSelect"
            )
            .value;
    const response =
        await fetch(
            `/api/groups/${groupId}`
        );

    const group =
        await response.json();
const container =
    document.getElementById(
        "groupPredictionContainer"
    );

container.innerHTML = "";

group.teams.forEach(team => {

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

                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>

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