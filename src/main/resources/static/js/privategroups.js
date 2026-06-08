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

async function createGroup(){

    const name =
        document.getElementById(
            "groupName"
        ).value;

    if(!name){
        alert("Ingresá un nombre");
        return;
    }

    const response =
        await fetch(
            "/api/private/create",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    name
                })
            }
        );

    const group =
        await response.json();

    window.location.href =
        `/html/privategroup.html?id=${group.id}`;
}