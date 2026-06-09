document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const ranking = await loadRanking();
    renderRanking(ranking);
}

async function loadRanking() {
    const response = await fetch("/api/ranking/global");
    return await response.json();
}

function renderRanking(ranking) {
    const body = document.getElementById("rankingBody");
    body.innerHTML = "";

    if (!ranking.length) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem;">Sin datos todavía</td></tr>`;
        return;
    }

    ranking.forEach((user, index) => {
        const badgeClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
        body.innerHTML += `
            <tr>
                <td><span class="rank-badge ${badgeClass}">${index + 1}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${user.pictureUrl ? `<img src="${user.pictureUrl}" width="30" height="30" style="border-radius:50%;object-fit:cover;border:1px solid var(--border);" alt="">` : ''}
                        <span>${user.userName}</span>
                    </div>
                </td>
                <td style="text-align:right;font-weight:600;color:var(--accent);">
                    ${user.totalPoints}
                </td>
            </tr>
        `;
    });
}