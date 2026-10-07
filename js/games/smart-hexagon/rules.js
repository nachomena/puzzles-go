/* Reglas de Smart Hexagon sobre lo que coloca el jugador. Funciones puras, sin DOM.
   `place[pieza]` es null (en la bandeja) o { m, r, tu, tv } (cara, giro y traslación). */
import { PIECES, CELLS, cellsOf } from './engine/pieces.js';
import { placeKey } from './engine/solutions.js';

/** Qué pieza ocupa cada punto (-1 = libre). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pose, p) => { if (pose) for (const c of cellsOf(p, pose)) grid[c] = p; });
  return grid;
}

/** ¿Cabe la pieza así dentro del tablero sin pisar otras (salvo a sí misma)? */
export function fits(place, piece, pose){
  const cells = cellsOf(piece, pose);
  if (!cells) return false;
  const grid = occupancy(place);
  return cells.every(c => grid[c] < 0 || grid[c] === piece);
}

const keyOf = (p, pose) => placeKey(p, cellsOf(p, pose));
const sameAsSolution = (place, solution, p) => place[p] && keyOf(p, place[p]) === keyOf(p, solution[p]);

/** Resuelto: todas las piezas puestas y como en la solución (única). */
export const isSolved = (place, solution) => PIECES.every((_, p) => sameAsSolution(place, solution, p));

/** Primera pieza movible colocada que no está como en la solución (o null). */
export function findMistake(place, solution, fixed){
  const piece = place.findIndex((pose, p) => pose && !fixed.includes(p) && !sameAsSolution(place, solution, p));
  return piece >= 0 ? { piece } : null;
}

/** Pista: una pieza de la solución que falte ({ piece, pose }), o null. */
export function findHint(place, solution){
  const missing = PIECES.map((_, p) => p).filter(p => !sameAsSolution(place, solution, p));
  if (!missing.length) return null;
  const piece = missing[(Math.random() * missing.length) | 0];
  return { piece, pose: solution[piece] };
}
