/* Hexagon rules on what the player places. Pure functions, no DOM.
   `place[piece]` is null (in the tray) or { m, r, tu, tv } (side, rotation and translation). */
import { PIECES, CELLS, cellsOf } from './engine/pieces.js';
import { placeKey } from './engine/solutions.js';

/** Which piece covers each point (-1 = free). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pose, p) => { if (pose) for (const c of cellsOf(p, pose)) grid[c] = p; });
  return grid;
}

/** Does the piece fit like this inside the board without covering others (except itself)? */
export function fits(place, piece, pose){
  const cells = cellsOf(piece, pose);
  if (!cells) return false;
  const grid = occupancy(place);
  return cells.every(c => grid[c] < 0 || grid[c] === piece);
}

const keyOf = (p, pose) => placeKey(p, cellsOf(p, pose));
const sameAsSolution = (place, solution, p) => place[p] && keyOf(p, place[p]) === keyOf(p, solution[p]);

/** Solved: every piece placed and as in the solution (unique). */
export const isSolved = (place, solution) => PIECES.every((_, p) => sameAsSolution(place, solution, p));

/** First placed movable piece that isn't as in the solution (or null). */
export function findMistake(place, solution, fixed){
  const piece = place.findIndex((pose, p) => pose && !fixed.includes(p) && !sameAsSolution(place, solution, p));
  return piece >= 0 ? { piece } : null;
}

/** Hint: a missing piece of the solution ({ piece, pose }), or null. */
export function findHint(place, solution){
  const missing = PIECES.map((_, p) => p).filter(p => !sameAsSolution(place, solution, p));
  if (!missing.length) return null;
  const piece = missing[(Math.random() * missing.length) | 0];
  return { piece, pose: solution[piece] };
}
