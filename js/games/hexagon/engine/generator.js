/* Hexagon puzzle generator. One of the precomputed solutions is picked at random and some pieces are
   left placed, checking that with them the solution is unique. The amounts follow the original puzzle's
   booklet: the fewer pieces placed, the harder. */
import { allSolutions, withPiece } from './solutions.js';
import { PIECES } from './pieces.js';
import { shuffle, randInt } from '../../../lib/random.js';

const ATTEMPTS = 200;

/** Pieces placed per level: [min, max]. */
export const LEVEL_RULES = Object.freeze({
  1: { fixed: [8, 10] },
  2: { fixed: [6, 8] },
  3: { fixed: [5, 7] },
  4: { fixed: [4, 6] },
  5: { fixed: [2, 4] }
});

/** Solutions with the `fixed` pieces placed the same as in `ref`. */
export function matching(fixed, ref){
  let ids = null;
  for (const p of fixed){
    const these = new Set(withPiece(ref.pieceKeys[p]));
    ids = ids ? ids.filter(i => these.has(i)) : [...these];
  }
  const all = allSolutions();
  return (ids ?? all.map((_, i) => i)).map(i => all[i]);
}

/**
 * Generates a puzzle of level 1..5. Generator (yields between attempts).
 * Returns { level, solution: [{ m, r, tu, tv }], fixed: [pieces] } or null.
 */
export function* generate(target){
  const [min, max] = LEVEL_RULES[target].fixed, all = allSolutions(), pieces = [...PIECES.keys()];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    yield 0;
    const sol = all[randInt(all.length)];
    // on the easy levels it starts from a random amount in the range (more pieces = easier)
    const from = target <= 2 ? min + randInt(max - min + 1) : min;
    for (let size = from; size <= max; size++){
      for (let n = 0; n < 30; n++){
        const fixed = shuffle(pieces.slice()).slice(0, size);
        if (matching(fixed, sol).length === 1) return { level: target, solution: sol.poses, fixed: fixed.sort((a, b) => a - b) };
      }
      yield 0;
    }
  }
  return null;
}
