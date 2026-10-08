/* Dibujo de una pieza de Smart Circuit en SVG (unidades = casillas): cuerpo con las casillas unidas,
   un bisel por casilla para que se vea hecha de cubitos como la real (ui/cube-svg.js), caminos que
   llegan hasta el borde de la casilla (para enlazar con la pieza vecina) y puntos. */
import { DIR_BIT } from './engine/pieces.js';
import { cubeBody, cubeBevels } from '../../ui/cube-svg.js';

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

/**
 * Contenido de una pieza en unidades de casilla (0..w, 0..h): cuerpo, bisel, camino y puntos.
 * `halo`: contorno claro de la pieza elegida (un trazo bajo el cuerpo: solo asoma por fuera).
 */
export function pieceParts(o, { halo = false } = {}){
  const paths = o.cells.map(([x, y], k) => cellPath(x, y, o.masks[k])).join('');
  const dots = [...o.dots].map(k => `<circle cx="${o.cells[k][0] + .5}" cy="${o.cells[k][1] + .5}" r=".2"/>`).join('');
  const shape = cubeBody(o.cells, { gap: GAP, radius: R }), clip = `sc-clip-${++clipSeq}`;
  return `<defs><clipPath id="${clip}">${shape}</clipPath></defs>` +
    (halo ? `<g class="sc-piece__halo">${shape}</g>` : '') +
    `<g class="sc-piece__body">${shape}</g>` +
    `<g class="sc-piece__bevel" clip-path="url(#${clip})">${cubeBevels(o.cells, { gap: GAP, bevel: BEVEL })}</g>` +
    (paths ? `<path class="sc-piece__path" d="${paths}"/>` : '') +
    `<g class="sc-piece__dots">${dots}</g>`;
}

/** SVG suelto de una orientación (de engine/solver.js#orient), para la bandeja y el arrastre. */
export function pieceSvg(o){
  return `<svg class="sc-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${pieceParts(o)}</svg>`;
}
