/* Killer Sudoku generator with difficulty guaranteed by the logic solver.
   Random full board → random cages (no repeated number inside) → start with every number placed and
   remove them while the board can still be solved with the level's techniques (solving by logic
   already implies a unique solution), down to the level's minimum. Out of several attempts it keeps the
   one with the fewest numbers placed that really needs its level's techniques. */
import { CELLS } from '../../sudoku/engine/grid.js';
import { randomSolution } from '../../sudoku/engine/exact-solver.js';
import { partition } from './cages.js';
import { prepare, logic } from './logic-solver.js';
import { shuffle } from '../../../lib/random.js';

/**
 * Per logic level: possible cage sizes (1 = a one-cell cage, which gives its number away), numbers that
 * stay placed at least (`keep`) and attempts (it keeps the one with the fewest numbers placed).
 */
export const LEVEL_RULES = Object.freeze({
  1: { sizes: [1, 2, 2, 2, 2, 3, 3, 3], keep: 16, attempts: 3 },
  2: { sizes: [2, 2, 3, 3, 3, 4], keep: 4, attempts: 12 },
  3: { sizes: [2, 2, 3, 3, 4, 4], keep: 4, attempts: 12 }
});

/** Removes numbers from `grid` (mutates) while it is solved with level `level`, leaving at least `keep`. */
function* dig(grid, prepared, level, keep){
  let count = CELLS;
  for (const i of shuffle([...Array(CELLS).keys()])){
    if (count <= keep) return;
    const v = grid[i];
    grid[i] = 0;
    if (logic(grid, prepared, level).solved) count--;
    else grid[i] = v;
    if (i % 9 === 0) yield;
  }
}

/**
 * Puzzle of logic level `target` (1 easy, 2 hard, 3 expert): { level, cages: [{cells, sum}], givens, solution }.
 * Yields often so it doesn't block (see core/generator-worker.js). null if it doesn't manage.
 */
export function* generate(target){
  const { sizes, keep, attempts } = LEVEL_RULES[target];
  let best = null;
  for (let tries = 0, done = 0; done < attempts && tries < attempts * 5; tries++){
    const solution = randomSolution(), cages = partition(solution, sizes);
    yield;
    if (!cages) continue;
    done++;
    const prepared = prepare(cages), givens = solution.slice();
    yield* dig(givens, prepared, target, keep);
    // the previous level's techniques must not be enough
    if (target > 1 && logic(givens, prepared, target - 1).solved) continue;
    const count = givens.filter(Boolean).length;
    if (!best || count < best.count) best = { count, puzzle: { level: target, cages, givens, solution } };
    if (count <= keep) break;
  }
  return best?.puzzle ?? null;
}
