/* Trail generator: a random path through the whole board and, on it, some numbers that leave a single
   solution. Numbers are removed while it stays unique. */
import { randomPath, countPaths } from './path.js';
import { shuffle } from '../../../lib/random.js';

/** Per level: board side and the minimum and maximum numbers left. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 5, nums: [7, 10] },
  2: { n: 6, nums: [8, 12] },
  3: { n: 6, nums: [6, 8] },
  4: { n: 7, nums: [7, 11] },
  5: { n: 7, nums: [6, 8] }
});

/**
 * Puzzle of level `target`: { level, n, nums: cells of 1, 2, …, solution: full path }.
 * Yields often so it doesn't block (see core/generator-worker.js).
 */
export function* generate(target){
  const { n, nums: [min, max] } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 300; attempt++){
    const path = randomPath(n);
    yield;
    if (!path) continue;
    // at first, a number every two cells (and always the first and the last)
    let keep = path.map((_, k) => k).filter(k => k % 2 === 0 || k === path.length - 1);
    for (const k of shuffle(keep.slice(1, -1))){
      if (keep.length <= min) break;
      const next = keep.filter(x => x !== k);
      if (countPaths(n, next.map(x => path[x])) === 1) keep = next;
      yield;
    }
    if (keep.length < min || keep.length > max) continue;
    return { level: target, n, nums: keep.map(x => path[x]), solution: path };
  }
  return null;
}
