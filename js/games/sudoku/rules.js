/* Sudoku rules on what the player writes. Pure functions, no DOM. */
import { CELLS, UNITS, PEERS, bit } from './engine/grid.js';
import { nextSingle } from './engine/logic-solver.js';
import { pick } from '../../lib/random.js';

/** Cells whose number repeats in one of their units. */
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

/** How many times each digit appears (index 1..9). */
export function digitCounts(values){
  const counts = new Array(10).fill(0);
  for (const v of values) if (v) counts[v]++;
  return counts;
}

/** Removes note `d` from the cells that see i (mutates `notes`). */
export function clearNoteAround(notes, i, d){
  for (const p of PEERS[i]) notes[p] &= ~bit(d);
}

/**
 * Hint: first point out a wrong number; if there is none, the next cell deduced with singles;
 * otherwise, any empty cell.
 */
/** First written number that doesn't match the solution. */
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
