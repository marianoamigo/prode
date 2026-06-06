document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init(){

    const ranking =
        await loadRanking();

    renderRanking(
        ranking
    );
}

async function loadRanking(){

    const response =
        await fetch(
            "/api/ranking/global"
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

                        <div class="d-flex align-items-center gap-2">

                            <img
                                src="${user.pictureUrl}"
                                width="35"
                                height="35"
                                class="rounded-circle">

                            <span>
                                ${user.userName}
                            </span>

                        </div>

                    </td>

                    <td>

                        ${user.totalPoints}

                    </td>

                </tr>

            `;
        }
    );
}