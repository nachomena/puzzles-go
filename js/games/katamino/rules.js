/* Reglas de Katamino sobre lo que coloca el jugador. Funciones puras, sin DOM.
   `place[piece]` es null (en la bandeja) o { m, r, x, y } (en el tablero de W × n). */
import { W, cellsOf } from './engine/pieces.js';
import { solve } from './engine/solver.js';

/** Qué pieza ocupa cada casilla (-1 = libre). */
export function occupancy(place, n){
  const grid = new Int8Array(W * n).fill(-1);
  place.forEach((pose, piece) => { if (pose) for (const i of cellsOf(piece, pose, n) || []) grid[i] = piece; });
  return grid;
}

/** ¿Cabe la pieza ahí sin salirse ni pisar otras (sin contar su posición actual)? */
export function fits(place, piece, pose, n){
  const cells = cellsOf(piece, pose, n);
  if (!cells) return false;
  const grid = occupancy(place, n);
  return cells.every(i => grid[i] < 0 || grid[i] === piece);
}

/** Resuelto: todas las piezas del PENTA en el tablero (como no se pisan, lo llenan). */
export const isSolved = (place, pieces) => pieces.every(p => place[p]);

const placedOf = (place, pieces) => pieces.filter(p => place[p]).map(piece => ({ piece, pose: place[piece] }));

/** Subconjuntos de k índices de 0..n-1, en orden lexicográfico. */
function* combinations(n, k, from = 0){
  if (!k){ yield []; return; }
  for (let i = from; i <= n - k; i++) for (const rest of combinations(n, k - 1, i + 1)) yield [i, ...rest];
}

/**
 * Revisa lo colocado contra todas las soluciones posibles (no hay una única).
 * @param {number} [budgetMs]  tiempo máximo buscando qué quitar
 * @returns {{ solution: {piece,pose}[] } | { mistake: number }}
 *   solution: una solución que respeta todo lo puesto;
 *   mistake: una pieza del grupo más pequeño que hay que quitar para que tenga solución (las
 *   últimas de la fila primero, que suelen ser las recién añadidas); -1 si no se encuentra a tiempo.
 */
export function check(place, pieces, budgetMs = 1500){
  const placed = placedOf(place, pieces).reverse();
  const solution = solve(pieces, placed);
  if (solution) return { solution };
  const t0 = Date.now();
  for (let k = 1; k < placed.length; k++){
    for (const out of combinations(placed.length, k)){
      if (solve(pieces, placed.filter((_, j) => !out.includes(j)))) return { mistake: placed[out[0]].piece };
      if (Date.now() - t0 > budgetMs) return { mistake: -1 };
    }
  }
  return { mistake: placed.length ? placed[0].piece : -1 };
}

/**
 * Pista: la pieza de la solución que cubre la primera casilla libre (en orden de lectura).
 * @returns {{ piece, pose } | null}
 */
export function hintFrom(place, pieces, solution){
  const n = pieces.length, grid = occupancy(place, n), free = grid.indexOf(-1);
  if (free < 0) return null;
  return solution.find(({ piece, pose }) => !place[piece] && cellsOf(piece, pose, n).includes(free)) || null;
}
