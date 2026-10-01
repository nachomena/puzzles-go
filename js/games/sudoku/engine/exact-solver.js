/* Backtracking con máscaras y "casilla más restringida primero". */
import { CELLS, ALL, PEERS, bit, usedAround } from './grid.js';
import { popcount, bitIndices } from '../../../lib/bits.js';
import { shuffle } from '../../../lib/random.js';

/**
 * Cuenta soluciones de `grid` (0 = vacía) hasta `limit`.
 * Con `random` prueba los dígitos en orden aleatorio (para rellenar tableros).
 * Devuelve { count, first } con la primera solución encontrada.
 */
export function search(grid, { limit = 2, random = false } = {}){
  const g = Array.from(grid);
  let count = 0, first = null;
  function rec(){
    let best = -1, bestMask = 0, bestN = 10;
    for (let i = 0; i < CELLS; i++){
      if (g[i]) continue;
      const mask = ALL & ~usedAround(g, i), n = popcount(mask);
      if (n === 0) return false;
      if (n < bestN){ best = i; bestMask = mask; bestN = n; if (n === 1) break; }
    }
    if (best < 0){
      count++;
      if (!first) first = g.slice();
      return count >= limit;
    }
    const digits = bitIndices(bestMask).map(b => b + 1);
    for (const d of random ? shuffle(digits) : digits){
      g[best] = d;
      if (rec()) return true;
    }
    g[best] = 0;
    return false;
  }
  rec();
  return { count, first };
}

export const countSolutions = (grid, limit = 2) => search(grid, { limit }).count;

/** Un tablero completo y válido al azar. */
export const randomSolution = () => search(new Array(CELLS).fill(0), { limit: 1, random: true }).first;

/** ¿Es `grid` una solución completa y correcta? */
export function isComplete(grid){
  for (let i = 0; i < CELLS; i++){
    if (!grid[i]) return false;
    for (const p of PEERS[i]) if (grid[p] === grid[i]) return false;
  }
  return true;
}
