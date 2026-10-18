/* Circuit puzzle generator. One of the valid placements is picked at random and the clues for the
   level are given (as in the original puzzle's booklet), checking that with them the solution is unique.
     1 Beginner: shape of every path + some pieces placed.
     2 Easy:     outline of every piece.
     3 Medium:   shape of every path.
     4 Hard:     some pieces with a dot placed.
     5 Expert:   only the dots. */
import { arrangements, matching } from './arrangements.js';
import { PIECES } from './pieces.js';
import { shuffle, randInt } from '../../../lib/random.js';

const ATTEMPTS = 300;

/** What is shown on each level. `fixed`: [min, max] pieces placed; `dotted`: only pieces with a dot. */
export const LEVEL_RULES = Object.freeze({
  1: { masks: true,  regions: false, fixed: [2, 3], dotted: false },
  2: { masks: false, regions: true,  fixed: [0, 0], dotted: false },
  3: { masks: true,  regions: false, fixed: [0, 0], dotted: false },
  4: { masks: false, regions: false, fixed: [1, 3], dotted: true },
  5: { masks: false, regions: false, fixed: [0, 0], dotted: false }
});

const hasDot = (arr, p) => arr.pieces[p.piece] && PIECES[p.piece].faces[p.face]?.dots.length > 0;

/**
 * Generates a puzzle of level 1..5. Generator (yields between attempts).
 * Returns { level, solution: [{piece, face, rot, cell}], dots, show: { masks, regions }, fixed: [pieces] } or null.
 */
export function* generate(target){
  const rules = LEVEL_RULES[target], list = arrangements();
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    yield 0;
    const sol = list[randInt(list.length)];
    const clues = { dots: sol.dots, masks: rules.masks, regions: rules.regions, fixed: [] };
    const unique = () => matching(clues, sol).length === 1;
    if (rules.fixed[1] === 0){
      if (!unique()) continue;
    } else {
      // Pieces are added (with a dot on the Hard level) until the solution is unique
      const pool = shuffle(sol.pieces.filter(p => !rules.dotted || hasDot(sol, p)));
      while (clues.fixed.length < rules.fixed[0] || !unique()){
        if (!pool.length || clues.fixed.length >= rules.fixed[1]) break;
        clues.fixed.push(pool.pop());
      }
      if (!unique() || clues.fixed.length < rules.fixed[0]) continue;
      // On Hard, if the dots alone already make it unique, the puzzle would be an Expert one with help: it counts anyway
    }
    return {
      level: target,
      solution: sol.pieces,
      dots: sol.dots,
      show: { masks: rules.masks, regions: rules.regions },
      fixed: clues.fixed.map(p => p.piece).sort((a, b) => a - b)
    };
  }
  return null;
}
