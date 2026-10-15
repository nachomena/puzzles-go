/* Reglas del Killer Sudoku sobre lo que escribe el jugador. Funciones puras, sin DOM. */
import { CELLS, PEERS } from '../sudoku/engine/grid.js';
import { conflicts as sudokuConflicts } from '../sudoku/rules.js';
import { prepare, nextDeduction } from './engine/logic-solver.js';

/** Casillas que ven a i: su fila, columna y caja, y además su jaula. */
export function peersOf(cages){
  const out = PEERS.map(p => new Set(p));
  for (const { cells } of cages) for (const i of cells) for (const j of cells) if (i !== j) out[i].add(j);
  return out.map(s => [...s]);
}

/**
 * Casillas con un número repetido en su fila, columna o caja (como el Sudoku) o en su jaula, y
 * jaulas que ya se pasan de su suma o que, llenas, no la dan.
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
 * Pista: la siguiente casilla que se deduce con las técnicas del nivel; si no hay ninguna, una
 * casilla vacía de la jaula con menos huecos.
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
