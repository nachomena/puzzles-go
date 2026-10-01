/* Generador de retos de Smart Circuit. Se elige al azar una de las colocaciones válidas y se dan
   las pistas que corresponden al nivel (como en el cuadernillo original), comprobando que con
   ellas la solución es única.
     1 Principiante: forma de todos los caminos + algunas piezas colocadas.
     2 Fácil:        silueta de todas las piezas.
     3 Medio:        forma de todos los caminos.
     4 Difícil:      algunas piezas con punto colocadas.
     5 Experto:      solo los puntos. */
import { arrangements, matching } from './arrangements.js';
import { PIECES } from './pieces.js';
import { shuffle, randInt } from '../../../lib/random.js';

const ATTEMPTS = 300;

/** Qué se muestra en cada nivel. `fixed`: [mín, máx] piezas colocadas; `dotted`: solo piezas con punto. */
export const LEVEL_RULES = Object.freeze({
  1: { masks: true,  regions: false, fixed: [2, 3], dotted: false },
  2: { masks: false, regions: true,  fixed: [0, 0], dotted: false },
  3: { masks: true,  regions: false, fixed: [0, 0], dotted: false },
  4: { masks: false, regions: false, fixed: [1, 3], dotted: true },
  5: { masks: false, regions: false, fixed: [0, 0], dotted: false }
});

const hasDot = (arr, p) => arr.pieces[p.piece] && PIECES[p.piece].faces[p.face]?.dots.length > 0;

/**
 * Genera un reto del nivel 1..5. Generador (cede entre intentos).
 * Devuelve { level, solution: [{piece, face, rot, cell}], dots, show: { masks, regions }, fixed: [piezas] } o null.
 */
export function* generate(target){
  const rules = LEVEL_RULES[target], list = arrangements();
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    yield 0;
    const sol = list[randInt(list.length)];
    const clues = { dots: sol.dots, masks: rules.masks, regions: rules.regions, fixed: [] };
    const unique = () => matching(clues, sol).length === 1;
    if (rules.fixed[1] === 0){
      if (!unique()) continue;
    } else {
      // Se añaden piezas (con punto en el nivel Difícil) hasta que la solución sea única
      const pool = shuffle(sol.pieces.filter(p => !rules.dotted || hasDot(sol, p)));
      while (clues.fixed.length < rules.fixed[0] || !unique()){
        if (!pool.length || clues.fixed.length >= rules.fixed[1]) break;
        clues.fixed.push(pool.pop());
      }
      if (!unique() || clues.fixed.length < rules.fixed[0]) continue;
      // En Difícil, si con solo los puntos ya es único, el reto sería de nivel Experto con ayuda: vale igual
    }
    return {
      level: target,
      solution: sol.pieces,
      dots: sol.dots,
      show: { masks: rules.masks, regions: rules.regions },
      fixed: clues.fixed.map(p => p.piece).sort((a, b) => a - b)
    };
  }
  return null;
}
