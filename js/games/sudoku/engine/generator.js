/* Sudoku generator with difficulty guaranteed by the logic solver.
   It starts from a random full board and "digs": clues are removed while the board can still be
   solved with the allowed techniques (solving by logic already implies a unique solution). The logic
   is monotonic: removing clues never makes it easier. */
import { CELLS } from './grid.js';
import { randomSolution } from './exact-solver.js';
import { logic } from './logic-solver.js';
import { shuffle } from '../../../lib/random.js';

/** Pairs of cells symmetric about the centre (180° rotation) and single cells. */
const PAIRS = [], SINGLES = [];
for (let i = 0; i < CELLS; i++){
  SINGLES.push([i]);
  if (i <= CELLS - 1 - i) PAIRS.push(i === CELLS - 1 - i ? [i] : [i, CELLS - 1 - i]);
}

/**
 * Removes groups of clues while the board is solved with techniques of `level` without going below
 * `minClues`. Mutates `puzzle`; returns how many groups it removed.
 */
function* dig(puzzle, solution, groups, level, minClues = 0){
  let clues = puzzle.filter(Boolean).length, removed = 0;
  for (const g of shuffle(groups.slice())){
    if (!puzzle[g[0]] || clues - g.length < minClues) continue;
    g.forEach(i => puzzle[i] = 0);
    if (logic(puzzle, level).solved){ clues -= g.length; removed++; }
    else g.forEach(i => puzzle[i] = solution[i]);
    yield 1;
  }
  return removed;
}

/**
 * Strategy of each level: it receives a full board, digs it and returns true if the result is of the
 * requested level.
 */
const STRATEGIES = {
  // Easy: singles only and plenty of clues.
  1: function* (p, sol){
    yield* dig(p, sol, PAIRS, 1, 34);
    return true;
  },
  // Medium: first the minimum for singles (cell by cell); every clue removed afterwards
  // requires level 2 techniques.
  2: function* (p, sol){
    yield* dig(p, sol, PAIRS, 1);
    yield* dig(p, sol, SINGLES, 1);
    return (yield* dig(p, sol, SINGLES, 2)) > 0;
  },
  // Hard: dig allowing X-Wing and Swordfish; it counts if level 2 techniques aren't enough.
  3: function* (p, sol){
    yield* dig(p, sol, PAIRS, 3);
    return !logic(p, 2).solved;
  }
};
const ATTEMPTS = { 1: 5, 2: 100, 3: 2000 };

/**
 * Generates a Sudoku of the target level (1 easy, 2 medium, 3 hard).
 * Yields often so the work can be spread. Returns
 * { level, givens, solution } or null if it doesn't manage.
 */
export function* generate(target){
  const strategy = STRATEGIES[target];
  for (let attempt = 0; attempt < ATTEMPTS[target]; attempt++){
    const solution = randomSolution(); yield 0;
    const givens = solution.slice();
    // The strategy proposes; the rater confirms the lower level isn't enough.
    if ((yield* strategy(givens, solution)) && (target === 1 || !logic(givens, target - 1).solved)){
      return { level: target, givens, solution };
    }
  }
  return null;
}
