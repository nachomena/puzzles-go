/* Reglas del Sudoku sobre lo que escribe el jugador. Funciones puras, sin DOM. */
import { CELLS, UNITS, PEERS, bit } from './engine/grid.js';
import { nextSingle } from './engine/logic-solver.js';
import { pick } from '../../lib/random.js';

/** Casillas cuyo número se repite en alguna de sus unidades. */
export function conflicts(values){
  const bad = new Uint8Array(CELLS);
  for (const unit of UNITS){
    const seen = new Map();
    for (const i of unit){
      const d = values[i];
      if (!d) continue;
      if (seen.has(d)){ bad[i] = 1; bad[seen.get(d)] = 1; } else seen.set(d, i);
    }
  }
  return bad;
}

export const isSolved = (values, solution) => values.every((v, i) => v === solution[i]);

/** Cuántas veces aparece cada dígito (índice 1..9). */
export function digitCounts(values){
  const counts = new Array(10).fill(0);
  for (const v of values) if (v) counts[v]++;
  return counts;
}

/** Quita la nota `d` de las casillas que ven a i (muta `notes`). */
export function clearNoteAround(notes, i, d){
  for (const p of PEERS[i]) notes[p] &= ~bit(d);
}

/**
 * Pista: primero señala un número equivocado; si no hay, la siguiente casilla que se
 * deduce con singles; si no, una casilla vacía cualquiera.
 */
/** Primer número escrito que no coincide con la solución. */
export function findMistake(values, solution){
  const wrong = values.findIndex((v, i) => v && v !== solution[i]);
  return wrong >= 0 ? { type: 'wrong', cell: wrong } : null;
}

export function findHint(values, solution){
  const mistake = findMistake(values, solution);
  if (mistake) return mistake;
  const single = nextSingle(values);
  if (single) return { type: 'place', ...single };
  const empty = values.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  if (!empty.length) return null;
  const cell = pick(empty);
  return { type: 'place', cell, digit: solution[cell] };
}
