/* Pantallas de progreso: un juego con cada uno de sus niveles y un nivel en detalle. Solo dibujan:
   los datos salen de core/progress.js. Gráficos en SVG, una escala por eje; la única nota de color
   (--accent) es la media o la última partida. */
import { formatTime } from '../lib/format.js';
import { clean, meanTime, trend, inRange, movingAverage, timeStep, histogram, RANGES } from '../core/progress.js';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "hoy", "ayer", "8 oct" o "8 oct 2025". */
export function dayLabel(at, now = Date.now()){
  const d = new Date(at), n = new Date(now), day = x => Math.floor((x.getTime() - x.getTimezoneOffset() * 6e4) / 864e5);
  const ago = day(n) - day(d);
  if (ago === 0) return 'hoy';
  if (ago === 1) return 'ayer';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() === n.getFullYear() ? '' : ' ' + d.getFullYear()}`;
}

/** "38 min" / "9 h 40 min". */
const duration = s => s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.round(s % 3600 / 60)} min` : `${Math.max(1, Math.round(s / 60))} min`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Etiqueta de la tendencia (con flecha y palabras, no solo color). */
function trendHtml(tr){
  if (tr.kind === 'few') return '';
  if (tr.kind === 'same') return '<span class="pg-pill">= Como el mes pasado</span>';
  return tr.kind === 'faster'
    ? `<span class="pg-pill pg-pill--faster">↓ ${tr.pct} % más rápido</span>`
    : `<span class="pg-pill pg-pill--slower">↑ ${tr.pct} % más lento</span>`;
}

/** Línea pequeña de los últimos 20 tiempos sin pistas, con el último en --accent. */
function sparkSvg(entries, W = 300, H = 40){
  const c = clean(entries).slice(-20);
  if (c.length < 2) return '';
  const ts = c.map(e => e.t), lo = Math.min(...ts), hi = Math.max(...ts);
  const x = i => 4 + i * (W - 8) / (c.length - 1), y = v => 4 + (hi === lo ? .5 : (hi - v) / (hi - lo)) * (H - 8);
  const d = c.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(e.t).toFixed(1)}`).join('');
  return `<svg class="pg-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">` +
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
  const chips = `<div class="pg-chips" role="group" aria-label="Juego">` +
    games.map(g => `<button type="button" class="pg-chip" data-action="progress-game" data-pg-game="${g.id}" aria-pressed="${g.id === game}">${g.name}</button>`).join('') + `</div>`;
  const all = Object.values(stats), solved = all.reduce((n, s) => n + (s.solved || 0), 0);
  if (!solved && !rows.some(r => r.entries.length)){
    return chips + `<p class="pg-empty">Todavía no has resuelto ningún reto de ${name}. Cada uno que resuelvas aparecerá aquí, con su fecha y su tiempo.</p>`;
  }
  const secs = all.reduce((n, s) => n + (s.sum || 0), 0), records = rows.filter(r => r.best).length;
  const kpis = `<div class="pg-kpis">` +
    `<div class="pg-kpi"><b>${solved}</b><span>${solved === 1 ? 'resuelto' : 'resueltos'}</span></div>` +
    `<div class="pg-kpi"><b>${secs ? duration(secs) : '—'}</b><span>jugando</span></div>` +
    `<div class="pg-kpi"><b>${records}</b><span>${records === 1 ? 'récord' : 'récords'}</span></div></div>`;
  const body = rows.map(r => {
    const c = clean(r.entries), avg = meanTime(c), open = r.entries.length > 0;
    const meta = open
      ? `<span>${avg != null ? `Media ${formatTime(avg)} · ` : ''}${plural(r.entries.length, 'partida', 'partidas')}</span>${trendHtml(trend(r.entries, now))}`
      : `<span>${r.solved ? `${plural(r.solved, 'resuelto', 'resueltos')} antes de guardar fechas` : 'Sin resolver'}</span>`;
    return `<button type="button" class="pg-row" data-action="progress-level" data-key="${r.key}"${open ? '' : ' disabled'}>` +
      `<span class="pg-row__name display">${r.name.toUpperCase()}</span>` +
      `<span class="pg-row__best">${r.best ? `<b>${formatTime(r.best)}</b>récord` : ''}</span>` +
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
      `<text class="pg-axis pg-axis--best" x="${W - R}" y="${y(best) + 13}" text-anchor="end">Récord ${formatTime(best)}</text>`;
  }
  const c = clean(list);
  if (c.length > 1) s += `<path class="pg-avg" d="${movingAverage(c).map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)} ${y(p.t).toFixed(1)}`).join('')}"/>`;
  s += list.map(e => `<circle class="pg-pt${e.h ? ' is-hints' : ''}" cx="${x(e.at).toFixed(1)}" cy="${y(e.t).toFixed(1)}" r="${e.h ? 4 : 4.5}" data-t="${e.t}" data-at="${e.at}" data-h="${e.h}"/>`).join('');
  s += `<circle class="pg-hl" r="7" visibility="hidden"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tiempo de cada partida">${s}</svg>`;
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
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Partidas por tramo de tiempo, desde ${formatTime(start)} cada ${formatTime(step)}">${s}</svg>`;
}

