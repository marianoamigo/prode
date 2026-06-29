const BC_SLOT   = 68;
const BC_CARD_H = 62;
const BC_CARD_W = 210;
const BC_CONN_W = 14;
const BC_TOTAL_H = 16 * BC_SLOT; // 1088

function renderBracketSection(allMatches) {
    const section = document.getElementById('bracketSection');
    if (!section) return;

    const byStage = stage => allMatches
        .filter(m => m.stage === stage)
        .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));

    const r32 = byStage('ROUND_OF_32');
    const r16 = byStage('ROUND_OF_16');
    const qf  = byStage('QUARTER_FINAL');
    const sf  = byStage('SEMI_FINAL');
    const fin = byStage('FINAL');
    const trd = byStage('THIRD_PLACE');

    const colR32 = buildBracketRound(r32, BC_SLOT,      'b-r32');
    const con1   = buildConnectorSVG(8,   BC_SLOT);
    const colR16 = buildBracketRound(r16, BC_SLOT * 2,  'b-r16');
    const con2   = buildConnectorSVG(4,   BC_SLOT * 2);
    const colQF  = buildBracketRound(qf,  BC_SLOT * 4,  'b-qf');
    const con3   = buildConnectorSVG(2,   BC_SLOT * 4);
    const colSF  = buildBracketRound(sf,  BC_SLOT * 8,  'b-sf');
    const con4   = buildConnectorSVG(1,   BC_SLOT * 8);
    const colFin = buildFinalColumn(fin, trd);

    const step = BC_CARD_W + BC_CONN_W;
    const nav = `
      <div class="b-nav">
        <button class="b-nav-btn" onclick="scrollBracketTo(0)">16AVOS</button>
        <button class="b-nav-btn" onclick="scrollBracketTo(${step})">OCTAVOS</button>
        <button class="b-nav-btn" onclick="scrollBracketTo(${step * 2})">CUARTOS</button>
        <button class="b-nav-btn" onclick="scrollBracketTo(${step * 3})">SEMIS</button>
        <button class="b-nav-btn" onclick="scrollBracketTo(${step * 4})">FINAL</button>
      </div>`;

    section.innerHTML = `
      ${nav}
      <div id="bracketWrap" class="b-wrap">
        <div class="b-inner">
          ${colR32}${con1}${colR16}${con2}${colQF}${con3}${colSF}${con4}${colFin}
        </div>
      </div>`;
}

function scrollBracketTo(left) {
    const wrap = document.getElementById('bracketWrap');
    if (wrap) wrap.scrollTo({ left, behavior: 'smooth' });
}

function buildBracketRound(matches, slotH, id) {
    let cards = '';
    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const cardTop = i * slotH + Math.floor((slotH - BC_CARD_H) / 2);
        cards += `<div style="position:absolute;top:${cardTop}px;left:0;right:0;height:${BC_CARD_H}px;">${buildBracketCard(m)}</div>`;
    }
    return `<div id="${id}" style="position:relative;height:${BC_TOTAL_H}px;width:${BC_CARD_W}px;flex-shrink:0;">${cards}</div>`;
}

function buildFinalColumn(fin, trd) {
    const finMatch = fin[0];
    const trdMatch = trd[0];

    // Final: centered in the full column height (aligns with SF connector midpoint)
    const finCenter = Math.floor(BC_TOTAL_H / 2);               // 544
    const finTop    = finCenter - Math.floor(BC_CARD_H / 2);    // 513

    // 3rd place: aligned with QF match 3 (index 2, 0-based = 2nd from bottom)
    const qfSlot    = BC_SLOT * 4;                              // 272
    const trdCenter = qfSlot * 2 + Math.floor(qfSlot / 2);     // 680
    const trdLabelH = 20;
    const trdTop    = trdCenter - Math.floor(BC_CARD_H / 2) - trdLabelH; // 629

    let content = '';
    if (finMatch) {
        const finLabelTop = finTop - 20;
        content += `<div style="position:absolute;top:${finLabelTop}px;left:0;right:0;font-size:9px;font-weight:700;letter-spacing:.08em;color:#FFD700;text-align:center;line-height:16px;">FINAL</div>`;
        content += `<div style="position:absolute;top:${finTop}px;left:0;right:0;height:${BC_CARD_H}px;">${buildBracketCard(finMatch)}</div>`;
    }
    if (trdMatch) {
        const cardTop = trdCenter - Math.floor(BC_CARD_H / 2); // 649
        content += `<div style="position:absolute;top:${trdTop}px;left:0;right:0;font-size:9px;font-weight:700;letter-spacing:.08em;color:var(--text-muted);text-align:center;line-height:16px;">3ER PUESTO</div>`;
        content += `<div style="position:absolute;top:${cardTop}px;left:0;right:0;height:${BC_CARD_H}px;">${buildBracketCard(trdMatch)}</div>`;
    }

    return `<div style="width:${BC_CARD_W}px;flex-shrink:0;position:relative;height:${BC_TOTAL_H}px;">${content}</div>`;
}

