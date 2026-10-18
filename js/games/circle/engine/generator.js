/* Circle puzzle generator. One of the precomputed solutions is picked at random and the level's clues
   are given, as in the original puzzle's booklet, checking that with them the placement of the pieces
   is unique:
     1 Beginner: 3 to 6 pieces placed; ribs visible.
     2 Easy:     2 to 4 pieces placed; ribs visible.
     3 Medium:   2 pieces placed; ribs visible.
     4 Hard:     1 or 2 pieces placed; only some ribs are marked (or none) and they have to be turned
                 into place.
     5 Expert:   2 pieces placed; no ribs: you have to find where they go. */
import { allSolutions, withPiece } from './solutions.js';
import { ribsAt, SECTORS } from './pieces.js';
import { shuffle, randInt } from '../../../lib/random.js';

const ATTEMPTS = 200;

/** `fixed`: [min, max] pieces placed · `ribs`: 'all' (fixed, visible), [min, max] marked or 0. */
export const LEVEL_RULES = Object.freeze({
  1: { fixed: [3, 6], ribs: 'all' },
  2: { fixed: [2, 4], ribs: 'all' },
  3: { fixed: [2, 2], ribs: 'all' },
  4: { fixed: [1, 2], ribs: [0, 3] },
  5: { fixed: [2, 2], ribs: 0 }
});

/**
 * Solutions compatible with some clues: the `fixed` pieces placed as in `ref`, the marked ribs in place
 * and, if known, the orientation `o`.
 */
export function matching(clues, ref){
  const all = allSolutions();
  let ids = null;
  for (const p of clues.fixed){
    const these = new Set(withPiece(ref.pieceKeys[p]));
    ids = ids ? ids.filter(i => these.has(i)) : [...these];
  }
  return (ids ?? all.map((_, i) => i)).map(i => all[i]).filter(a =>
    (clues.o === undefined || a.o === clues.o) && clues.marks.every(k => ribsAt(a.o).includes(k)));
}

/** Distinct placements (ignoring the orientation of the ribs) among the compatible ones. */
const layouts = list => new Set(list.map(a => a.key)).size;

/** Subsets of `size` elements of `items`, in random order (up to `limit`). */
function* subsets(items, size, limit){
  for (let n = 0; n < limit; n++) yield shuffle(items.slice()).slice(0, size);
}

/**
 * Generates a puzzle of level 1..5. Generator (yields between attempts).
 * Returns { level, o, solution: [{m, s}], fixed: [pieces], marks: [marked ribs], ribsFixed } or null.
 */
export function* generate(target){
  const rules = LEVEL_RULES[target], all = allSolutions();
  const known = rules.ribs === 'all', pieces = [...Array(10).keys()];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    yield 0;
    // with the ribs visible, always in the starting position (as in the booklet)
    const sol = known ? all[randInt(all.length / SECTORS)] : all[randInt(all.length)];
    const ribs = ribsAt(sol.o);
    const marks = known ? ribs.slice() : shuffle(ribs.slice()).slice(0, Array.isArray(rules.ribs) ? randInt(rules.ribs[1] + 1) : 0);
    const base = { o: known ? sol.o : undefined, marks };
    // sets of pieces are tried from fewer to more until the placement is unique; on the
    // easy levels it starts from a random amount in the range (more pieces = easier)
    const [min, max] = rules.fixed, from = target <= 2 ? min + randInt(max - min + 1) : min;
    for (let size = from; size <= max; size++){
      const found = [...subsets(pieces, size, 30)].find(fixed => layouts(matching({ ...base, fixed }, sol)) === 1);
      if (found) return {
        level: target, o: sol.o, solution: sol.poses, fixed: found.sort((a, b) => a - b),
        marks: marks.sort((a, b) => a - b), ribsFixed: known
      };
      yield 0;
    }
  }
  return null;
}
