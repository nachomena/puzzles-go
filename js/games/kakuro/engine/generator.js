/* Kakuro generator: a random shape, random numbers (with runs that lean low or high) and, while the
   logic solver gets stuck, the numbers of a stuck run are changed and it tries again. It is kept when
   it is solved with the level's techniques (and the previous level isn't enough).
   Expert (12 × 12) can take too long on a phone: it comes from precomputed puzzles
   (bank-data.js, scripts/build-kakuro-bank.mjs), each in 4 versions. */
import { pattern, runsOf, fill, withSums } from './board.js';
import { logic } from './logic-solver.js';
import { pick, randInt } from '../../../lib/random.js';
import BANK from './bank-data.js';
import { LEVEL_RULES } from './levels.js';

export { LEVEL_RULES };

const unsolved = (white, grid) => grid ? grid.reduce((t, v, i) => t + (white[i] && !v ? 1 : 0), 0) : Infinity;

/** Puzzle as text: "." black, digit = white with its number (row by row). */
export const encode = p => p.solution.map((v, i) => p.white[i] ? v : '.').join('');

/**
 * Puzzle from its text, transposed (rows for columns) and with the numbers changed to 10 − d if asked:
 * both changes keep the unique solution and the techniques needed.
 */
export function decode(text, level, { transpose = false, complement = false } = {}){
  const n = Math.round(Math.sqrt(text.length)), white = new Array(n * n), solution = new Array(n * n);
  for (let i = 0; i < n * n; i++){
    const r = (i / n) | 0, c = i % n, ch = text[transpose ? c * n + r : i];
    white[i] = ch === '.' ? 0 : 1;
    solution[i] = ch === '.' ? 0 : complement ? 10 - Number(ch) : Number(ch);
  }
  return { level, n, white, runs: withSums(runsOf(n, white), solution), solution };
}

/**
 * Puzzle of level `target`: { level, n, white, runs: [{cells, sum, dir, clue}], solution }.
 * Yields often (see core/generator-worker.js). null if it doesn't manage.
 */
export function* generate(target){
  if (target === 4 && BANK.length){
    yield;
    return decode(BANK[randInt(BANK.length)], 4, { transpose: Math.random() < .5, complement: Math.random() < .5 });
  }
  return yield* build(target);
}

/** Really generates (the bank script uses it for Expert). */
export function* build(target){
  const { n, black, logic: level, maxRun } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 400; attempt++){
    const white = pattern(n, black, maxRun);
    if (!white) continue;
    const runs = runsOf(n, white);
    let solution = fill(n, white, runs, .8);
    if (!solution) continue;
    let r = logic(n, white, withSums(runs, solution), level), left = unsolved(white, r.grid), best = left, since = 0;
    for (let step = 0; step < 20 * n && left > 0 && since < 40; step++){
      if (step % 8 === 0) yield;
      // a run with some stuck cell: it is emptied and filled another way
      const stuck = runs.filter(run => run.cells.some(i => !r.grid?.[i]));
      const run = pick(stuck), base = solution.slice();
      for (const i of run.cells) base[i] = 0;
      const next = fill(n, white, runs, .8, base);
      if (!next) continue;
      const r2 = logic(n, white, withSums(runs, next), level), left2 = unsolved(white, r2.grid);
      if (left2 <= left){ solution = next; r = r2; left = left2; }
      // no improvement for a good while: another shape
      if (left < best){ best = left; since = 0; } else since++;
    }
    yield;
    if (left > 0) continue;
    const sums = withSums(runs, solution);
    if (level > 1 && logic(n, white, sums, level - 1).solved) continue;
    return { level: target, n, white: Array.from(white), runs: sums, solution };
  }
  return null;
}
