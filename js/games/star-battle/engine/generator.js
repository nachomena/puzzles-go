/* Board generator with a unique solution and controlled difficulty. */
import { randomSolution, solve } from './exact-solver.js';
import { logic, grade, isEmptyState, isUnknownState, MAX_LEVEL } from './logic-solver.js';
import { buildRegions, connectedWithout, neighbourRegions } from './regions.js';
import { rowsToCells } from './bits.js';
import { shuffle, pick } from '../../../lib/random.js';
import { rowOf, colOf } from '../../../lib/grid.js';

const SOLVE_BUDGET = 200000;
const ATTEMPTS = 30;
const EDITS_PER_ATTEMPT = 300;
const MAX_REJECTS = 4;

/**
 * Generates an N×N board with K stars for the target level (1 easy, 2 hard, 3 expert).
 * It is a generator that yields often so the work can be spread over time.
 * Returns the board with its real level (it may come out at another level; it is used anyway) or null.
 */
export function* generate(target, N = 10, K = 2){
  const drive = target <= 2 ? target : 0;
  let rejects = 0;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    const rows = randomSolution(N, K); yield 0;
    if (!rows) continue;
    const stars = rowsToCells(N, rows);
    const reg = buildRegions(N, K, stars); if (!reg) continue;
    const isStar = new Uint8Array(N * N); stars.forEach(s => isStar[s] = 1);
    const pack = level => ({ N, K, level, regions: Array.from(reg), solution: stars.slice() });

    // Moves a cell without a star to a neighbouring region without breaking connectivity.
    const move = cands => {
      for (const i of shuffle(cands)){
        if (isStar[i]) continue;
        const g = reg[i], nbs = neighbourRegions(N, reg, i, g);
        if (!nbs.length || !connectedWithout(N, reg, g, i)) continue;
        reg[i] = pick(nbs);
        return true;
      }
      return false;
    };

    for (let it = 0; it < EDITS_PER_ATTEMPT; it++){
      let block = null, lg = null;
      if (drive){
        lg = logic(N, K, reg, drive); yield 1;
        if (lg.contra) break;
        if (lg.solved) return pack(drive === 2 && logic(N, K, reg, 1).solved ? 1 : drive);
        block = new Int32Array(N);
        for (let i = 0; i < N * N; i++) if (isEmptyState(lg.st[i])) block[rowOf(N, i)] |= 1 << colOf(N, i);
      }
      const res = solve(N, K, reg, 2, SOLVE_BUDGET, block); yield 1;
      if (!res || res.count === 0) break;
      if (res.count === 1){
        if (!drive){
          const g = grade(N, K, reg); yield 1;
          if (g <= MAX_LEVEL) return pack(g);
          if (++rejects >= MAX_REJECTS) return pack(MAX_LEVEL);
          break;
        }
        // Unique but too hard: tweak where the logic gets stuck
        const unk = [];
        for (let i = 0; i < N * N; i++) if (isUnknownState(lg.st[i])) unk.push(i);
        if (!move(unk) && !move([...Array(N * N).keys()])) break;
        continue;
      }
      // Several solutions: tweak around the stars of the alternative
      const alt = res.sols.find(s => s.some((m, r) => m !== rows[r]));
      if (!move(rowsToCells(N, alt))) break;
    }
  }
  return null;
}
