document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init(){


    const groups =
        await loadGroups();

    renderGroups(groups);
}

async function loadGroups(){

    const response =
        await fetch(
            "/api/private/my-groups"
        );

    return await response.json();
}

function renderGroups(groups){

    const container =
        document.getElementById(
            "groupsContainer"
        );

    container.innerHTML = "";

    groups.forEach(group => {

        container.innerHTML += `

            <div class="card mb-3">

                <div class="card-body">

                    <h5>

                        ${group.name}

                    </h5>

                    <button
                        class="btn btn-primary"
                        onclick="
                            openGroup(
                                '${group.id}'
                            )
                        ">

                        Ver Ranking

                    </button>

                </div>

            </div>

        `;
    });
}

function openGroup(groupId){

    window.location.href =
        `/html/privategroup.html?id=${groupId}`;
}