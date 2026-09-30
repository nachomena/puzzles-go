/* Geometría del Sudoku 9×9: casillas i = fila * 9 + columna, dígitos 1..9 como bits 0..8. */

export const SIZE = 9, BOX = 3, CELLS = 81, ALL = 0x1ff;

export const rowOf = i => (i / SIZE) | 0;
export const colOf = i => i % SIZE;
export const boxOf = i => ((rowOf(i) / BOX) | 0) * BOX + ((colOf(i) / BOX) | 0);

export const bit = d => 1 << (d - 1);
export const digitOf = mask => 32 - Math.clz32(mask);   // máscara con un solo bit → dígito

const range = n => [...Array(n).keys()];

/** 27 unidades: 9 filas, 9 columnas y 9 cajas, en ese orden. */
export const ROWS = range(SIZE).map(r => range(SIZE).map(c => r * SIZE + c));
export const COLS = range(SIZE).map(c => range(SIZE).map(r => r * SIZE + c));
export const BOXES = range(SIZE).map(b => range(CELLS).filter(i => boxOf(i) === b));
export const UNITS = [...ROWS, ...COLS, ...BOXES];

/** Las 20 casillas que comparten fila, columna o caja con cada casilla. */
export const PEERS = range(CELLS).map(i =>
  range(CELLS).filter(j => j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i))));

/** Máscara de dígitos ya usados por los vecinos de i en `grid` (0 = vacía). */
export function usedAround(grid, i){
  let used = 0;
  for (const p of PEERS[i]) if (grid[p]) used |= bit(grid[p]);
  return used;
}
