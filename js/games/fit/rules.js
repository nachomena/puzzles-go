/* Fit rules on what the player places. Pure functions, no DOM.
   `place[piece]` is null (in the tray) or { m, r, x, y }. Every puzzle has a single solution. */
import { CELLS, cellsOf } from './engine/pieces.js';

/** Which piece covers each cell (-1 = free). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pose, piece) => { if (pose) for (const c of cellsOf(piece, pose) || []) grid[c] = piece; });
  return grid;
}

/** Does the piece fit there without going off the board or covering others (not counting its current position)? */
export function fits(place, piece, pose){
  const cells = cellsOf(piece, pose);
  if (!cells) return false;
  const grid = occupancy(place);
  return cells.every(c => grid[c] < 0 || grid[c] === piece);
}

/** Is the piece where it goes in the solution? (cells are compared: a symmetric piece has several equal poses) */
export const inPlace = (piece, pose, solution) =>
  !!pose && cellsOf(piece, pose).join() === cellsOf(piece, solution[piece]).join();

/** Every piece placed (as they don't overlap, they fill the board). */
export const isSolved = place => place.every(Boolean);

/** First piece placed by the player that isn't in its place, or null. */
export function findMistake(place, solution, fixed){
  const piece = place.findIndex((pose, p) => pose && !fixed.includes(p) && !inPlace(p, pose, solution));
  return piece >= 0 ? { piece } : null;
}

/** Hint: the piece covering the first free cell, with its place in the solution. */
export function findHint(place, solution){
  const grid = occupancy(place), free = grid.indexOf(-1);
  if (free < 0) return null;
  const piece = solution.findIndex((pose, p) => !inPlace(p, place[p], solution) && cellsOf(p, pose).includes(free));
  return piece >= 0 ? { piece, pose: solution[piece] } : null;
}
