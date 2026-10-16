/* Reglas de Slitherlink sobre lo que marca el jugador (0 sin marcar, 1 línea, 2 tachado). Sin DOM. */
import { geometry } from './engine/grid.js';
import { nextDeduction } from './engine/logic-solver.js';
import { LEVEL_RULES } from './engine/generator.js';

/** Líneas de cada casilla. */
export const lineCounts = (n, e) => geometry(n).cellEdges.map(es => es.reduce((t, k) => t + (e[k] === 1), 0));

/** Puntos de los que salen más de dos líneas. */
export const crowded = (n, e) => geometry(n).vertEdges.map(es => es.reduce((t, k) => t + (e[k] === 1), 0) > 2);

/** ¿Las líneas son justo las del lazo? (los tachados no cuentan) */
export const isSolved = (e, solution) => solution.every((v, k) => (v === 1) === (e[k] === 1));

/** Primer lado mal marcado: una línea que sobra o un tachado donde va línea. −1 si no hay. */
export const findMistake = (e, solution) => e.findIndex((v, k) => (v === 1 && solution[k] !== 1) || (v === 2 && solution[k] === 1));

/** Pista: el siguiente lado que se deduce con las técnicas del nivel; si no, una línea del lazo que falte. */
export function findHint(p, e){
  const next = nextDeduction(p.n, p.clues, LEVEL_RULES[p.level].logic, e);
  if (next && (next.value === 1) === (p.solution[next.edge] === 1)) return next;
  const k = p.solution.findIndex((v, i) => v === 1 && e[i] !== 1);
  return k >= 0 ? { edge: k, value: 1 } : null;
}
