/* Reglas de IQ Puzzler Pro sobre lo que coloca el jugador. Funciones puras, sin DOM.
   `place[piece]` es null (en la bandeja) o { m, r, x, y }. Cada reto tiene una sola solución. */
import { CELLS, cellsOf } from './engine/pieces.js';

/** Qué pieza ocupa cada casilla (-1 = libre). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pose, piece) => { if (pose) for (const c of cellsOf(piece, pose) || []) grid[c] = piece; });
  return grid;
}

/** ¿Cabe la pieza ahí sin salirse ni pisar otras (sin contar su posición actual)? */
export function fits(place, piece, pose){
  const cells = cellsOf(piece, pose);
  if (!cells) return false;
  const grid = occupancy(place);
  return cells.every(c => grid[c] < 0 || grid[c] === piece);
}

/** ¿Está la pieza donde va en la solución? (se comparan casillas: una pieza simétrica tiene varias posturas iguales) */
export const inPlace = (piece, pose, solution) =>
  !!pose && cellsOf(piece, pose).join() === cellsOf(piece, solution[piece]).join();

/** Todas las piezas puestas (como no se pisan, llenan el tablero). */
export const isSolved = place => place.every(Boolean);

/** Primera pieza puesta por el jugador que no está en su sitio, o null. */
export function findMistake(place, solution, fixed){
  const piece = place.findIndex((pose, p) => pose && !fixed.includes(p) && !inPlace(p, pose, solution));
  return piece >= 0 ? { piece } : null;
}

/** Pista: la pieza que cubre la primera casilla libre, con su sitio de la solución. */
export function findHint(place, solution){
  const grid = occupancy(place), free = grid.indexOf(-1);
  if (free < 0) return null;
  const piece = solution.findIndex((pose, p) => !inPlace(p, place[p], solution) && cellsOf(p, pose).includes(free));
  return piece >= 0 ? { piece, pose: solution[piece] } : null;
}
