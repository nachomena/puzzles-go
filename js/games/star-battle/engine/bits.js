/* Star Battle row masks: each row of the board is an integer with one bit per column. */
import { popcount } from '../../../lib/bits.js';


/** The mask's cells plus their horizontal neighbours. */
export const spread = m => m | (m << 1) | (m >> 1);

const rowMaskCache = new Map();

/** Every valid row: K stars and no adjacent pair. */
export function rowMasks(N, K){
  const key = N + '_' + K;
  let out = rowMaskCache.get(key);
  if (out) return out;
  out = [];
  for (let m = 0; m < (1 << N); m++) if (popcount(m) === K && !(m & (m << 1))) out.push(m);
  rowMaskCache.set(key, out);
  return out;
}

/** Mask of the columns that already have their K stars. */
export function fullColumns(col, N, K){
  let full = 0;
  for (let c = 0; c < N; c++) if (col[c] >= K) full |= 1 << c;
  return full;
}

/**
 * Can every column complete its stars in the `rowsLeft` remaining rows?
 * As stars don't touch, a column allows at most one star every two rows.
 * `blocked` marks the columns ruled out in the next row.
 */
export function columnsCanFinish(col, N, K, rowsLeft, blocked){
  for (let c = 0; c < N; c++){
    const need = K - col[c];
    if (need > 0 && need > Math.ceil((rowsLeft - ((blocked >> c) & 1)) / 2)) return false;
  }
  return true;
}

/** Rows as masks → list of cell indices. */
export function rowsToCells(N, rows){
  const cells = [];
  rows.forEach((m, r) => { for (let c = 0; c < N; c++) if ((m >> c) & 1) cells.push(r * N + c); });
  return cells;
}
