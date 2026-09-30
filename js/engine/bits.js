/* Operaciones con máscaras de bits: cada fila del tablero es un entero con un bit por columna. */

export const popcount = x => { let c = 0; while (x){ x &= x - 1; c++; } return c; };

/** Casillas de la máscara más sus vecinas horizontales. */
export const spread = m => m | (m << 1) | (m >> 1);

const rowMaskCache = new Map();

/** Todas las filas válidas: K estrellas y ninguna pareja contigua. */
export function rowMasks(N, K){
  const key = N + '_' + K;
  let out = rowMaskCache.get(key);
  if (out) return out;
  out = [];
  for (let m = 0; m < (1 << N); m++) if (popcount(m) === K && !(m & (m << 1))) out.push(m);
  rowMaskCache.set(key, out);
  return out;
}

/** Máscara de columnas que ya tienen sus K estrellas. */
export function fullColumns(col, N, K){
  let full = 0;
  for (let c = 0; c < N; c++) if (col[c] >= K) full |= 1 << c;
  return full;
}

/**
 * ¿Pueden todas las columnas completar sus estrellas en las `rowsLeft` filas restantes?
 * Como las estrellas no se tocan, una columna admite como mucho una estrella cada dos filas.
 * `blocked` marca las columnas vetadas en la fila siguiente.
 */
export function columnsCanFinish(col, N, K, rowsLeft, blocked){
  for (let c = 0; c < N; c++){
    const need = K - col[c];
    if (need > 0 && need > Math.ceil((rowsLeft - ((blocked >> c) & 1)) / 2)) return false;
  }
  return true;
}

/** Filas en máscara → lista de índices de casilla. */
export function rowsToCells(N, rows){
  const cells = [];
  rows.forEach((m, r) => { for (let c = 0; c < N; c++) if ((m >> c) & 1) cells.push(r * N + c); });
  return cells;
}
