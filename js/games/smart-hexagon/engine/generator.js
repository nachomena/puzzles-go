/* Generador de retos de Smart Hexagon. Se elige al azar una de las soluciones precalculadas y se
   dejan puestas algunas piezas, comprobando que con ellas la solución es única. Las cantidades
   siguen las del cuadernillo original: cuantas menos piezas puestas, más difícil. */
import { allSolutions, withPiece } from './solutions.js';
import { PIECES } from './pieces.js';
import { shuffle, randInt } from '../../../lib/random.js';

const ATTEMPTS = 200;

/** Piezas puestas por nivel: [mín, máx]. */
export const LEVEL_RULES = Object.freeze({
  1: { fixed: [8, 10] },
  2: { fixed: [6, 8] },
  3: { fixed: [5, 7] },
  4: { fixed: [4, 6] },
  5: { fixed: [2, 4] }
});

/** Soluciones con las piezas `fixed` colocadas igual que en `ref`. */
export function matching(fixed, ref){
  let ids = null;
  for (const p of fixed){
    const these = new Set(withPiece(ref.pieceKeys[p]));
    ids = ids ? ids.filter(i => these.has(i)) : [...these];
  }
  const all = allSolutions();
  return (ids ?? all.map((_, i) => i)).map(i => all[i]);
}

/**
 * Genera un reto del nivel 1..5. Generador (cede entre intentos).
 * Devuelve { level, solution: [{ m, r, tu, tv }], fixed: [piezas] } o null.
 */
export function* generate(target){
  const [min, max] = LEVEL_RULES[target].fixed, all = allSolutions(), pieces = [...PIECES.keys()];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    yield 0;
    const sol = all[randInt(all.length)];
    // en los niveles fáciles se parte de una cantidad al azar del rango (más piezas = más fácil)
    const from = target <= 2 ? min + randInt(max - min + 1) : min;
    for (let size = from; size <= max; size++){
      for (let n = 0; n < 30; n++){
        const fixed = shuffle(pieces.slice()).slice(0, size);
        if (matching(fixed, sol).length === 1) return { level: target, solution: sol.poses, fixed: fixed.sort((a, b) => a - b) };
      }
      yield 0;
    }
  }
  return null;
}
