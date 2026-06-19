const DEADLINE = new Date('2026-06-27T23:59:59-03:00');

let allTeams = [];
let currentPrediction = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    currentUser = await loadCurrentUser();
    renderNavbar(currentUser);

    if (!currentUser) {
        document.getElementById('candidatosContent').innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <p style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:24px;letter-spacing:.04em;">
                    NECESITAS ESTAR LOGUEADO PARA PRONOSTICAR
                </p>
                <a href="/oauth2/authorization/google"
                   style="display:inline-block;padding:14px 32px;background:var(--accent);color:#fff;
                          border-radius:50px;font-weight:700;font-size:.85rem;letter-spacing:.08em;
                          text-transform:uppercase;text-decoration:none;">
                    Ingresar
                </a>
            </div>`;
        return;
    }

    const [standingsRes, predRes] = await Promise.all([
        fetch('/api/group-standings/all'),
        fetch('/api/champion-prediction/mine')
    ]);

    const standings = standingsRes.ok ? await standingsRes.json() : [];
    currentPrediction = predRes.ok ? await predRes.json() : null;

    const seen = new Set();
    allTeams = [];
    standings.forEach(s => {
        if (!seen.has(s.teamName)) {
            seen.add(s.teamName);
            allTeams.push({ name: s.teamName, flagUrl: s.flagUrl });
        }
    });
    allTeams.sort((a, b) => a.name.localeCompare(b.name));

    renderForm();
}

function isPastDeadline() {
    return new Date() > DEADLINE;
}

function renderForm() {
    const container = document.getElementById('candidatosContent');
    const past = isPastDeadline();
    const hasSaved = currentPrediction && currentPrediction.champion;

    if (past && hasSaved) {
        container.innerHTML = buildReadOnlyView();
        return;
    }

    if (past && !hasSaved) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:.9rem;font-weight:700;letter-spacing:.06em;">
            PLAZO VENCIDO — SIN PRONÓSTICO
        </div>`;
        return;
    }

    const roles = [
        { key: 'champion',  label: '1° CAMPEÓN' },
        { key: 'runnerUp',  label: '2° SUBCAMPEÓN' },
        { key: 'third',     label: '3° TERCER PUESTO' },
        { key: 'fourth',    label: '4° CUARTO PUESTO' },
    ];

    let html = `<div class="candidatos-form">`;

    roles.forEach(r => {
        const savedName = currentPrediction?.[r.key] || '';
        const savedFlag = currentPrediction?.[r.key + 'Flag'] || '';
        const displayFlag = savedFlag || '/images/flags/placeholder.svg';

        html += `
            <div class="candidatos-row">
                <div class="candidatos-label">${r.label}</div>
                <div class="candidatos-select-wrap">
                    <img id="flag-${r.key}" src="${displayFlag}" class="candidatos-flag" alt=""
                         onerror="this.style.display='none'">
                    <select id="sel-${r.key}" class="candidatos-select"
                            onchange="onSelectChange('${r.key}')">
                        <option value="">— Elegí un país —</option>
                        ${allTeams.map(t => `
                            <option value="${t.name}" data-flag="${t.flagUrl}"
                                    ${t.name === savedName ? 'selected' : ''}>${t.name}</option>
                        `).join('')}
                    </select>
                </div>
            </div>`;
    });

    const initialLabel = hasSaved ? 'PRONÓSTICO GUARDADO' : 'GUARDAR PRONÓSTICO';
    const initialClass = hasSaved ? ' saved' : '';
    html += `
        <button class="candidatos-save-btn${initialClass}" onclick="saveCandidatos()">${initialLabel}</button>
        <div class="candidatos-deadline">
            Podrás modificar tus candidatos hasta el 27/06 a las 23.59 en la sección PRONÓSTICOS &gt; CANDIDATOS
        </div>
    </div>`;

    container.innerHTML = html;

    roles.forEach(r => updateFlagDisplay(r.key));
}

