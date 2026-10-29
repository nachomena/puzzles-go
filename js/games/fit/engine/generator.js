/* Fit puzzle generator: a random full board and, from it, some pieces already placed that leave a
   single solution. Higher level = fewer pieces placed. */
import { ALL, packer } from './pieces.js';
import { shuffle } from '../../../lib/random.js';

/** Pieces already placed per level [minimum, maximum]. */
export const LEVEL_RULES = Object.freeze({
  1: { fixed: [9, 9] },
  2: { fixed: [7, 8] },
  3: { fixed: [5, 6] },
  4: { fixed: [4, 4] },
  5: { fixed: [3, 3] }
});

/** Is there a single way to finish with these pieces placed? */
export const isUnique = fixed => packer.countSolutions(ALL, { fixed, limit: 2 }) === 1;

/**
 * Puzzle of level `target`: { level, solution: [{piece, pose}] per piece, fixed: [pieces] }.
 * Yields often so it doesn't block (see core/generator-worker.js).
 */
export function* generate(target){
  const [min, max] = LEVEL_RULES[target].fixed;
  for (let attempt = 0; attempt < 200; attempt++){
    const solution = packer.solve(ALL, { random: Math.random });
    yield;
    if (!solution) continue;
    // remove pieces while there is still a single solution, in random order
    let keep = shuffle(ALL.slice());
    for (const piece of shuffle(ALL.slice())){
      if (keep.length <= min) break;
      const next = keep.filter(p => p !== piece);
      if (isUnique(next.map(p => solution[p]))) keep = next;
      yield;
    }
    if (keep.length < min || keep.length > max) continue;
    return { level: target, solution: solution.map(s => s.pose), fixed: keep.sort((a, b) => a - b) };
  }
  return null;
}
