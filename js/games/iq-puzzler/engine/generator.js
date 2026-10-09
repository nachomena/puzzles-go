/* Generador de retos de Puzzler Pro: un tablero lleno al azar y, de él, unas piezas ya puestas
   que dejan una sola solución. Más nivel = menos piezas puestas (como en el cuadernillo). */
import { ALL, packer } from './pieces.js';
import { shuffle } from '../../../lib/random.js';

/** Piezas ya puestas por nivel [mínimo, máximo]. */
export const LEVEL_RULES = Object.freeze({
  1: { fixed: [9, 9] },
  2: { fixed: [7, 8] },
  3: { fixed: [5, 6] },
  4: { fixed: [4, 4] },
  5: { fixed: [3, 3] }
});

/** ¿Hay una sola forma de terminar con estas piezas puestas? */
export const isUnique = fixed => packer.countSolutions(ALL, { fixed, limit: 2 }) === 1;

/**
 * Reto del nivel `target`: { level, solution: [{piece, pose}] por pieza, fixed: [piezas] }.
 * Cede a menudo para no bloquear (ver core/generator-worker.js).
 */
export function* generate(target){
  const [min, max] = LEVEL_RULES[target].fixed;
  for (let attempt = 0; attempt < 200; attempt++){
    const solution = packer.solve(ALL, { random: Math.random });
    yield;
    if (!solution) continue;
    // quitar piezas mientras siga habiendo una sola solución, en un orden al azar
    let keep = shuffle(ALL.slice());
    for (const piece of shuffle(ALL.slice())){
      if (keep.length <= min) break;
      const next = keep.filter(p => p !== piece);
      if (isUnique(next.map(p => solution[p]))) keep = next;
      yield;
    }
    if (keep.length < min || keep.length > max) continue;
    return { level: target, solution: solution.map(s => s.pose), fixed: keep.sort((a, b) => a - b) };
  }
  return null;
}
