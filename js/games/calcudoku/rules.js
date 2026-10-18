/* Calcudoku rules on what the player writes. Pure functions, no DOM. */
import { evaluate } from './engine/cages.js';

/** Cells that share a row or column with i. */
export const peers = (n, i) => {
  const r = (i / n) | 0, c = i % n, out = [];
  for (let k = 0; k < n; k++){ if (k !== c) out.push(r * n + k); if (k !== r) out.push(k * n + c); }
  return out;
};

/** Cells with a number repeated in their row or column, or in a full cage that doesn't give its result. */
export function conflicts(n, cages, values){
  const bad = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) if (values[i] && peers(n, i).some(j => values[j] === values[i])) bad[i] = 1;
  for (const { cells, op, target } of cages){
    const vals = cells.map(i => values[i]);
    if (vals.every(Boolean) && evaluate(op, vals) !== target) for (const i of cells) bad[i] = 1;
  }
  return bad;
}

/** Cage text: "12×", "3−", "5" (one-cell cages, just the number). */
export const cageLabel = ({ op, target }) => `${target}${{ '+': '+', '-': '−', '*': '×', '/': '÷', '': '' }[op]}`;

/** Hint: an empty cell of the cage with the fewest cells left to fill. */
export function findHint(n, cages, values, solution){
  let best = null;
  for (const { cells } of cages){
    const empty = cells.filter(i => !values[i]);
    if (empty.length && (!best || empty.length < best.length)) best = empty;
  }
  return best ? { cell: best[0], digit: solution[best[0]] } : null;
}
