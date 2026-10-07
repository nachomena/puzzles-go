/* Generador de retos de Smart Circle. Se elige al azar una de las soluciones precalculadas y se
   dan las pistas del nivel, como en el cuadernillo original, comprobando que con ellas la
   colocación de las piezas es única:
     1 Principiante: 3 a 6 piezas puestas; nervios a la vista.
     2 Fácil:        2 a 4 piezas puestas; nervios a la vista.
     3 Medio:        2 piezas puestas; nervios a la vista.
     4 Difícil:      1 o 2 piezas puestas; solo se marcan algunos nervios (o ninguno) y hay que
                     girarlos hasta su sitio.
     5 Experto:      2 piezas puestas; sin nervios: hay que encontrar dónde van. */
import { allSolutions, withPiece } from './solutions.js';
import { ribsAt, SECTORS } from './pieces.js';
import { shuffle, randInt } from '../../../lib/random.js';

const ATTEMPTS = 200;

/** `fixed`: [mín, máx] piezas puestas · `ribs`: 'all' (fijos, a la vista), [mín, máx] marcados o 0. */
export const LEVEL_RULES = Object.freeze({
  1: { fixed: [3, 6], ribs: 'all' },
  2: { fixed: [2, 4], ribs: 'all' },
  3: { fixed: [2, 2], ribs: 'all' },
  4: { fixed: [1, 2], ribs: [0, 3] },
  5: { fixed: [2, 2], ribs: 0 }
});

/**
 * Soluciones compatibles con unas pistas: las piezas `fixed` puestas como en `ref`, los nervios
 * marcados en su sitio y, si se conoce, la orientación `o`.
 */
export function matching(clues, ref){
  const all = allSolutions();
  let ids = null;
  for (const p of clues.fixed){
    const these = new Set(withPiece(ref.pieceKeys[p]));
    ids = ids ? ids.filter(i => these.has(i)) : [...these];
  }
  return (ids ?? all.map((_, i) => i)).map(i => all[i]).filter(a =>
    (clues.o === undefined || a.o === clues.o) && clues.marks.every(k => ribsAt(a.o).includes(k)));
}

/** Colocaciones distintas (sin contar la orientación de los nervios) entre las compatibles. */
const layouts = list => new Set(list.map(a => a.key)).size;

/** Subconjuntos de `size` elementos de `items`, en orden aleatorio (hasta `limit`). */
function* subsets(items, size, limit){
  for (let n = 0; n < limit; n++) yield shuffle(items.slice()).slice(0, size);
}

/**
 * Genera un reto del nivel 1..5. Generador (cede entre intentos).
 * Devuelve { level, o, solution: [{m, s}], fixed: [piezas], marks: [nervios marcados], ribsFixed } o null.
 */
export function* generate(target){
  const rules = LEVEL_RULES[target], all = allSolutions();
  const known = rules.ribs === 'all', pieces = [...Array(10).keys()];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++){
    yield 0;
    // con los nervios a la vista, siempre en la posición de partida (como en el cuadernillo)
    const sol = known ? all[randInt(all.length / SECTORS)] : all[randInt(all.length)];
    const ribs = ribsAt(sol.o);
    const marks = known ? ribs.slice() : shuffle(ribs.slice()).slice(0, Array.isArray(rules.ribs) ? randInt(rules.ribs[1] + 1) : 0);
    const base = { o: known ? sol.o : undefined, marks };
    // se prueban conjuntos de piezas de menos a más hasta que la colocación sea única; en los
    // niveles fáciles se parte de una cantidad al azar del rango (más piezas = más fácil)
    const [min, max] = rules.fixed, from = target <= 2 ? min + randInt(max - min + 1) : min;
    for (let size = from; size <= max; size++){
      const found = [...subsets(pieces, size, 30)].find(fixed => layouts(matching({ ...base, fixed }, sol)) === 1);
      if (found) return {
        level: target, o: sol.o, solution: sol.poses, fixed: found.sort((a, b) => a - b),
        marks: marks.sort((a, b) => a - b), ribsFixed: known
      };
      yield 0;
    }
  }
  return null;
}
