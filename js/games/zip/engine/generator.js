/* Generador de Zip: un camino al azar que recorre todo el tablero y, sobre él, unos números que dejan
   una sola solución. Se van quitando números mientras siga siendo única. */
import { randomPath, countPaths } from './path.js';
import { shuffle } from '../../../lib/random.js';

/** Por nivel: lado del tablero y cuántos números quedan como mínimo y como máximo. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 5, nums: [7, 10] },
  2: { n: 6, nums: [8, 12] },
  3: { n: 6, nums: [6, 8] },
  4: { n: 7, nums: [7, 11] },
  5: { n: 7, nums: [6, 8] }
});

/**
 * Reto del nivel `target`: { level, n, nums: casillas del 1, 2, …, solution: camino completo }.
 * Cede a menudo para no bloquear (ver core/generator-worker.js).
 */
export function* generate(target){
  const { n, nums: [min, max] } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 300; attempt++){
    const path = randomPath(n);
    yield;
    if (!path) continue;
    // al principio, un número cada dos casillas (y siempre el primero y el último)
    let keep = path.map((_, k) => k).filter(k => k % 2 === 0 || k === path.length - 1);
    for (const k of shuffle(keep.slice(1, -1))){
      if (keep.length <= min) break;
      const next = keep.filter(x => x !== k);
      if (countPaths(n, next.map(x => path[x])) === 1) keep = next;
      yield;
    }
    if (keep.length < min || keep.length > max) continue;
    return { level: target, n, nums: keep.map(x => path[x]), solution: path };
  }
  return null;
}
