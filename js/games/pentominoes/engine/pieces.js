/* The 12 pentominoes and their orientations. No DOM.
   The board is W = 5 columns by n rows (n = the puzzle's number of pieces): cell i = y * W + x.
   A placed piece is { m, r, x, y }: m = side (0, 1 = flipped), r = 90° rotation (0..3) and (x, y) the
   top-left corner of its box (lib/polyomino.js). */
import { orientCells, orientationsOf } from '../../../lib/polyomino.js';

export const W = 5;
/** Possible puzzle sizes (board rows). */
export const MIN_N = 3, MAX_N = 12;

/** Shape (cells [x, y]) and tone (CSS variable --pt-<hue>) of each piece, in box order. */
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
 * Cells [x, y] of a piece with side `m` and rotation `r`, from the corner of its box and in reading
 * order, with its width and height.
 */
export const orient = (piece, m, r) => orientCells(PIECES[piece].cells, m, r);

/** Distinct orientations of each piece: [{ m, r, cells, w, h }] (duplicates by symmetry are removed). */
export const ORIENTATIONS = PIECES.map(p => orientationsOf(p.cells));

/** Cells (indices) of a piece placed on a board of n rows, or null if it goes off the board. */
export function cellsOf(piece, { m, r, x, y }, n){
  const o = orient(piece, m, r);
  if (x < 0 || y < 0 || x + o.w > W || y + o.h > n) return null;
  return o.cells.map(([a, b]) => (y + b) * W + x + a);
}
