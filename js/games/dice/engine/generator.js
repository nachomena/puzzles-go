/* Puzzle generator. A valid placement is picked at random and some arrows and some placed pieces are
   left as clues, removing pieces while the solution stays unique.
   The ranges of each level were tuned by playing them. */
import { arrangements, matching } from './arrangements.js';
import { shuffle, randInt } from '../../../lib/random.js';

/** Clues per level: [minimum, maximum] arrows and placed pieces. */
export const LEVEL_RULES = Object.freeze({
  1: { arrows: [4, 4], pieces: [4, 6] },
  2: { arrows: [2, 3], pieces: [3, 5] },
  3: { arrows: [2, 2], pieces: [2, 4] },
  4: { arrows: [0, 1], pieces: [2, 4] },
  5: { arrows: [1, 2], pieces: [1, 2] }
});
const ATTEMPTS = 400;
const between = ([lo, hi]) => lo + randInt(hi - lo + 1);

/** The 4 possible arrows: { kind: 'rows'|'cols', i }. */
const ARROW_SLOTS = [{ kind: 'rows', i: 0 }, { kind: 'rows', i: 1 }, { kind: 'cols', i: 0 }, { kind: 'cols', i: 1 }];

/**
 * Generates a puzzle of level 1..5. Generator: yields between attempts.
 * Returns { level, solution, fixed, arrows } or null:
 *   solution: [{piece, type, rot, r, c}] (the 12 pieces), fixed: indices of pieces already placed,
 *   arrows: { rows: [sum|null, sum|null], cols: [...] }.
 */
export function* generate(target){
  const rules = LEVEL_RULES[target];
  const { list } = arrangements();
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    const sol = list[randInt(list.length)];
    const arrows = { rows: [null, null], cols: [null, null] };
    for (const { kind, i } of shuffle(ARROW_SLOTS.slice()).slice(0, between(rules.arrows))) arrows[kind][i] = sol[kind][i];

    const goal = between(rules.pieces);
    let keep = sol.pieces.slice();
    const unique = pieces => matching(pieces, arrows, 2).length === 1;
    if (!unique(keep)){ yield 0; continue; }
    for (const p of shuffle(sol.pieces.slice())){
      if (keep.length <= goal) break;
      const without = keep.filter(q => q !== p);
      if (unique(without)) keep = without;
    }
    yield 1;
    if (keep.length < rules.pieces[0] || keep.length > rules.pieces[1]) continue;
    return { level: target, solution: sol.pieces, fixed: keep.map(p => p.piece).sort((a, b) => a - b), arrows };
  }
  return null;
}
