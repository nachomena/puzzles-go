/* Dice rules on what the player places. Pure functions, no DOM.
   `place[piece]` is null (in the tray) or { rot, r, c } (on the board). */
import { PIECES, CELLS, SIZE, shape, dieOf, posInDie, FACES, DIE_ROWS, DIE_COLS } from './engine/pieces.js';
import { placementKey } from './engine/arrangements.js';

/** Cells and dots (board indices) of a piece in a position, or null if it goes off the board. */
export function cellsOf(piece, { rot, r, c }){
  const s = shape(PIECES[piece], rot);
  if (r < 0 || c < 0 || r + s.h > SIZE || c + s.w > SIZE) return null;
  return {
    cells: s.cells.map(([a, b]) => (r + a) * SIZE + c + b),
    dots: s.dots.map(([a, b]) => (r + a) * SIZE + c + b)
  };
}

/** Which piece covers each cell (-1 = free). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pos, piece) => { if (pos) for (const i of cellsOf(piece, pos).cells) grid[i] = piece; });
  return grid;
}

/** Does the piece fit in that position without covering others (ignoring its own current position)? */
export function fits(place, piece, pos){
  const fp = cellsOf(piece, pos);
  if (!fp) return false;
  const grid = occupancy(place);
  return fp.cells.every(i => grid[i] < 0 || grid[i] === piece);
}

/**
 * State of the dice and the arrows.
 * dice[d] = { full, value } (value 0 if the face isn't valid); arrows.rows/cols[k] = 'ok' | 'bad' | ''.
 */
export function evaluate(place, arrows){
  const mask = new Uint16Array(4), filled = new Uint8Array(4);
  place.forEach((pos, piece) => {
    if (!pos) return;
    const fp = cellsOf(piece, pos);
    for (const i of fp.cells) filled[dieOf(i)]++;
    for (const i of fp.dots) mask[dieOf(i)] |= 1 << posInDie(i);
  });
  const dice = [...mask].map((m, d) => ({ full: filled[d] === 9, value: FACES.get(m) || 0 }));
  const line = (pair, target) => {
    if (target == null || !pair.every(d => dice[d].full)) return '';
    return pair.every(d => dice[d].value) && dice[pair[0]].value + dice[pair[1]].value === target ? 'ok' : 'bad';
  };
  return {
    dice,
    arrows: {
      rows: DIE_ROWS.map((p, k) => line(p, arrows.rows[k])),
      cols: DIE_COLS.map((p, k) => line(p, arrows.cols[k]))
    }
  };
}

/** Solved: every piece placed, 4 valid faces and every sum right. */
export function isSolved(place, arrows){
  if (place.some(p => !p)) return false;
  const { dice, arrows: a } = evaluate(place, arrows);
  return dice.every(d => d.value) && [...a.rows, ...a.cols].every(s => s !== 'bad');
}

/** Is the piece where it goes in the solution? (equal pieces are interchangeable) */
const keyOf = (piece, pos) => placementKey({ type: PIECES[piece], ...pos });

/** First movable piece in a place that isn't the solution's (or null). */
export function findMistake(place, solution, fixed){
  const solutionKeys = new Set(solution.map(s => keyOf(s.piece, s)));
  const piece = place.findIndex((pos, piece) => pos && !fixed.includes(piece) && !solutionKeys.has(keyOf(piece, pos)));
  return piece >= 0 ? { piece } : null;
}

/**
 * Hint: a piece of the solution that isn't in its place yet.
 * Returns { piece, pos } (the player's piece to move and where to) or null.
 */
export function findHint(place, solution, fixed){
  const placedKeys = new Set(place.map((pos, piece) => pos ? keyOf(piece, pos) : null));
  const missing = solution.filter(s => !placedKeys.has(keyOf(s.piece, s)));
  if (!missing.length) return null;
  const target = missing[(Math.random() * missing.length) | 0];
  // A piece of the same type that isn't already well placed (or fixed)
  const solutionKeys = new Set(solution.map(s => keyOf(s.piece, s)));
  const candidates = place.map((pos, piece) => piece)
    .filter(piece => PIECES[piece] === PIECES[target.piece] && !fixed.includes(piece) &&
      !(place[piece] && solutionKeys.has(keyOf(piece, place[piece]))));
  if (!candidates.length) return null;
  const piece = candidates.find(p => !place[p]) ?? candidates[0];
  return { piece, pos: { rot: target.rot, r: target.r, c: target.c } };
}
