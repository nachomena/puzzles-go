/* Gears generator: a random tree of gears from the crank (on the left) to the lock (on the right);
   every clue is placed (all the fixed gears and all the numbers) and they are removed, gears first and
   then numbers, while there is still a single solution.
   Puzzles come from a precomputed bank (bank-data.js, scripts/build-gears-bank.mjs): so they start at
   once and their unique solution is proven with no step limit. Each one comes in 2 versions. */
import { neighbours, drive, countSolutions } from './board.js';
import { shuffle, randInt } from '../../../lib/random.js';
import BANK from './bank-data.js';

/** Per level: side, fixed gears (with an arrow) left and share of the slots with a number left. */
export const LEVEL_RULES = Object.freeze({
  1: { w: 5, h: 5, keepFixed: 2, keepClues: .35 },
  2: { w: 6, h: 6, keepFixed: 1, keepClues: .2 },
  3: { w: 7, h: 7, keepFixed: 0, keepClues: .1 },
  4: { w: 8, h: 8, keepFixed: 0, keepClues: 0 }
});

/** Random tree from the crank: each new gear touches exactly one of the existing ones. */
function randomTree(w, h, crank, lock, target){
  const nb = neighbours(w, h), gears = new Uint8Array(w * h);
  gears[crank] = 1;
  let count = 1;
  const touching = i => nb[i].reduce((t, j) => t + gears[j], 0);
  for (let guard = 0; guard < 4000 && (count < target || !gears[lock]); guard++){
    const front = [];
    for (let i = 0; i < w * h; i++) if (!gears[i] && touching(i) === 1) front.push(i);
    if (!front.length) return null;
    // once half are there, if the lock can be reached, it is
    const i = front.includes(lock) && count >= target / 2 ? lock : front[randInt(front.length)];
    gears[i] = 1; count++;
    if (count > target * 1.6) return null;
  }
  return gears[lock] ? gears : null;
}

/** Solver steps on the phone (if not generated in the bank); the script uses many more. */
const PHONE_BUDGET = 300000;

/**
 * Puzzle as text, row by row: "C" crank, "L" lock, "F" fixed gear, "g" gear the player places,
 * "." empty slot and a digit for a slot with a number.
 */
export function encode(p){
  let s = '';
  for (let i = 0; i < p.w * p.h; i++){
    s += i === p.crank ? 'C' : i === p.lock ? 'L' : p.fixed.includes(i) ? 'F' : p.solution[i] ? 'g' : p.clues[i] !== undefined ? String(p.clues[i]) : '.';
  }
  return s;
}

/**
 * Puzzle from its text. `turn` gives the other version: with an odd number of rows, the panel upside
 * down; with an even number, turned half a turn with the crank and the lock swapped (the chain is the
 * same, so the solution stays unique).
 */
export function decode(text, level, { turn = false } = {}){
  const { w, h } = LEVEL_RULES[level], n = w * h, odd = h & 1;
  const at = i => {
    if (!turn) return text[i];
    const r = (i / w) | 0, c = i % w, ch = odd ? text[(h - 1 - r) * w + c] : text[(h - 1 - r) * w + w - 1 - c];
    return odd ? ch : ch === 'C' ? 'L' : ch === 'L' ? 'C' : ch;
  };
  const p = { level, w, h, crank: -1, lock: -1, fixed: [], clues: {}, spin: null, solution: new Array(n).fill(0) };
  for (let i = 0; i < n; i++){
    const ch = at(i);
    if (ch === 'C') p.crank = i;
    else if (ch === 'L') p.lock = i;
    else if (ch === 'F') p.fixed.push(i);
    else if (ch >= '0' && ch <= '6') p.clues[i] = Number(ch);
    if ('CLFg'.includes(ch)) p.solution[i] = 1;
  }
  p.spin = Array.from(drive(w, h, p.solution, p.crank).spin);
  return p;
}

/**
 * Puzzle of level `target`: { level, w, h, crank, lock, fixed: [i…], clues: { i: n }, spin: [direction
 * of each cell in the solution], solution: [1 = gear] }. Yields often (see core/generator-worker.js).
 */
export function* generate(target){
  const bank = BANK[target];
  if (bank?.length){
    yield;
    return decode(bank[randInt(bank.length)], target, { turn: Math.random() < .5 });
  }
  return yield* build(target);
}

/** Really generates (the bank script uses it with a high `budget`). */
export function* build(target, budget = PHONE_BUDGET){
  const { w, h, keepFixed, keepClues } = LEVEL_RULES[target], n = w * h;
  for (let attempt = 0; attempt < 200; attempt++){
    const crank = randInt(h) * w, lock = randInt(h) * w + w - 1;
    const sol = randomTree(w, h, crank, lock, Math.round(n * .42));
    yield;
    if (!sol) continue;
    const { spin, jam, comp } = drive(w, h, sol, crank);
    if (jam || comp.length !== sol.reduce((t, v) => t + v, 0)) continue;
    const nb = neighbours(w, h);
    const p = { level: target, w, h, crank, lock, fixed: [], clues: {}, spin: Array.from(spin), solution: Array.from(sol) };
    for (let i = 0; i < n; i++){
      if (i === crank || i === lock) continue;
      if (sol[i]) p.fixed.push(i); else p.clues[i] = nb[i].reduce((t, j) => t + sol[j], 0);
    }
    for (const i of shuffle(p.fixed.slice())){
      if (p.fixed.length <= keepFixed) break;
      p.fixed = p.fixed.filter(j => j !== i);
      if (countSolutions(p, 2, budget) !== 1) p.fixed.push(i);
      yield;
    }
    const minClues = Math.round((n - comp.length) * keepClues);
    for (const k of shuffle(Object.keys(p.clues))){
      if (Object.keys(p.clues).length <= minClues) break;
      const c = p.clues[k];
      delete p.clues[k];
      if (countSolutions(p, 2, budget) !== 1) p.clues[k] = c;
      yield;
    }
    p.fixed.sort((a, b) => a - b);
    return p;
  }
  return null;
}
