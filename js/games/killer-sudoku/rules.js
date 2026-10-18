/* Killer Sudoku rules on what the player writes. Pure functions, no DOM. */
import { CELLS, PEERS } from '../sudoku/engine/grid.js';
import { conflicts as sudokuConflicts } from '../sudoku/rules.js';
import { prepare, nextDeduction } from './engine/logic-solver.js';

/** Cells that see i: its row, column and box, and also its cage. */
export function peersOf(cages){
  const out = PEERS.map(p => new Set(p));
  for (const { cells } of cages) for (const i of cells) for (const j of cells) if (i !== j) out[i].add(j);
  return out.map(s => [...s]);
}

/**
 * Cells with a number repeated in their row, column or box (as in Sudoku) or in their cage, and cages
 * that already go over their sum or, once full, don't give it.
 */
export function conflicts(cages, values){
  const bad = sudokuConflicts(values);
  for (const { cells, sum } of cages){
    const seen = new Map();
    let total = 0, full = true;
    for (const i of cells){
      const d = values[i];
      if (!d){ full = false; continue; }
      total += d;
      if (seen.has(d)){ bad[i] = 1; bad[seen.get(d)] = 1; } else seen.set(d, i);
    }
    if (total > sum || (full && total !== sum)) for (const i of cells) if (values[i]) bad[i] = 1;
  }
  return bad;
}

/**
 * Hint: the next cell deduced with the level's techniques; if there is none, an empty cell of the cage
 * with the fewest gaps.
 */
export function findHint(cages, level, values, solution, prepared = prepare(cages)){
  const next = nextDeduction(values, prepared, level);
  if (next && next.digit === solution[next.cell]) return next;
  let best = null;
  for (const { cells } of cages){
    const empty = cells.filter(i => !values[i]);
    if (empty.length && (!best || empty.length < best.length)) best = empty;
  }
  return best ? { cell: best[0], digit: solution[best[0]] } : null;
}

export const isGrid = g => Array.isArray(g) && g.length === CELLS && g.every(v => Number.isInteger(v) && v >= 0 && v <= 9);
