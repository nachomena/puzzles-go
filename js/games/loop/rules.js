/* Loop rules on what the player marks (0 unmarked, 1 line, 2 cross). No DOM. */
import { geometry } from './engine/grid.js';
import { nextDeduction } from './engine/logic-solver.js';
import { LEVEL_RULES } from './engine/generator.js';

/** Lines of each cell. */
export const lineCounts = (n, e) => geometry(n).cellEdges.map(es => es.reduce((t, k) => t + (e[k] === 1), 0));

/** Dots with more than two lines. */
export const crowded = (n, e) => geometry(n).vertEdges.map(es => es.reduce((t, k) => t + (e[k] === 1), 0) > 2);

/** Are the lines exactly the loop's? (crosses don't count) */
export const isSolved = (e, solution) => solution.every((v, k) => (v === 1) === (e[k] === 1));

/** First wrongly marked side: an extra line or a cross where a line goes. −1 if there is none. */
export const findMistake = (e, solution) => e.findIndex((v, k) => (v === 1 && solution[k] !== 1) || (v === 2 && solution[k] === 1));

/** Hint: the next side deduced with the level's techniques; otherwise, a missing line of the loop. */
export function findHint(p, e){
  const next = nextDeduction(p.n, p.clues, LEVEL_RULES[p.level].logic, e);
  if (next && (next.value === 1) === (p.solution[next.edge] === 1)) return next;
  const k = p.solution.findIndex((v, i) => v === 1 && e[i] !== 1);
  return k >= 0 ? { edge: k, value: 1 } : null;
}
