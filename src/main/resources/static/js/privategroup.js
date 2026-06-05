let currentGroup = null;

document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init(){

    const groupId =
        getGroupId();

    const group =
        await loadGroup(
            groupId
        );

    renderGroup(
        group
    );

    document
            .getElementById(
                "copyInviteButton"
            )
            .addEventListener(
                "click",
                copyInviteLink
            );

    const ranking =
        await loadRanking(
            groupId
        );

    renderRanking(
        ranking
    );
}

function getGroupId(){

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}

async function loadRanking(groupId){

    const response =
        await fetch(
            `/api/private/${groupId}/ranking`
        );

    return await response.json();
}

function renderRanking(ranking){

    const body =
        document.getElementById(
            "rankingBody"
        );

    body.innerHTML = "";

    ranking.forEach(
        (user,index) => {

            body.innerHTML += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>

                    <td>

                        ${user.userName}

                    </td>

                    <td>

                        ${user.totalPoints}

                    </td>

                </tr>

            `;
        }
    );
}

async function loadGroup(groupId){

    const response =
        await fetch(
            `/api/private/${groupId}`
        );

    return await response.json();
}

function renderGroup(group){

    currentGroup = group;

    document.getElementById(
        "groupTitle"
    ).innerText =
        group.name;
}

async function copyInviteLink(){

    const inviteLink =
        `${window.location.origin}/join/${currentGroup.inviteCode}`;

    await navigator.clipboard.writeText(
        inviteLink
    );

    alert(
        "Invitación copiada"
    );
}