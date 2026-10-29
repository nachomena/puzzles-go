/* The 12 Fit ball pieces and their 10 × 6 board (60 balls): 4 of 4 balls, 4 of 5 and 4 of 6, chosen
   for this game (they fill the board in 1200 ways). No DOM.
   A placed piece is { m, r, x, y } (lib/polyomino.js); cell i = y * W + x. */
import { createPacker, orientCells } from '../../../lib/polyomino.js';

export const W = 10, H = 6, CELLS = W * H;

/** Shape (balls [x, y]) and tone (CSS variable --ft-<hue>) of each piece. */
export const PIECES = Object.freeze([
  { name: 'I4', hue: 'navy',   cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { name: 'O4', hue: 'yellow', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { name: 'Z4', hue: 'green',  cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { name: 'L4', hue: 'sky',    cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { name: 'P5', hue: 'pink',   cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { name: 'T5', hue: 'orange', cells: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
  { name: 'X5', hue: 'red',    cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  { name: 'Z5', hue: 'lime',   cells: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { name: 'S6', hue: 'purple', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]] },
  { name: 'L6', hue: 'blue',   cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4]] },
  { name: 'T6', hue: 'aqua',   cells: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [1, 2]] },
  { name: 'J6', hue: 'maroon', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [2, 2]] }
].map(p => Object.freeze(p)));

export const ALL = PIECES.map((_, i) => i);

/** Fills by columns: the short side (6) first, much faster. */
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
