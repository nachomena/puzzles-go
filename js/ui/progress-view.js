/* Pantallas de progreso: un juego con cada uno de sus niveles y un nivel en detalle. Solo dibujan:
   los datos salen de core/progress.js. Gráficos en SVG, una escala por eje; la única nota de color
   (--accent) es la media o la última partida. */
import { formatTime } from '../lib/format.js';
import { clean, meanTime, trend, inRange, movingAverage, timeStep, histogram, movesSummary, RANGES } from '../core/progress.js';
import { t } from '../i18n/index.js';

const MONTHS = t('progress.months');

/** "hoy", "ayer", "8 oct" o "8 oct 2025". */
export function dayLabel(at, now = Date.now()){
  const d = new Date(at), n = new Date(now), day = x => Math.floor((x.getTime() - x.getTimezoneOffset() * 6e4) / 864e5);
  const ago = day(n) - day(d);
  if (ago === 0) return t('progress.today');
  if (ago === 1) return t('progress.yesterday');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() === n.getFullYear() ? '' : ' ' + d.getFullYear()}`;
}

/** "38 min" / "9 h 40 min". */
const duration = s => s >= 3600 ? t('progress.hoursMinutes', { h: Math.floor(s / 3600), m: Math.round(s % 3600 / 60) }) : t('progress.minutesOnly', { m: Math.max(1, Math.round(s / 60)) });

/** Etiqueta de la tendencia (con flecha y palabras, no solo color). */
function trendHtml(tr){
  if (tr.kind === 'few') return '';
  if (tr.kind === 'same') return `<span class="pg-pill">${t('progress.trendSame')}</span>`;
  return tr.kind === 'faster'
    ? `<span class="pg-pill pg-pill--faster">${t('progress.trendFaster', { pct: tr.pct })}</span>`
    : `<span class="pg-pill pg-pill--slower">${t('progress.trendSlower', { pct: tr.pct })}</span>`;
}

/** Línea pequeña de los últimos `n` tiempos sin pistas, con el último en --accent ('' si hay menos de 2). */
export function sparkSvg(entries, { W = 300, H = 40, n = 20, cls = 'pg-spark' } = {}){
  const c = clean(entries).slice(-n);
  if (c.length < 2) return '';
  const ts = c.map(e => e.t), lo = Math.min(...ts), hi = Math.max(...ts);
  const x = i => 4 + i * (W - 8) / (c.length - 1), y = v => 4 + (hi === lo ? .5 : (hi - v) / (hi - lo)) * (H - 8);
  const d = c.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(e.t).toFixed(1)}`).join('');
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">` +
    `<path d="${d}" vector-effect="non-scaling-stroke"/>` +
    `<circle cx="${x(c.length - 1).toFixed(1)}" cy="${y(ts[ts.length - 1]).toFixed(1)}" r="4"/></svg>`;
}

/* ---------- Pantalla de un juego ---------- */

/**
 * @param {object} m
 * @param {{ id: string, name: string }[]} m.games   chips (todos los juegos)
 * @param {string} m.game   id del elegido
 * @param {string} m.name   su nombre
 * @param {object} m.stats  sus estadísticas
 * @param {{ key, name, entries, best, solved }[]} m.rows  (core/progress.js#progressRows)
 */
export function gameHtml({ games, game, name, stats, rows, now = Date.now() }){
  const chips = `<div class="pg-chips" role="group" aria-label="${t('progress.chipsAria')}">` +
    games.map(g => `<button type="button" class="pg-chip" data-action="progress-game" data-pg-game="${g.id}" aria-pressed="${g.id === game}">${g.name}</button>`).join('') + `</div>`;
  const all = Object.values(stats), solved = all.reduce((n, s) => n + (s.solved || 0), 0);
  if (!solved && !rows.some(r => r.entries.length)){
    return chips + `<p class="pg-empty">${t('progress.empty', { name })}</p>`;
  }
  const secs = all.reduce((n, s) => n + (s.sum || 0), 0), records = rows.filter(r => r.best).length;
  const kpis = `<div class="pg-kpis">` +
    `<div class="pg-kpi"><b>${solved}</b><span>${t('progress.solved', { n: solved })}</span></div>` +
    `<div class="pg-kpi"><b>${secs ? duration(secs) : '—'}</b><span>${t('progress.playing')}</span></div>` +
    `<div class="pg-kpi"><b>${records}</b><span>${t('progress.records', { n: records })}</span></div></div>`;
  const body = rows.map(r => {
    const c = clean(r.entries), avg = meanTime(c), open = r.entries.length > 0;
    const meta = open
      ? `<span>${avg != null ? t('progress.average', { time: formatTime(avg) }) : ''}${t('progress.games', { n: r.entries.length })}</span>${trendHtml(trend(r.entries, now))}`
      : `<span>${r.solved ? t('progress.solvedBefore', { n: r.solved }) : t('progress.unsolved')}</span>`;
    return `<button type="button" class="pg-row" data-action="progress-level" data-key="${r.key}"${open ? '' : ' disabled'}>` +
      `<span class="pg-row__name display">${r.name.toUpperCase()}</span>` +
      `<span class="pg-row__best">${r.best ? `<b>${formatTime(r.best)}</b>${t('progress.record')}` : ''}</span>` +
      sparkSvg(r.entries) +
      `<span class="pg-row__meta">${meta}</span></button>`;
  }).join('');
  return chips + kpis + `<div class="pg-rows">${body}</div>`;
}