function buildReadOnlyView() {
    const picks = [
        { label: '1° CAMPEÓN',       name: currentPrediction.champion,  flag: currentPrediction.championFlag },
        { label: '2° SUBCAMPEÓN',    name: currentPrediction.runnerUp,  flag: currentPrediction.runnerUpFlag },
        { label: '3° TERCER PUESTO', name: currentPrediction.third,     flag: currentPrediction.thirdFlag },
        { label: '4° CUARTO PUESTO', name: currentPrediction.fourth,    flag: currentPrediction.fourthFlag },
    ];

    let html = `<div class="candidatos-form">`;
    picks.forEach(p => {
        html += `
            <div class="candidatos-row">
                <div class="candidatos-label">${p.label}</div>
                <div class="candidatos-select-wrap">
                    ${p.flag ? `<img src="${p.flag}" class="candidatos-flag" alt="">` : ''}
                    <span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--text-primary);">
                        ${p.name || '—'}
                    </span>
                </div>
            </div>`;
    });
    html += `
        <div class="candidatos-deadline">PRONÓSTICO GUARDADO</div>
    </div>`;
    return html;
}

function onSelectChange(key) {
    updateFlagDisplay(key);
    updateSaveButtonLabel();
}

function updateSaveButtonLabel() {
    const btn = document.querySelector('.candidatos-save-btn');
    if (!btn) return;
    const hasSavedChampion = !!(currentPrediction?.champion);
    if (!hasSavedChampion) {
        btn.textContent = 'GUARDAR PRONÓSTICO';
        btn.classList.remove('saved', 'update');
        return;
    }
    const keys = ['champion', 'runnerUp', 'third', 'fourth'];
    const hasChanges = keys.some(k => {
        const sel = document.getElementById(`sel-${k}`);
        const saved = currentPrediction?.[k] || '';
        return sel && sel.value !== saved;
    });
    if (hasChanges) {
        btn.textContent = 'ACTUALIZAR PRONÓSTICO';
        btn.classList.remove('saved');
        btn.classList.add('update');
    } else {
        btn.textContent = 'PRONÓSTICO GUARDADO';
        btn.classList.remove('update');
        btn.classList.add('saved');
    }
}

function updateFlagDisplay(key) {
    const sel = document.getElementById(`sel-${key}`);
    const flagImg = document.getElementById(`flag-${key}`);
    if (!sel || !flagImg) return;
    const selected = sel.options[sel.selectedIndex];
    if (selected && selected.dataset.flag) {
        flagImg.src = selected.dataset.flag;
        flagImg.style.display = 'block';
    } else {
        flagImg.style.display = 'none';
    }
}

async function saveCandidatos() {
    if (isPastDeadline()) {
        alert('El plazo para modificar candidatos ya venció (27/06)');
        return;
    }

    const champion  = document.getElementById('sel-champion')?.value  || null;
    const runnerUp  = document.getElementById('sel-runnerUp')?.value  || null;
    const third     = document.getElementById('sel-third')?.value     || null;
    const fourth    = document.getElementById('sel-fourth')?.value    || null;

    if (!champion) {
        alert('Tenés que elegir al menos el Campeón');
        return;
    }

    const names = [champion, runnerUp, third, fourth].filter(Boolean);
    if (new Set(names).size !== names.length) {
        alert('No podés elegir el mismo país en más de una posición');
        return;
    }

    const getFlag = key => {
        const sel = document.getElementById(`sel-${key}`);
        if (!sel) return null;
        const opt = sel.options[sel.selectedIndex];
        return opt?.dataset.flag || null;
    };

    const body = {
        champion,
        championFlag: getFlag('champion'),
        runnerUp,
        runnerUpFlag: getFlag('runnerUp'),
        third,
        thirdFlag: getFlag('third'),
        fourth,
        fourthFlag: getFlag('fourth')
    };

    const res = await fetch('/api/champion-prediction/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        currentPrediction = body;
        updateSaveButtonLabel();
        alert('¡Candidatos guardados!');
    } else {
        alert('Error al guardar. Intentá de nuevo.');
    }
}
