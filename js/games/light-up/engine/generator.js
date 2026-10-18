/* Light Up generator: random black cells (symmetric, as in real puzzles), some bulbs that light
   everything, every number, and then numbers are removed while the solution stays unique. */
import { WHITE, BLACK, isBlack, around, sights, countSolutions } from './light.js';
import { shuffle, randInt } from '../../../lib/random.js';

/** Per level: side, share of black cells and the most of the numbers that is removed. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 7, black: .22, remove: .25 },
  2: { n: 7, black: .2, remove: .6 },
  3: { n: 8, black: .2, remove: 1 },
  4: { n: 10, black: .2, remove: .7 },
  5: { n: 10, black: .18, remove: 1 }
});

function board(n, ratio){
  const cells = new Array(n * n).fill(WHITE);
  const want = Math.round(n * n * ratio);
  for (let k = 0; k < want * 3 && cells.filter(isBlack).length < want; k++){
    const i = randInt(n * n), j = n * n - 1 - i;   // 180° rotational symmetry
    cells[i] = BLACK; cells[j] = BLACK;
  }
  return cells;
}

/** Bulbs that light everything: on unlit cells, in random order. */
function bulbsFor(n, cells){
  const see = sights(n, cells), bulbs = new Array(n * n).fill(0), on = new Uint8Array(n * n);
  for (const i of shuffle([...Array(n * n).keys()])){
    if (isBlack(cells[i]) || on[i]) continue;
    bulbs[i] = 1; on[i] = 1;
    for (const j of see[i]) on[j] = 1;
  }
  return bulbs;
}

/**
 * Puzzle of level `target`: { level, n, cells, solution: bulbs (1/0 per cell) }.
 * Yields often so it doesn't block (see core/generator-worker.js).
 */
export function* generate(target){
  const { n, black, remove } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 500; attempt++){
    const base = board(n, black), solution = bulbsFor(n, base);
    // every black cell with its number
    const cells = base.map((v, i) => isBlack(v) ? around(n, i).filter(j => solution[j]).length : WHITE);
    yield;
    if (countSolutions(n, cells) !== 1) continue;
    const blacks = shuffle(cells.map((v, i) => isBlack(v) ? i : -1).filter(i => i >= 0));
    let removed = 0;
    for (const b of blacks){
      if (removed >= Math.round(blacks.length * remove)) break;
      const keep = cells[b];
      cells[b] = BLACK;
      if (countSolutions(n, cells) !== 1) cells[b] = keep; else removed++;
      yield;
    }
    return { level: target, n, cells, solution };
  }
  return null;
}
