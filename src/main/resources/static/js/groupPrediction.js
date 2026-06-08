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
            "/api/group/all"
        );

    const groups =
        await response.json();

    const container =
        document.getElementById(
            "groupPredictionContainer"
        );

    container.innerHTML = "";

    for(const group of groups){

        await renderGroup(
            group.id,
            group.name
        );
    }
}

async function renderGroup(groupId,groupName){

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

        const orderedTeams =
            [...group.teams]
                .sort((a,b) => {

                    const posA =
                        savedPredictions.find(
                            p => p.teamId === a.id
                        )?.position ?? 999;

                    const posB =
                        savedPredictions.find(
                            p => p.teamId === b.id
                        )?.position ?? 999;

                    return posA - posB;
                });

                const teamsToRender =
                    savedPredictions.length > 0
                        ? orderedTeams
                        : group.teams;

    const container =
        document.getElementById(
            "groupPredictionContainer"
        );

    container.innerHTML += `

        <hr>

        <h4>
            ${groupName}
        </h4>

    `;

    orderedTeams.forEach((team,index) => {

        const saved =
            savedPredictions.find(
                p => p.teamId === team.id
            );

        const selectedPosition =
            saved
                ? saved.position
                : index + 1;

        container.innerHTML += `

            <div class="row mb-2">

                <div class="col-4">

                    ${team.name}

                </div>

                <div class="col-4">

                    <select
                        class="form-select prediction-position"

                        data-group-id="${groupId}"

                        data-team-id="${team.id}">

                        <option value="1" ${selectedPosition === 1 ? "selected" : ""}>1</option>
                        <option value="2" ${selectedPosition === 2 ? "selected" : ""}>2</option>
                        <option value="3" ${selectedPosition === 3 ? "selected" : ""}>3</option>
                        <option value="4" ${selectedPosition === 4 ? "selected" : ""}>4</option>

                    </select>

                </div>

            </div>

        `;
    });
}

async function saveAllPredictions(){

    const groupsMap = {};

    document
        .querySelectorAll(
            ".prediction-position"
        )
        .forEach(select => {

            const groupId =
                select.dataset.groupId;

            const teamId =
                select.dataset.teamId;

            const position =
                Number(
                    select.value
                );

            if(
                !groupsMap[groupId]
            ){
                groupsMap[groupId] = [];
            }

            groupsMap[groupId].push({

                teamId,

                position
            });
        });

    for(
        const groupId
        in groupsMap
    ){

        const positions =
            groupsMap[groupId]
                .map(
                    p => p.position
                );

        if(
            new Set(
                positions
            ).size !== 4
        ){
            alert(
                "Hay posiciones repetidas en un grupo"
            );

            return;
        }
    }

    const groups =
        Object.entries(
            groupsMap
        )
        .map(
            ([groupId,predictions]) => ({

                groupId,

                predictions
            })
        );

    await fetch(
        "/api/group-predictions/save-all",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                groups
            })
        }
    );

    alert(
        "Pronósticos guardados"
    );
}
