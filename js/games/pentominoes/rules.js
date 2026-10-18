/* Pentominoes rules on what the player places. Pure functions, no DOM.
   `place[piece]` is null (in the tray) or { m, r, x, y } (on the W × n board). */
import { W, cellsOf } from './engine/pieces.js';
import { solve } from './engine/solver.js';

/** Which piece covers each cell (-1 = free). */
export function occupancy(place, n){
  const grid = new Int8Array(W * n).fill(-1);
  place.forEach((pose, piece) => { if (pose) for (const i of cellsOf(piece, pose, n) || []) grid[i] = piece; });
  return grid;
}

/** Does the piece fit there without going off the board or covering others (not counting its current position)? */
export function fits(place, piece, pose, n){
  const cells = cellsOf(piece, pose, n);
  if (!cells) return false;
  const grid = occupancy(place, n);
  return cells.every(i => grid[i] < 0 || grid[i] === piece);
}

/** Solved: every piece of the puzzle on the board (as they don't overlap, they fill it). */
export const isSolved = (place, pieces) => pieces.every(p => place[p]);

const placedOf = (place, pieces) => pieces.filter(p => place[p]).map(piece => ({ piece, pose: place[piece] }));

/** Subsets of k indices of 0..n-1, in lexicographic order. */
function* combinations(n, k, from = 0){
  if (!k){ yield []; return; }
  for (let i = from; i <= n - k; i++) for (const rest of combinations(n, k - 1, i + 1)) yield [i, ...rest];
}

/**
 * Checks what is placed against every possible solution (there isn't a single one).
 * @param {number} [budgetMs]  maximum time spent looking for what to remove
 * @returns {{ solution: {piece,pose}[] } | { mistake: number }}
 *   solution: a solution that respects everything placed;
 *   mistake: a piece of the smallest group that has to be removed for it to have a solution (the last
 *   ones in the row first, which tend to be the newly added ones); -1 if it isn't found in time.
 */
export function check(place, pieces, budgetMs = 1500){
  const placed = placedOf(place, pieces).reverse();
  const solution = solve(pieces, placed);
  if (solution) return { solution };
  const t0 = Date.now();
  for (let k = 1; k < placed.length; k++){
    for (const out of combinations(placed.length, k)){
      if (solve(pieces, placed.filter((_, j) => !out.includes(j)))) return { mistake: placed[out[0]].piece };
      if (Date.now() - t0 > budgetMs) return { mistake: -1 };
    }
  }
  return { mistake: placed.length ? placed[0].piece : -1 };
}

/**
 * Hint: the piece of the solution covering the first free cell (in reading order).
 * @returns {{ piece, pose } | null}
 */
export function hintFrom(place, pieces, solution){
  const n = pieces.length, grid = occupancy(place, n), free = grid.indexOf(-1);
  if (free < 0) return null;
  return solution.find(({ piece, pose }) => !place[piece] && cellsOf(piece, pose, n).includes(free)) || null;
}
