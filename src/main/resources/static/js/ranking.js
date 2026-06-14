document.addEventListener("DOMContentLoaded", init);

async function init() {
    const currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    const ranking = await loadRanking();
    renderRanking(ranking, currentUser);
}

async function loadRanking() {
    const response = await fetch("/api/ranking/global");
    return await response.json();
}

function renderRanking(ranking, currentUser) {
    const body = document.getElementById("rankingBody");
    body.innerHTML = "";

    if (!ranking.length) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem;">Sin datos todavía</td></tr>`;
        return;
    }

    if (currentUser) {
        const myIdx = ranking.findIndex(u => u.userName === currentUser.name);
        if (myIdx >= 0) {
            let pos = 1;
            for (let i = 0; i <= myIdx; i++) {
                if (i > 0 && ranking[i].totalPoints < ranking[i - 1].totalPoints) pos = i + 1;
            }
            const banner = document.getElementById('myPositionBanner');
            if (banner) {
                banner.style.display = 'flex';
                banner.innerHTML = `<span class="pos-pill">Tu posición global: <strong>${pos}°</strong></span>`;
            }
        }
    }

    let pos = 1;
    ranking.forEach((user, index) => {
        if (index > 0 && user.totalPoints < ranking[index - 1].totalPoints) {
            pos = index + 1;
        }
        const badgeClass = pos === 1 ? 'top-1' : pos === 2 ? 'top-2' : pos === 3 ? 'top-3' : '';
        const isMe = currentUser && user.userName === currentUser.name;
        const isFirst = pos === 1;
        const rowStyle = `${isMe ? 'background:rgba(232,64,10,0.08);' : ''}cursor:pointer;`;

        body.innerHTML += `
            <tr style="${rowStyle}" onclick="window.location.href='/pages/profile?id=${user.userId}'">
                <td><span class="rank-badge ${badgeClass}">${pos}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${user.pictureUrl ? `<img src="${user.pictureUrl}" width="30" height="30" style="border-radius:50%;object-fit:cover;border:1px solid var(--border);" alt="">` : ''}
                        <span ${(isMe || isFirst) ? 'style="color:var(--accent);font-weight:600;"' : ''}>${user.userName}</span>
                    </div>
                </td>
                <td style="text-align:right;font-weight:600;color:var(--accent);">
                    ${user.totalPoints}
                </td>
            </tr>
        `;
    });
}