/**
 * @param {object} m
 * @param {{ key, name, entries, best }} m.row
 * @param {string} m.range  clave de RANGES
 */
export function levelHtml({ row, range, now = Date.now() }){
  const list = inRange(row.entries, range, now), c = clean(list), avg = meanTime(c);
  const seg = `<div class="pg-seg" role="group" aria-label="Periodo">` +
    Object.entries(RANGES).map(([k, label]) => `<button type="button" data-action="progress-range" data-range="${k}" aria-pressed="${k === range}">${label}</button>`).join('') + `</div>`;
  const kpis = `<div class="pg-kpis">` +
    `<div class="pg-kpi"><b>${row.best ? formatTime(row.best) : '—'}</b><span>récord</span></div>` +
    `<div class="pg-kpi"><b>${avg != null ? formatTime(avg) : '—'}</b><span>media${range === 'all' ? '' : ' del periodo'}</span></div>` +
    `<div class="pg-kpi"><b>${list.length}</b><span>${list.length === 1 ? 'partida' : 'partidas'}</span></div></div>`;
  if (!list.length) return seg + kpis + `<p class="pg-empty">No hay partidas en este periodo.</p>`;
  const chart = list.length > 1
    ? `<div class="pg-chart" data-pg-chart>${chartSvg(list, row.best)}<div class="pg-tip" hidden></div></div>` +
      `<div class="pg-legend"><span><i class="pg-key-dot"></i>Partida</span><span><i class="pg-key-hollow"></i>Con pistas</span><span><i class="pg-key-avg"></i>Media de 5</span>${row.best ? '<span><i class="pg-key-best"></i>Récord</span>' : ''}</div>`
    : `<p class="pg-empty">Con una partida aún no hay gráfico: aparece desde la segunda.</p>`;
  const hist = c.length >= 3 ? `<hr class="pg-rule"><p class="pg-label">Cómo se reparten tus tiempos</p><div class="pg-chart">${histogramSvg(c)}</div>` : '';
  const avgAll = meanTime(clean(row.entries));
  const last = row.entries.slice(-8).reverse().map(e => {
    const tag = e.h ? `<span class="pg-pill">${plural(e.h, 'pista', 'pistas')}</span>`
      : e.t === row.best ? '<span class="pg-pill pg-pill--best">Récord</span>'
      : avgAll == null || e.t === avgAll ? ''
      : e.t < avgAll ? `<span class="pg-pill pg-pill--faster">↓ ${formatTime(avgAll - e.t)} bajo tu media</span>`
      : `<span class="pg-pill pg-pill--slower">↑ ${formatTime(e.t - avgAll)} sobre tu media</span>`;
    return `<div class="pg-game"><span class="pg-game__day">${dayLabel(e.at, now)}</span>` +
      `<span class="pg-game__t">${formatTime(e.t)}${Number.isInteger(e.m) ? `<small> · ${e.m} mov.</small>` : ''}</span>${tag}</div>`;
  }).join('');
  return seg + kpis + chart + hist + `<hr class="pg-rule"><p class="pg-label">Últimas partidas</p><div class="pg-games">${last}</div>`;
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
    tip.innerHTML = `<b>${formatTime(Number(best.dataset.t))}</b> · ${dayLabel(Number(best.dataset.at))}` + (h ? `<br>con ${plural(h, 'pista', 'pistas')}` : '');
    tip.style.left = `${cx / k}px`; tip.style.top = `${cy / k}px`; tip.hidden = false;
  };
  root.addEventListener('pointermove', show);
  root.addEventListener('pointerdown', show);
}
