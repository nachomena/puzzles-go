/* Drawing of a Circuit piece in SVG (units = cells): a body with the cells joined, a bevel per cell so
   it looks made of little cubes like the real one (ui/cube-svg.js), paths that reach the cell's edge
   (to link with the neighbouring piece) and dots. */
import { DIR_BIT } from './engine/pieces.js';
import { cubeBody, cubeBevels } from '../../ui/cube-svg.js';

const GAP = .07, R = .16, BEVEL = .1;
let clipSeq = 0;
const EDGE = { N: [.5, 0], E: [1, .5], S: [.5, 1], W: [0, .5] };

/** Stroke of the path inside a cell according to its exits. */
export function cellPath(x, y, mask){
  const dirs = Object.keys(DIR_BIT).filter(d => mask & DIR_BIT[d]);
  if (!dirs.length) return '';
  const pt = d => `${x + EDGE[d][0]} ${y + EDGE[d][1]}`, c = `${x + .5} ${y + .5}`;
  if (dirs.length === 1) return `M${c}L${pt(dirs[0])}`;
  const [a, b] = dirs;
  const straight = (a === 'N' && b === 'S') || (a === 'E' && b === 'W');
  return straight ? `M${pt(a)}L${pt(b)}` : `M${pt(a)}Q${c} ${pt(b)}`;
}

/**
 * Content of a piece in cell units (0..w, 0..h): body, bevel, path and dots.
 * `halo`: light outline of the picked piece (a stroke under the body: it only shows outside).
 */
export function pieceParts(o, { halo = false } = {}){
  const paths = o.cells.map(([x, y], k) => cellPath(x, y, o.masks[k])).join('');
  const dots = [...o.dots].map(k => `<circle cx="${o.cells[k][0] + .5}" cy="${o.cells[k][1] + .5}" r=".2"/>`).join('');
  const shape = cubeBody(o.cells, { gap: GAP, radius: R }), clip = `ct-clip-${++clipSeq}`;
  return `<defs><clipPath id="${clip}">${shape}</clipPath></defs>` +
    (halo ? `<g class="ct-piece__halo">${shape}</g>` : '') +
    `<g class="ct-piece__body">${shape}</g>` +
    `<g class="ct-piece__bevel" clip-path="url(#${clip})">${cubeBevels(o.cells, { gap: GAP, bevel: BEVEL })}</g>` +
    (paths ? `<path class="ct-piece__path" d="${paths}"/>` : '') +
    `<g class="ct-piece__dots">${dots}</g>`;
}

/** Loose SVG of an orientation (from engine/solver.js#orient), for the tray and the drag. */
export function pieceSvg(o){
  return `<svg class="ct-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${pieceParts(o)}</svg>`;
}