/* ---------- Pantalla de un nivel ---------- */

/** Gráfico de cada partida (puntos; huecos con pistas), media de 5 y récord. */
function chartSvg(list, best){
  const W = 320, H = 180, L = 38, R = 6, T = 10, B = 24;
  const ts = list.map(e => e.t).concat(best ?? []), step = timeStep(Math.min(...ts), Math.max(...ts));
  const lo = Math.floor(Math.min(...ts) / step) * step, hi = Math.max(lo + step, Math.ceil(Math.max(...ts) / step) * step);
  const x0 = list[0].at, x1 = list[list.length - 1].at;
  const x = at => L + (x1 === x0 ? .5 : (at - x0) / (x1 - x0)) * (W - L - R), y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let s = '';
  for (let v = lo; v <= hi; v += step) s += `<line class="pg-grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="pg-axis" x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end">${formatTime(v)}</text>`;
  const ticks = x1 === x0 ? [[x0, 'middle']] : [[x0, 'start'], [x1, 'end']];
  for (const [at, a] of ticks) s += `<text class="pg-axis" x="${x(at)}" y="${H - 6}" text-anchor="${a}">${dayLabel(at)}</text>`;
  if (best){
    s += `<line class="pg-best" x1="${L}" x2="${W - R}" y1="${y(best)}" y2="${y(best)}"/>` +
      // debajo de la raya si cabe; si no (récord en el fondo del eje), encima, para no pisar las fechas
      `<text class="pg-axis pg-axis--best" x="${W - R}" y="${y(best) + 13 <= H - B - 2 ? y(best) + 13 : y(best) - 5}" text-anchor="end">${t('progress.recordLine', { time: formatTime(best) })}</text>`;
  }
  const c = clean(list);
  if (c.length > 1) s += `<path class="pg-avg" d="${movingAverage(c).map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)} ${y(p.t).toFixed(1)}`).join('')}"/>`;
  s += list.map(e => `<circle class="pg-pt${e.h ? ' is-hints' : ''}" cx="${x(e.at).toFixed(1)}" cy="${y(e.t).toFixed(1)}" r="${e.h ? 4 : 4.5}" data-t="${e.t}" data-at="${e.at}" data-h="${e.h}"/>`).join('');
  s += `<circle class="pg-hl" r="7" visibility="hidden"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('progress.chartAria')}">${s}</svg>`;
}

/** Columnas: cuántas partidas sin pistas caen en cada tramo de tiempo; la de la última, en --accent. */
function histogramSvg(c){
  const ts = c.map(e => e.t), step = timeStep(Math.min(...ts), Math.max(...ts)), { start, counts } = histogram(ts, step);
  const W = 320, H = 110, B = 20, T = 16, slot = (W - 8) / counts.length, bw = Math.min(24, slot - 2), max = Math.max(...counts);
  const last = Math.floor((ts[ts.length - 1] - start) / step);
  let s = '';
  counts.forEach((n, i) => {
    const cx = 4 + slot * i + slot / 2;
    if (n){
      const top = H - B - Math.max(4, n / max * (H - B - T)), r = Math.min(4, bw / 2);
      s += `<path class="pg-bar${i === last ? ' is-last' : ''}" d="M${cx - bw / 2} ${H - B}V${top + r}q0 -${r} ${r} -${r}H${cx + bw / 2 - r}q${r} 0 ${r} ${r}V${H - B}Z"/>` +
        `<text class="pg-axis" x="${cx}" y="${top - 4}" text-anchor="middle">${n}</text>`;
    }
    if (counts.length <= 8 || i % 2 === 0) s += `<text class="pg-axis" x="${cx}" y="${H - 6}" text-anchor="middle">${formatTime(start + i * step)}</text>`;
  });
  s += `<line class="pg-base" x1="4" x2="${W - 4}" y1="${H - B}" y2="${H - B}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('progress.histAria', { from: formatTime(start), step: formatTime(step) })}">${s}</svg>`;
}

