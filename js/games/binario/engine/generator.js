/* Generador de Binario: un tablero lleno al azar y se van quitando casillas mientras el reto se
   pueda resolver sin probar (así su solución es única). En el último nivel vale además mirar un paso
   más allá: "si aquí fuera rojo, no saldría". */
import { randomSolution, solvesByLogic } from './grid.js';
import { shuffle } from '../../../lib/random.js';

/** Por nivel: lado del tablero, si se puede mirar un paso más allá y qué parte de las casillas se deja como mínimo. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 6, deep: false, keep: .42 },
  2: { n: 8, deep: false, keep: .3 },
  3: { n: 10, deep: false, keep: 0 },
  4: { n: 12, deep: false, keep: 0 },
  5: { n: 12, deep: true, keep: 0 }
});

/**
 * Reto del nivel `target`: { level, n, givens, solution } (0 = vacía; 1 y 2, los dos colores).
 * Cede a menudo para no bloquear (ver core/generator-worker.js).
 */
export function* generate(target){
  const { n, deep, keep } = LEVEL_RULES[target], size = n * n, minGivens = Math.round(size * keep);
  const solution = randomSolution(n);
  yield;
  const givens = solution.slice();
  let left = size;
  for (const i of shuffle([...Array(size).keys()])){
    if (left <= minGivens) break;
    givens[i] = 0;
    if (solvesByLogic(n, givens, deep)) left--; else givens[i] = solution[i];
    yield;
  }
  return { level: target, n, givens, solution };
}
