/* Generador de Killer Sudoku con dificultad garantizada por el solucionador lógico.
   Tablero completo al azar → jaulas al azar (sin repetir número dentro) → se parte de todos los
   números puestos y se quitan mientras el tablero se siga resolviendo con las técnicas del nivel
   (resolver por lógica ya implica solución única). Quedan unos pocos números puestos; de varios
   intentos se queda el que menos tenga y que de verdad necesite las técnicas de su nivel. */
import { CELLS } from '../../sudoku/engine/grid.js';
import { randomSolution } from '../../sudoku/engine/exact-solver.js';
import { partition } from './cages.js';
import { prepare, logic } from './logic-solver.js';
import { shuffle } from '../../../lib/random.js';

/** Por nivel: tamaños de jaula posibles e intentos (se queda el de menos números puestos). */
export const LEVEL_RULES = Object.freeze({
  1: { sizes: [2, 2, 2, 3, 3, 3], attempts: 4 },
  2: { sizes: [2, 2, 3, 3, 4, 4], attempts: 12 },
  3: { sizes: [2, 3, 3, 4, 4, 5], attempts: 15 },
  4: { sizes: [3, 3, 4, 4, 5, 5, 6], attempts: 20 }
});

/** Quita números de `grid` (muta) mientras se resuelva con el nivel `level`. */
function* dig(grid, prepared, level){
  for (const i of shuffle([...Array(CELLS).keys()])){
    const v = grid[i];
    grid[i] = 0;
    if (!logic(grid, prepared, level).solved) grid[i] = v;
    if (i % 9 === 0) yield;
  }
}

/**
 * Reto del nivel `target` (1 fácil … 4 experto): { level, cages: [{cells, sum}], givens, solution }.
 * Cede a menudo para no bloquear (ver core/generator-worker.js). null si no lo consigue.
 */
export function* generate(target){
  const { sizes, attempts } = LEVEL_RULES[target];
  let best = null;
  for (let tries = 0, done = 0; done < attempts && tries < attempts * 5; tries++){
    const solution = randomSolution(), cages = partition(solution, sizes);
    yield;
    if (!cages) continue;
    done++;
    const prepared = prepare(cages), givens = solution.slice();
    yield* dig(givens, prepared, target);
    // con las técnicas del nivel anterior no tiene que bastar
    if (target > 1 && logic(givens, prepared, target - 1).solved) continue;
    const count = givens.filter(Boolean).length;
    if (!best || count < best.count) best = { count, puzzle: { level: target, cages, givens, solution } };
    if (count === 0) break;
  }
  return best?.puzzle ?? null;
}
