/* Circle rules on what the player places. Pure functions, no DOM.
   `place[piece]` is null (in the tray) or { m, s } (side and rotation, see engine/pieces.js).
   `ro` is the player's orientation of the ribs. */
import { PIECES, CELLS, cellsOf, crossesRib, ribsAt } from './engine/pieces.js';
import { placeKey } from './engine/solutions.js';

/** Which piece covers each cell (-1 = free). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pose, p) => { if (pose) for (const c of cellsOf(p, pose)) grid[c] = p; });
  return grid;
}

/** Does the piece fit like this without covering others (except itself) or crossing a rib? */
export function fits(place, piece, pose, ro){
  const cells = cellsOf(piece, pose);
  if (crossesRib(cells, ribsAt(ro))) return false;
  const grid = occupancy(place);
  return cells.every(c => grid[c] < 0 || grid[c] === piece);
}

/** Placed pieces that cross some rib with orientation `ro`. */
export const blockedBy = (place, ro) => place.flatMap((pose, p) => pose && crossesRib(cellsOf(p, pose), ribsAt(ro)) ? [p] : []);

const sameAsSolution = (place, solution, p) => place[p] && placeKey(p, place[p]) === placeKey(p, solution[p]);

/** Solved: every piece placed and as in the solution (unique). */
export const isSolved = (place, solution) => PIECES.every((_, p) => sameAsSolution(place, solution, p));

/** First placed movable piece that isn't as in the solution (or null). */
export function findMistake(place, solution, fixed){
  const piece = place.findIndex((pose, p) => pose && !fixed.includes(p) && !sameAsSolution(place, solution, p));
  return piece >= 0 ? { piece } : null;
}

/** Does orientation `ro` work for the solution (it doesn't cross it and respects the marked ribs)? */
export const ribsWork = (ro, solution, marks) =>
  marks.every(k => ribsAt(ro).includes(k)) && solution.every((pose, p) => !crossesRib(cellsOf(p, pose), ribsAt(ro)));

/**
 * Hint: first, if the ribs aren't turned right, their orientation ({ ro }); otherwise, a missing piece
 * of the solution ({ piece, pose }). null if nothing is left.
 */
export function findHint(place, solution, { ro, o, marks }){
  if (!ribsWork(ro, solution, marks)) return { ro: o };
  const missing = PIECES.map((_, p) => p).filter(p => !sameAsSolution(place, solution, p));
  if (!missing.length) return null;
  const piece = missing[(Math.random() * missing.length) | 0];
  return { piece, pose: solution[piece] };
}
