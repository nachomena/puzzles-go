/* The 12 Fit ball pieces and their 11 × 5 board (55 balls). No DOM.
   A placed piece is { m, r, x, y } (lib/polyomino.js); cell i = y * W + x. */
import { createPacker, orientCells } from '../../../lib/polyomino.js';

export const W = 11, H = 5, CELLS = W * H;

/** Shape (balls [x, y]) and tone (CSS variable --ft-<hue>) of each piece. */
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

/** Fills by columns: the short side (5) first, much faster. */
export const packer = createPacker({ W, H, shapes: PIECES.map(p => p.cells), order: 'columns' });

export const orient = (piece, m, r) => orientCells(PIECES[piece].cells, m, r);

/** Cell indices of a placed piece, or null if it goes off the board. */
export function cellsOf(piece, pose){
  const c = packer.cellsOf(piece, pose);
  return c && c.map(([x, y]) => y * W + x);
}

/** Pose of a piece from its cells [x, y] (or null if it isn't that shape). */
export function poseFromCells(piece, cells){
  const key = JSON.stringify([...cells].sort((a, b) => a[1] - b[1] || a[0] - b[0]));
  const x0 = Math.min(...cells.map(c => c[0])), y0 = Math.min(...cells.map(c => c[1]));
  for (const o of packer.orientations[piece]){
    const pose = { m: o.m, r: o.r, x: x0, y: y0 };
    if (JSON.stringify(packer.cellsOf(piece, pose)) === key) return pose;
  }
  return null;
}