/** Rush Hour y otros que cuentan movimientos: cuántos de más en cada partida (sin barra = los justos). */
function movesHtml(entries){
  const s = movesSummary(entries);
  if (!s) return '';
  const games = s.games.slice(-16), max = Math.max(2, ...games.map(g => g.extra)), stepY = max > 6 ? Math.ceil(max / 3) : 2, top = Math.ceil(max / stepY) * stepY;
  const W = 320, H = 110, L = 28, B = 20, T = 12, slot = (W - L) / games.length, bw = Math.min(14, slot - 2);
  const y = v => H - B - v / top * (H - B - T);
  let svg = '';
  for (let v = 0; v <= top; v += stepY) svg += `<line class="pg-grid" x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text class="pg-axis" x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end">+${v}</text>`;
  games.forEach((g, i) => {
    const cx = L + slot * i + slot / 2, last = i === games.length - 1;
    if (g.extra){
      const r = Math.min(4, bw / 2);
      svg += `<path class="pg-bar${last ? ' is-last' : ''}" d="M${cx - bw / 2} ${y(0)}V${y(g.extra) + r}q0 -${r} ${r} -${r}H${cx + bw / 2 - r}q${r} 0 ${r} ${r}V${y(0)}Z"/>`;
    } else svg += `<circle class="pg-perfect${last ? ' is-last' : ''}" cx="${cx}" cy="${y(0)}" r="4"/>`;
  });
  svg += `<text class="pg-axis" x="${L}" y="${H - 4}">${games.length > 1 ? t('progress.gamesAgo', { n: games.length }) : ''}</text><text class="pg-axis" x="${W}" y="${H - 4}" text-anchor="end">${t('progress.lastOne')}</text>`;
  const n = s.games.length;
  return `<hr class="pg-rule"><p class="pg-label">${t('progress.extraMoves')}</p>` +
    `<div class="pg-kpis"><div class="pg-kpi"><b>${t('progress.perfectOf', { a: s.perfect, n })}</b><span>${t('progress.perfect')}</span></div>` +
    `<div class="pg-kpi"><b>+${s.avgExtra.toFixed(1).replace('.', t('progress.decimal'))}</b><span>${t('progress.extraAvg')}</span></div>` +
    `<div class="pg-kpi"><b>${Math.round(s.avgMoves)}</b><span>${t('progress.avgMoves')}</span></div></div>` +
    `<div class="pg-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('progress.movesAria', { n: games.length })}">${svg}</svg></div>` +
    `<p class="pg-note">${t('progress.movesNote')}</p>`;
}

/** Desglose que da el propio juego (meta.progressBreakdown), p. ej. Katamino: el PENTA en cada desafío. */
function breakdownHtml(meta, stats, row){
  const b = meta?.progressBreakdown?.(row.key, stats);
  if (!b?.items.length) return '';
  return `<hr class="pg-rule"><p class="pg-label">${b.title}</p><div class="pg-games">` +
    b.items.map(it => `<div class="pg-game pg-game--wide"><span class="pg-game__name">${it.name}</span>` +
      `<span class="pg-game__t">${it.best ? formatTime(it.best) : '—'}</span>${it.best ? '' : `<span class="pg-pill">${t('progress.withHints')}</span>`}</div>`).join('') + `</div>`;
}

/**
 * @param {object} m
 * @param {{ key, name, entries, best }} m.row
 * @param {string} m.range  clave de RANGES
 * @param {object} [m.meta]   datos del juego (para su desglose propio)
 * @param {object} [m.stats]  sus estadísticas
 */
