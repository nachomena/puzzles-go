/* Reglas del Kakuro sobre lo que escribe el jugador. Funciones puras, sin DOM. */
import { nextDeduction } from './engine/logic-solver.js';
import { LEVEL_RULES } from './engine/levels.js';

/** Casillas que comparten tramo con cada casilla (para limpiar notas y resaltar). */
export function peersOf(n, runs){
  const out = Array.from({ length: n * n }, () => new Set());
  for (const { cells } of runs) for (const i of cells) for (const j of cells) if (i !== j) out[i].add(j);
  return out.map(s => [...s]);
}

/** Casillas con un número repetido en su tramo, y tramos que se pasan de su suma o que, llenos, no la dan. */
export function conflicts(n, runs, values){
  const bad = new Uint8Array(n * n);
  for (const { cells, sum } of runs){
    const seen = new Map();
    let total = 0, full = true;
    for (const i of cells){
      const d = values[i];
      if (!(d > 0)){ full = false; continue; }
      total += d;
      if (seen.has(d)){ bad[i] = 1; bad[seen.get(d)] = 1; } else seen.set(d, i);
    }
    if (total > sum || (full && total !== sum)) for (const i of cells) if (values[i] > 0) bad[i] = 1;
  }
  return bad;
}

/** Pista: la siguiente casilla que se deduce con las técnicas del nivel; si no, una vacía del tramo más corto. */
export function findHint(p, values){
  const next = nextDeduction(p.n, p.white, p.runs, LEVEL_RULES[p.level].logic, values);
  if (next && next.digit === p.solution[next.cell]) return next;
  let best = null;
  for (const { cells } of p.runs){
    const empty = cells.filter(i => !(values[i] > 0));
    if (empty.length && (!best || empty.length < best.length)) best = empty;
  }
  return best ? { cell: best[0], digit: p.solution[best[0]] } : null;
}
