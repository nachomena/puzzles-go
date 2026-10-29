/* The game's 12 pieces and the valid dice faces.
   The board is 6×6 dot positions: 2×2 dice of 3×3. Cell i = row * 6 + column. */

export const SIZE = 6, DIE = 3, CELLS = SIZE * SIZE;

/** Base shapes: cells [row, col] and black dots [row, col]. `count` = equal pieces. */
export const PIECE_TYPES = [
  { id: 'dot',     cells: [[0, 0]], dots: [[0, 0]], count: 2 },
  { id: 'bar-0',   cells: [[0, 0], [0, 1]], dots: [], count: 3 },
  { id: 'bar-1',   cells: [[0, 0], [0, 1]], dots: [[0, 0]], count: 3 },
  { id: 'sq-2',    cells: [[0, 0], [0, 1], [1, 0], [1, 1]], dots: [[0, 0], [0, 1]], count: 1 },
  { id: 'rect-1',  cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], dots: [[0, 1]], count: 1 },
  { id: 'rect-2',  cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], dots: [[0, 0], [0, 1]], count: 1 },
  { id: 'rect-2d', cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], dots: [[0, 0], [1, 1]], count: 1 }
];

/** The 12 actual pieces: piece index → type index. */
export const PIECES = PIECE_TYPES.flatMap((t, type) => Array.from({ length: t.count }, () => type));

/** Rotates [row, col] 90° clockwise `rot` times and normalises it to start at (0, 0). */
function rotate(points, rot, refPoints = points){
  let pts = points.map(p => p.slice()), ref = refPoints.map(p => p.slice());
  for (let k = 0; k < rot; k++){
    const h = Math.max(...ref.map(p => p[0]));
    pts = pts.map(([r, c]) => [c, h - r]);
    ref = ref.map(([r, c]) => [c, h - r]);
  }
  const minR = Math.min(...ref.map(p => p[0])), minC = Math.min(...ref.map(p => p[1]));
  return pts.map(([r, c]) => [r - minR, c - minC]);
}

/** Shape of a type with a rotation (0..3): cells and dots relative to its top-left corner. */
export function shape(type, rot){
  const t = PIECE_TYPES[type];
  const cells = rotate(t.cells, rot), dots = rotate(t.dots, rot, t.cells);
  const key = p => p[0] * 10 + p[1];
  cells.sort((a, b) => key(a) - key(b));
  dots.sort((a, b) => key(a) - key(b));
  return {
    cells, dots,
    h: Math.max(...cells.map(p => p[0])) + 1,
    w: Math.max(...cells.map(p => p[1])) + 1
  };
}

/** Board cells (indices) and dots covered by a piece at (r, c) with rotation rot, or null if it goes off the board. */
export function footprint(type, rot, r, c){
  const s = shape(type, rot);
  if (r < 0 || c < 0 || r + s.h > SIZE || c + s.w > SIZE) return null;
  return {
    cells: s.cells.map(([a, b]) => (r + a) * SIZE + c + b),
    dots: s.dots.map(([a, b]) => (r + a) * SIZE + c + b)
  };
}

/* ---------- Dice ---------- */

/** Die (0..3, left to right and top to bottom) of each cell, and position inside the die. */
export const dieOf = i => ((((i / SIZE) | 0) / DIE) | 0) * 2 + (((i % SIZE) / DIE) | 0);
export const posInDie = i => (((i / SIZE) | 0) % DIE) * DIE + (i % SIZE) % DIE;

const mask = (...pos) => pos.reduce((m, p) => m | (1 << p), 0);
/** Valid patterns (9-bit mask inside the die) → value. Includes every rotation. */
export const FACES = new Map([
  [mask(4), 1],
  [mask(0, 8), 2], [mask(2, 6), 2],
  [mask(0, 4, 8), 3], [mask(2, 4, 6), 3],
  [mask(0, 2, 6, 8), 4],
  [mask(0, 2, 4, 6, 8), 5],
  [mask(0, 3, 6, 2, 5, 8), 6], [mask(0, 1, 2, 6, 7, 8), 6]
]);

/** Rows and columns of dice: [die, die]. Row 0 = top, column 0 = left. */
export const DIE_ROWS = [[0, 1], [2, 3]];
export const DIE_COLS = [[0, 2], [1, 3]];