export function levelHtml({ row, range, meta, stats = {}, now = Date.now() }){
  const list = inRange(row.entries, range, now), c = clean(list), avg = meanTime(c);
  const seg = `<div class="pg-seg" role="group" aria-label="${t('progress.rangeAria')}">` +
    Object.entries(RANGES).map(([k, label]) => `<button type="button" data-action="progress-range" data-range="${k}" aria-pressed="${k === range}">${label}</button>`).join('') + `</div>`;
  const kpis = `<div class="pg-kpis">` +
    `<div class="pg-kpi"><b>${row.best ? formatTime(row.best) : '—'}</b><span>${t('progress.record')}</span></div>` +
    `<div class="pg-kpi"><b>${avg != null ? formatTime(avg) : '—'}</b><span>${t(range === 'all' ? 'progress.avgLabel' : 'progress.avgPeriod')}</span></div>` +
    `<div class="pg-kpi"><b>${list.length}</b><span>${t('progress.gamesWord', { n: list.length })}</span></div></div>`;
  if (!list.length) return seg + kpis + `<p class="pg-empty">${t('progress.noneInRange')}</p>`;
  const chart = list.length > 1
    ? `<div class="pg-chart" data-pg-chart>${chartSvg(list, row.best)}<div class="pg-tip" hidden></div></div>` +
      `<div class="pg-legend"><span><i class="pg-key-dot"></i>${t('progress.legendGame')}</span><span><i class="pg-key-hollow"></i>${t('progress.legendHints')}</span><span><i class="pg-key-avg"></i>${t('progress.legendAvg')}</span>${row.best ? `<span><i class="pg-key-best"></i>${t('progress.legendRecord')}</span>` : ''}</div>`
    : `<p class="pg-empty">${t('progress.oneGame')}</p>`;
  const hist = c.length >= 3 ? `<hr class="pg-rule"><p class="pg-label">${t('progress.spread')}</p><div class="pg-chart">${histogramSvg(c)}</div>` : '';
  const avgAll = meanTime(clean(row.entries));
  const last = row.entries.slice(-8).reverse().map(e => {
    const tag = e.h ? `<span class="pg-pill">${t('progress.hints', { n: e.h })}</span>`
      : e.t === row.best ? `<span class="pg-pill pg-pill--best">${t('progress.recordPill')}</span>`
      : avgAll == null || e.t === avgAll ? ''
      : e.t < avgAll ? `<span class="pg-pill pg-pill--faster">${t('progress.belowAvg', { time: formatTime(avgAll - e.t) })}</span>`
      : `<span class="pg-pill pg-pill--slower">${t('progress.aboveAvg', { time: formatTime(e.t - avgAll) })}</span>`;
    return `<div class="pg-game"><span class="pg-game__day">${dayLabel(e.at, now)}</span>` +
      `<span class="pg-game__t">${formatTime(e.t)}${Number.isInteger(e.m) ? `<small> · ${t('progress.moves', { n: e.m })}</small>` : ''}</span>${tag}</div>`;
  }).join('');
  return seg + kpis + chart + movesHtml(list) + breakdownHtml(meta, stats, row) + hist +
    `<hr class="pg-rule"><p class="pg-label">${t('progress.last')}</p><div class="pg-games">${last}</div>`;
}

/** Al tocar o pasar por el gráfico, la partida más cercana: su tiempo y su fecha. */
export function bindChartTips(root){
  const show = e => {
    const chart = e.target.closest?.('[data-pg-chart]');
    if (!chart) return;
    const svg = chart.querySelector('svg'), tip = chart.querySelector('.pg-tip'), hl = chart.querySelector('.pg-hl');
    const r = svg.getBoundingClientRect(), k = 320 / r.width, px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k;
    let best = null, bd = 26;
    for (const c of chart.querySelectorAll('.pg-pt')){
      const d = Math.hypot(c.cx.baseVal.value - px, (c.cy.baseVal.value - py) * .6);
      if (d < bd){ bd = d; best = c; }
    }
    if (!best){ tip.hidden = true; hl.setAttribute('visibility', 'hidden'); return; }
    const cx = best.cx.baseVal.value, cy = best.cy.baseVal.value, h = Number(best.dataset.h);
    hl.setAttribute('cx', cx); hl.setAttribute('cy', cy); hl.setAttribute('visibility', 'visible');
    tip.innerHTML = `<b>${formatTime(Number(best.dataset.t))}</b> · ${dayLabel(Number(best.dataset.at))}` + (h ? `<br>${t('progress.tipHints', { n: h })}` : '');
    tip.style.left = `${cx / k}px`; tip.style.top = `${cy / k}px`; tip.hidden = false;
  };
  root.addEventListener('pointermove', show);
  root.addEventListener('pointerdown', show);
}
