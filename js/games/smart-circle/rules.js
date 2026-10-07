/* Reglas de Smart Circle sobre lo que coloca el jugador. Funciones puras, sin DOM.
   `place[pieza]` es null (en la bandeja) o { m, s } (cara y giro, ver engine/pieces.js).
   `ro` es la orientación de los nervios que tiene el jugador. */
import { PIECES, CELLS, cellsOf, crossesRib, ribsAt } from './engine/pieces.js';
import { placeKey } from './engine/solutions.js';

/** Qué pieza ocupa cada casilla (-1 = libre). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pose, p) => { if (pose) for (const c of cellsOf(p, pose)) grid[c] = p; });
  return grid;
}

/** ¿Cabe la pieza así sin pisar otras (salvo a sí misma) ni cruzar un nervio? */
export function fits(place, piece, pose, ro){
  const cells = cellsOf(piece, pose);
  if (crossesRib(cells, ribsAt(ro))) return false;
  const grid = occupancy(place);
  return cells.every(c => grid[c] < 0 || grid[c] === piece);
}

/** Piezas colocadas que cruzan algún nervio con la orientación `ro`. */
export const blockedBy = (place, ro) => place.flatMap((pose, p) => pose && crossesRib(cellsOf(p, pose), ribsAt(ro)) ? [p] : []);

const sameAsSolution = (place, solution, p) => place[p] && placeKey(p, place[p]) === placeKey(p, solution[p]);

/** Resuelto: todas las piezas puestas y como en la solución (única). */
export const isSolved = (place, solution) => PIECES.every((_, p) => sameAsSolution(place, solution, p));

/** Primera pieza movible colocada que no está como en la solución (o null). */
export function findMistake(place, solution, fixed){
  const piece = place.findIndex((pose, p) => pose && !fixed.includes(p) && !sameAsSolution(place, solution, p));
  return piece >= 0 ? { piece } : null;
}

/** ¿Sirve la orientación `ro` para la solución (no la cruza y respeta los nervios marcados)? */
export const ribsWork = (ro, solution, marks) =>
  marks.every(k => ribsAt(ro).includes(k)) && solution.every((pose, p) => !crossesRib(cellsOf(p, pose), ribsAt(ro)));

/**
 * Pista: primero, si los nervios no están bien girados, su orientación ({ ro }); si no, una pieza
 * de la solución que falte ({ piece, pose }). null si no queda nada.
 */
export function findHint(place, solution, { ro, o, marks }){
  if (!ribsWork(ro, solution, marks)) return { ro: o };
  const missing = PIECES.map((_, p) => p).filter(p => !sameAsSolution(place, solution, p));
  if (!missing.length) return null;
  const piece = missing[(Math.random() * missing.length) | 0];
  return { piece, pose: solution[piece] };
}
