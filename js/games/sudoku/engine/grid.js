/* 9×9 Sudoku geometry: cells i = row * 9 + column, digits 1..9 as bits 0..8. */

export const SIZE = 9, BOX = 3, CELLS = 81, ALL = 0x1ff;

export const rowOf = i => (i / SIZE) | 0;
export const colOf = i => i % SIZE;
export const boxOf = i => ((rowOf(i) / BOX) | 0) * BOX + ((colOf(i) / BOX) | 0);

export const bit = d => 1 << (d - 1);
export const digitOf = mask => 32 - Math.clz32(mask);   // single-bit mask → digit

const range = n => [...Array(n).keys()];

/** 27 units: 9 rows, 9 columns and 9 boxes, in that order. */
export const ROWS = range(SIZE).map(r => range(SIZE).map(c => r * SIZE + c));
export const COLS = range(SIZE).map(c => range(SIZE).map(r => r * SIZE + c));
export const BOXES = range(SIZE).map(b => range(CELLS).filter(i => boxOf(i) === b));
export const UNITS = [...ROWS, ...COLS, ...BOXES];

/** The 20 cells that share a row, column or box with each cell. */
export const PEERS = range(CELLS).map(i =>
  range(CELLS).filter(j => j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i))));

/** Mask of digits already used by i's neighbours in `grid` (0 = empty). */
export function usedAround(grid, i){
  let used = 0;
  for (const p of PEERS[i]) if (grid[p]) used |= bit(grid[p]);
  return used;
}
