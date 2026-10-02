/* Dibujo de una pieza de Smart Circuit en SVG (unidades = casillas): cuerpo con las casillas unidas,
   un bisel por casilla para que se vea hecha de cubitos como la real, caminos que llegan hasta el
   borde de la casilla (para enlazar con la pieza vecina) y puntos. */
import { DIR_BIT } from './engine/pieces.js';

const GAP = .07, R = .16, BEVEL = .1;
let clipSeq = 0;
const EDGE = { N: [.5, 0], E: [1, .5], S: [.5, 1], W: [0, .5] };

/** Trazo del camino dentro de una casilla según sus salidas. */
export function cellPath(x, y, mask){
  const dirs = Object.keys(DIR_BIT).filter(d => mask & DIR_BIT[d]);
  if (!dirs.length) return '';
  const pt = d => `${x + EDGE[d][0]} ${y + EDGE[d][1]}`, c = `${x + .5} ${y + .5}`;
  if (dirs.length === 1) return `M${c}L${pt(dirs[0])}`;
  const [a, b] = dirs;
  const straight = (a === 'N' && b === 'S') || (a === 'E' && b === 'W');
  return straight ? `M${pt(a)}L${pt(b)}` : `M${pt(a)}Q${c} ${pt(b)}`;
}

/** Cuerpo de la pieza: una casilla redondeada por celda y puentes entre celdas vecinas. */
function body(cells){
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  let out = '';
  for (const [x, y] of cells){
    out += `<rect x="${x + GAP}" y="${y + GAP}" width="${1 - 2 * GAP}" height="${1 - 2 * GAP}" rx="${R}"/>`;
    if (set.has(`${x + 1},${y}`)) out += `<rect x="${x + .5}" y="${y + GAP}" width="1" height="${1 - 2 * GAP}"/>`;
    if (set.has(`${x},${y + 1}`)) out += `<rect x="${x + GAP}" y="${y + .5}" width="${1 - 2 * GAP}" height="1"/>`;
    // donde se juntan cuatro casillas de la misma pieza (bloque 2×2) se rellena el centro
    if (set.has(`${x + 1},${y}`) && set.has(`${x},${y + 1}`) && set.has(`${x + 1},${y + 1}`)) out += `<rect x="${x + .5}" y="${y + .5}" width="1" height="1"/>`;
  }
  return out;
}

/**
 * Bisel de cada cubito: cuatro trapecios entre el borde del cubito y su cara (claros arriba y a la
 * izquierda, oscuros abajo y a la derecha) y la cara un poco hundida. Hacia una casilla vecina de la
 * misma pieza el cubito llega hasta el borde, así la unión se ve como una junta entre dos cubos.
 */
function bevels(cells){
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  const out = { top: '', left: '', bottom: '', right: '', face: '' };
  const quad = (...p) => `M${p.map(([a, b]) => `${+a.toFixed(3)} ${+b.toFixed(3)}`).join('L')}Z`;
  for (const [x, y] of cells){
    const x0 = x + (set.has(`${x - 1},${y}`) ? 0 : GAP), x1 = x + 1 - (set.has(`${x + 1},${y}`) ? 0 : GAP);
    const y0 = y + (set.has(`${x},${y - 1}`) ? 0 : GAP), y1 = y + 1 - (set.has(`${x},${y + 1}`) ? 0 : GAP);
    const i0 = x0 + BEVEL, i1 = x1 - BEVEL, j0 = y0 + BEVEL, j1 = y1 - BEVEL;
    out.top    += quad([x0, y0], [x1, y0], [i1, j0], [i0, j0]);
    out.left   += quad([x0, y0], [i0, j0], [i0, j1], [x0, y1]);
    out.bottom += quad([x0, y1], [i0, j1], [i1, j1], [x1, y1]);
    out.right  += quad([x1, y0], [x1, y1], [i1, j1], [i1, j0]);
    out.face   += quad([i0, j0], [i1, j0], [i1, j1], [i0, j1]);
  }
  return Object.entries(out).map(([k, d]) => `<path class="sc-bevel--${k}" d="${d}"/>`).join('');
}

/** SVG completo de una orientación (de engine/solver.js#orient). */
export function pieceSvg(o){
  const paths = o.cells.map(([x, y], k) => cellPath(x, y, o.masks[k])).join('');
  const dots = [...o.dots].map(k => `<circle cx="${o.cells[k][0] + .5}" cy="${o.cells[k][1] + .5}" r=".2"/>`).join('');
  const shape = body(o.cells), clip = `sc-clip-${++clipSeq}`;
  return `<svg class="sc-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">` +
    `<defs><clipPath id="${clip}">${shape}</clipPath></defs>` +
    `<g class="sc-piece__body">${shape}</g>` +
    `<g class="sc-piece__bevel" clip-path="url(#${clip})">${bevels(o.cells)}</g>` +
    (paths ? `<path class="sc-piece__path" d="${paths}"/>` : '') +
    `<g class="sc-piece__dots">${dots}</g></svg>`;
}
