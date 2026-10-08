/* Los 12 pentominós de Katamino y sus orientaciones. Sin DOM.
   El tablero es de W = 5 columnas por n filas (n = número de piezas del PENTA): casilla i = y * W + x.
   Una pieza colocada es { m, r, x, y }: m = cara (0, 1 = volteada), r = giro de 90° (0..3) y
   (x, y) la esquina superior izquierda de su caja (lib/polyomino.js). */
import { orientCells, orientationsOf } from '../../../lib/polyomino.js';

export const W = 5;
/** Tamaños de PENTA posibles (filas del tablero). */
export const MIN_N = 3, MAX_N = 12;

/** Forma (casillas [x, y]) y tono (variable CSS --km-<hue>) de cada pieza, en el orden de la caja. */
export const PIECES = Object.freeze([
  { name: 'I', hue: 'navy',   cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
  { name: 'L', hue: 'orange', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  { name: 'Y', hue: 'maroon', cells: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]] },
  { name: 'N', hue: 'purple', cells: [[1, 0], [1, 1], [0, 2], [1, 2], [0, 3]] },
  { name: 'V', hue: 'blue',   cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
  { name: 'P', hue: 'pink',   cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { name: 'U', hue: 'yellow', cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  { name: 'Z', hue: 'aqua',   cells: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { name: 'F', hue: 'gray',   cells: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] },
  { name: 'T', hue: 'green',  cells: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
  { name: 'W', hue: 'lime',   cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { name: 'X', hue: 'red',    cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] }
].map(p => Object.freeze(p)));

/**
 * Casillas [x, y] de una pieza con cara `m` y giro `r`, desde la esquina de su caja y en orden de
 * lectura, con su ancho y alto.
 */
export const orient = (piece, m, r) => orientCells(PIECES[piece].cells, m, r);

/** Orientaciones distintas de cada pieza: [{ m, r, cells, w, h }] (las repetidas por simetría se quitan). */
export const ORIENTATIONS = PIECES.map(p => orientationsOf(p.cells));

/** Casillas (índices) de una pieza colocada en un tablero de n filas, o null si se sale. */
export function cellsOf(piece, { m, r, x, y }, n){
  const o = orient(piece, m, r);
  if (x < 0 || y < 0 || x + o.w > W || y + o.h > n) return null;
  return o.cells.map(([a, b]) => (y + b) * W + x + a);
}
