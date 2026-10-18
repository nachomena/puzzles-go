/* Binary generator: a random full board, then cells are removed while the puzzle can still be solved
   without guessing (so its solution is unique). On the last level, looking one step ahead also counts:
   "if this were red, it wouldn't work out". */
import { randomSolution, solvesByLogic } from './grid.js';
import { shuffle } from '../../../lib/random.js';

/** Per level: board side, whether looking one step ahead is allowed and the minimum share of cells left. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 6, deep: false, keep: .42 },
  2: { n: 8, deep: false, keep: .3 },
  3: { n: 10, deep: false, keep: 0 },
  4: { n: 12, deep: false, keep: 0 },
  5: { n: 12, deep: true, keep: 0 }
});

/**
 * Puzzle of level `target`: { level, n, givens, solution } (0 = empty; 1 and 2, the two colours).
 * Yields often so it doesn't block (see core/generator-worker.js).
 */
export function* generate(target){
  const { n, deep, keep } = LEVEL_RULES[target], size = n * n, minGivens = Math.round(size * keep);
  const solution = randomSolution(n);
  yield;
  const givens = solution.slice();
  let left = size;
  for (const i of shuffle([...Array(size).keys()])){
    if (left <= minGivens) break;
    givens[i] = 0;
    if (solvesByLogic(n, givens, deep)) left--; else givens[i] = solution[i];
    yield;
  }
  return { level: target, n, givens, solution };
}
