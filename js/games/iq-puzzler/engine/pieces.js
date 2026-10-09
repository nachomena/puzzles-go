/* Las 12 piezas de bolas de Puzzler Pro y su tablero de 11 × 5 (55 bolas). Sin DOM.
   Una pieza colocada es { m, r, x, y } (lib/polyomino.js); casilla i = y * W + x. */
import { createPacker, orientCells } from '../../../lib/polyomino.js';

export const W = 11, H = 5, CELLS = W * H;

/** Forma (bolas [x, y]) y tono (variable CSS --iq-<hue>) de cada pieza. */
export const PIECES = Object.freeze([
  { name: 'L3', hue: 'sky',    cells: [[1, 0], [0, 1], [1, 1]] },
  { name: 'T4', hue: 'green',  cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { name: 'S4', hue: 'maroon', cells: [[1, 0], [0, 1], [1, 1], [0, 2]] },
  { name: 'L4', hue: 'navy',   cells: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  { name: 'W',  hue: 'purple', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { name: 'U',  hue: 'lime',   cells: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]] },
  { name: 'P',  hue: 'aqua',   cells: [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1]] },
  { name: 'F',  hue: 'orange', cells: [[1, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { name: 'V',  hue: 'blue',   cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
  { name: 'L5', hue: 'red',    cells: [[3, 0], [0, 1], [1, 1], [2, 1], [3, 1]] },
  { name: 'N',  hue: 'pink',   cells: [[2, 0], [3, 0], [0, 1], [1, 1], [2, 1]] },
  { name: 'Y',  hue: 'yellow', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1]] }
].map(p => Object.freeze(p)));

export const ALL = PIECES.map((_, i) => i);

/** Rellena por columnas: el lado corto (5) primero, mucho más rápido. */
export const packer = createPacker({ W, H, shapes: PIECES.map(p => p.cells), order: 'columns' });

export const orient = (piece, m, r) => orientCells(PIECES[piece].cells, m, r);

/** Índices de casilla de una pieza colocada, o null si se sale. */
export function cellsOf(piece, pose){
  const c = packer.cellsOf(piece, pose);
  return c && c.map(([x, y]) => y * W + x);
}

/** Postura de una pieza a partir de sus casillas [x, y] (o null si no es esa forma). */
export function poseFromCells(piece, cells){
  const key = JSON.stringify([...cells].sort((a, b) => a[1] - b[1] || a[0] - b[0]));
  const x0 = Math.min(...cells.map(c => c[0])), y0 = Math.min(...cells.map(c => c[1]));
  for (const o of packer.orientations[piece]){
    const pose = { m: o.m, r: o.r, x: x0, y: y0 };
    if (JSON.stringify(packer.cellsOf(piece, pose)) === key) return pose;
  }
  return null;
}