function buildConnectorSVG(pairs, slotH) {
    const w = BC_CONN_W, mid = Math.floor(w / 2);
    let lines = '';
    for (let j = 0; j < pairs; j++) {
        const y1 = Math.floor(slotH * (2 * j) + slotH / 2);
        const y2 = Math.floor(slotH * (2 * j + 1) + slotH / 2);
        const ym = Math.floor((y1 + y2) / 2);
        lines += `<line x1="0" y1="${y1}" x2="${mid}" y2="${y1}" stroke="#3a4f72" stroke-width="1.5"/>`;
        lines += `<line x1="0" y1="${y2}" x2="${mid}" y2="${y2}" stroke="#3a4f72" stroke-width="1.5"/>`;
        lines += `<line x1="${mid}" y1="${y1}" x2="${mid}" y2="${y2}" stroke="#3a4f72" stroke-width="1.5"/>`;
        lines += `<line x1="${mid}" y1="${ym}" x2="${w}" y2="${ym}" stroke="#3a4f72" stroke-width="1.5"/>`;
    }
    return `<svg width="${w}" height="${BC_TOTAL_H}" viewBox="0 0 ${w} ${BC_TOTAL_H}" style="flex-shrink:0;">${lines}</svg>`;
}

function buildBracketCard(match) {
    const n = match.matchNumber;
    const [homeSrc, awaySrc] = getBracketSources(n);

    const hasScore  = match.homeScore !== null && match.homeScore !== undefined;
    const hasPen    = match.homePenaltyScore !== null && match.homePenaltyScore !== undefined;
    const isLive    = match.status === 'LIVE';

    // Penalty tiebreaker: if scores are equal and penalties exist, penaltyScore determines winner
    const isWinHome = hasScore && (
        match.homeScore > match.awayScore ||
        (match.homeScore === match.awayScore && hasPen && match.homePenaltyScore > match.awayPenaltyScore)
    );
    const isWinAway = hasScore && (
        match.awayScore > match.homeScore ||
        (match.awayScore === match.homeScore && hasPen && match.awayPenaltyScore > match.homePenaltyScore)
    );

    const isFinished = match.status === 'FINISHED';
    const srcPrefix  = match.stage === 'THIRD_PLACE' ? 'P' : 'G';

    const homeRow = buildBcTeamRow(match.homeTeam, match.homeFlagUrl, homeSrc,
        hasScore ? match.homeScore : null, hasPen ? match.homePenaltyScore : null, isWinHome, isLive, srcPrefix);
    const awayRow = buildBcTeamRow(match.awayTeam, match.awayFlagUrl, awaySrc,
        hasScore ? match.awayScore : null, hasPen ? match.awayPenaltyScore : null, isWinAway, isLive, srcPrefix);

    const cls      = 'bc-card' + (isLive ? ' bc-live' : '');
    const numBadge = n ? `<span class="bc-num">${n}</span>` : '';

    let dateRow;
    if (isLive) {
        dateRow = `<div class="bc-date-row" style="color:var(--accent);font-weight:700;">EN JUEGO</div>`;
    } else if (isFinished) {
        dateRow = `<div class="bc-date-row">FINALIZADO</div>`;
    } else {
        const dateStr = formatBracketDate(match.dateTime);
        dateRow = dateStr ? `<div class="bc-date-row">${dateStr}</div>` : '';
    }

    return `<div class="${cls}">${dateRow}${numBadge}<div class="bc-row">${homeRow}</div><div class="bc-divider"></div><div class="bc-row">${awayRow}</div></div>`;
}

function formatBracketDate(dt) {
    if (!dt) return '';
    const dias  = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const d = new Date(dt);
    const h   = String(d.getHours()).padStart(2,'0');
    const min = String(d.getMinutes()).padStart(2,'0');
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} ${h}:${min}`;
}

function buildBcTeamRow(teamName, flagUrl, srcNum, score, penScore, isWinner, isLive, srcPrefix = 'G') {
    let scoreText = '';
    if (score !== null && score !== undefined) {
        scoreText = penScore !== null && penScore !== undefined
            ? `${score}(${penScore})`
            : `${score}`;
    }
    const scoreEl = scoreText
        ? `<span class="bc-score${isWinner ? ' bc-score-win' : ''}${isLive ? ' bc-score-live' : ''}">${scoreText}</span>`
        : '';

    if (teamName) {
        let displayName = teamName.toUpperCase();
        if (displayName === 'BOSNIA HERZEGOVINA') displayName = 'BOSNIA';
        const flag = flagUrl ? `<img src="${flagUrl}" class="bc-flag" alt="">` : '';
        return `<a href="/pages/team-results.html?team=${encodeURIComponent(teamName)}" class="bc-team${isWinner ? ' bc-winner' : ''}" style="text-decoration:none;color:inherit;">${flag}<span class="bc-name">${displayName}</span></a>${scoreEl}`;
    }
    return `<div class="bc-team"><span class="bc-tbd">${srcPrefix}.${srcNum || '?'}</span></div>${scoreEl}`;
}

function getBracketSources(n) {
    if (!n) return [null, null];
    if (n >= 17 && n <= 24) { const i = n - 17; return [2*i+1, 2*i+2]; }
    if (n >= 25 && n <= 28) { const i = n - 25; return [2*i+17, 2*i+18]; }
    if (n >= 29 && n <= 30) { const i = n - 29; return [2*i+25, 2*i+26]; }
    if (n === 31 || n === 32) return [29, 30];
    return [null, null];
}
