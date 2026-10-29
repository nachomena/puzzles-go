/* Circle pieces and board (a ball-and-ring packing puzzle).
   The board has 3 rings of 14 holes: cell = ring * 14 + sector (ring 0 = the inner one, of small
   balls; 2 = the outer one, of big balls). Sector 0 is on the right and the sectors go clockwise.
   Each piece is a list of balls [ring, relative sector]: the piece is placed by rotating it (adding an
   offset to the sector) and, as it has two sides, also mirrored (changing the sign).
   The 10 pieces were found by a computer search: random cuts of the board kept for their number of
   solutions and for every level generating well. */
export const RINGS = 3;
export const SECTORS = 14;
export const CELLS = RINGS * SECTORS;

export const cell = (ring, sector) => ring * SECTORS + (((sector % SECTORS) + SECTORS) % SECTORS);
export const ringOf = c => (c / SECTORS) | 0;
export const sectorOf = c => c % SECTORS;

/** The pieces (A … J), from small to big. `hue`: colour of each one. */
export const PIECES = Object.freeze([
  { id: 'A', hue: 'yellow', balls: [[1, 0], [1, 1], [2, 0]] },
  { id: 'B', hue: 'orange', balls: [[2, 0], [2, 1], [2, 2]] },
  { id: 'C', hue: 'red',    balls: [[0, 0], [0, 1], [0, 2], [1, 0]] },
  { id: 'D', hue: 'pink',   balls: [[0, 1], [1, 1], [2, 0], [2, 1]] },
  { id: 'E', hue: 'purple', balls: [[1, 0], [1, 1], [1, 2], [2, 2]] },
  { id: 'F', hue: 'blue',   balls: [[1, 0], [1, 1], [2, 0], [2, 1]] },
  { id: 'G', hue: 'sky',    balls: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  { id: 'H', hue: 'teal',   balls: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]] },
  { id: 'I', hue: 'green',  balls: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]] },
  { id: 'J', hue: 'lime',   balls: [[0, 1], [1, 1], [2, 0], [2, 1], [2, 2]] }
].map(p => Object.freeze({ ...p, balls: Object.freeze(p.balls.map(b => Object.freeze(b))) })));

/**
 * Ribs: they separate two neighbouring holes of the outer ring. Rib k is between sector k and k + 1.
 * They always follow this pattern (gaps of 3, 3, 4 and 4 sectors); turning the board moves them all
 * at once: `ribsAt(o)`.
 */
export const RIB_PATTERN = Object.freeze([0, 3, 6, 10]);
export const ribsAt = o => RIB_PATTERN.map(k => (k + o) % SECTORS);

/** Ball k of the piece with pose { m: ±1 (side), s: rotation in sectors } → cell. */
export const ballCell = (piece, k, { m, s }) => {
  const [ring, d] = PIECES[piece].balls[k];
  return cell(ring, m * d + s);
};

/** Cells of a piece in a pose (in the order of its balls). */
export const cellsOf = (piece, pose) => PIECES[piece].balls.map((_, k) => ballCell(piece, k, pose));

/** Does the piece join two outer balls on both sides of a rib? (not allowed: the rib blocks it) */
export function crossesRib(cells, ribs){
  const set = new Set(cells);
  return ribs.some(k => set.has(cell(2, k)) && set.has(cell(2, k + 1)));
}

/** Pairs of joined balls of a piece (neighbours on the board): [[k1, k2], …]. */
export function bonds(piece){
  const balls = PIECES[piece].balls, out = [];
  for (let a = 0; a < balls.length; a++) for (let b = a + 1; b < balls.length; b++){
    const [ra, da] = balls[a], [rb, db] = balls[b];
    const dd = (((da - db) % SECTORS) + SECTORS) % SECTORS;
    if ((ra === rb && (dd === 1 || dd === SECTORS - 1)) || (da === db && Math.abs(ra - rb) === 1)) out.push([a, b]);
  }
  return out;
}

/** Every distinct pose of a piece (those covering the same cells count once). */
export function poses(piece){
  const seen = new Set(), out = [];
  for (const m of [1, -1]) for (let s = 0; s < SECTORS; s++){
    const key = cellsOf(piece, { m, s }).slice().sort((a, b) => a - b).join();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ m, s });
  }
  return out;
}
