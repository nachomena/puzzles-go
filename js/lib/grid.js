/* Utilidades para tableros cuadrados N×N indexados como i = fila * N + columna. */

/** Vecinos ortogonales, en este orden fijo (el generador depende de él). */
export const DIRS4 = Object.freeze([[1, 0], [-1, 0], [0, 1], [0, -1]]);

export const rowOf = (N, i) => (i / N) | 0;
export const colOf = (N, i) => i % N;
export const inBounds = (N, r, c) => r >= 0 && c >= 0 && r < N && c < N;

/** ¿Se tocan a y b (incluida la diagonal)? */
export const touches = (N, a, b) =>
  Math.abs(rowOf(N, a) - rowOf(N, b)) <= 1 && Math.abs(colOf(N, a) - colOf(N, b)) <= 1;

const adjacencyCache = new Map();

/**
 * Listas de vecinos precalculadas para un tamaño N.
 * n4: ortogonales (orden DIRS4); n8: los 8 alrededor (recorrido fila a fila).
 */
export function adjacency(N){
  let adj = adjacencyCache.get(N);
  if (adj) return adj;
  const n4 = [], n8 = [];
  for (let i = 0; i < N * N; i++){
    const r = rowOf(N, i), c = colOf(N, i);
    n4.push(DIRS4.filter(([dr, dc]) => inBounds(N, r + dr, c + dc)).map(([dr, dc]) => (r + dr) * N + c + dc));
    const ring = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++){
      if ((dr || dc) && inBounds(N, r + dr, c + dc)) ring.push((r + dr) * N + c + dc);
    }
    n8.push(ring);
  }
  adj = { n4, n8 };
  adjacencyCache.set(N, adj);
  return adj;
}
