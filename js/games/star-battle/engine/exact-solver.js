/* Búsqueda exhaustiva fila a fila con poda. */
import { rowMasks, spread, fullColumns, columnsCanFinish } from './bits.js';
import { popcount } from '../../../lib/bits.js';
import { shuffle } from '../../../lib/random.js';

const RANDOM_SOLUTION_BUDGET = 20000;

/** Coloca estrellas al azar cumpliendo filas, columnas y no-contacto (sin regiones). */
export function randomSolution(N, K){
  const masks = rowMasks(N, K), col = new Int8Array(N), rows = [];
  let nodes = 0;
  function rec(r, prev){
    if (++nodes > RANDOM_SOLUTION_BUDGET) return false;
    if (r === N) return true;
    const forbid = fullColumns(col, N, K) | spread(prev);
    for (const m of shuffle(masks.slice())){
      if (m & forbid) continue;
      for (let c = 0; c < N; c++) if ((m >> c) & 1) col[c]++;
      if (columnsCanFinish(col, N, K, N - 1 - r, spread(m))){
        rows[r] = m;
        if (rec(r + 1, m)) return true;
      }
      for (let c = 0; c < N; c++) if ((m >> c) & 1) col[c]--;
    }
    return false;
  }
  return rec(0, 0) ? rows.slice() : null;
}

/**
 * Cuenta soluciones hasta `limit`.
 * `block` (opcional): máscaras por fila de casillas que se sabe que están vacías.
 * Devuelve { count, sols } o null si se agota el presupuesto de nodos.
 */
export function solve(N, K, reg, limit, budget, block){
  const masks = rowMasks(N, K);
  // rr[g * N + r]: máscara de las casillas de la región g en la fila r
  const rr = new Int32Array(N * N);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) rr[reg[r * N + c] * N + r] |= 1 << c;
  const col = new Int8Array(N), rc = new Int8Array(N), byLast = new Int16Array(N), cur = [], sols = [];
  let nodes = 0, over = false;

  function feasible(r, m){
    const R = N - 1 - r;
    const full = fullColumns(col, N, K), blk = spread(m);
    if (!columnsCanFinish(col, N, K, R, blk)) return false;
    // Cada región debe caber en las filas que le quedan, y las que terminan
    // en la misma fila no pueden pedir más estrellas de las que caben.
    byLast.fill(0);
    for (let g = 0; g < N; g++){
      const need = K - rc[g]; if (need <= 0) continue;
      let cap = 0, last = -1;
      for (let q = r + 1; q < N; q++){
        let av = rr[g * N + q] & ~full;
        if (q === r + 1) av &= ~blk;
        if (block) av &= ~block[q];
        if (av){ cap += Math.min(K, popcount(av)); last = q; }
      }
      if (cap < need) return false;
      byLast[last] += need;
    }
    let acc = 0;
    for (let t = 1; t <= R; t++){ acc += byLast[r + t]; if (acc > K * t) return false; }
    return true;
  }
  function place(r, m, delta){
    let ok = true;
    for (let c = 0; c < N; c++) if ((m >> c) & 1){
      col[c] += delta;
      if ((rc[reg[r * N + c]] += delta) > K) ok = false;
    }
    return ok;
  }
  function rec(r, prev){
    if (++nodes > budget){ over = true; return true; }
    if (r === N){ sols.push(cur.slice()); return sols.length >= limit; }
    const forbid = fullColumns(col, N, K) | spread(prev) | (block ? block[r] : 0);
    for (const m of masks){
      if (m & forbid) continue;
      const ok = place(r, m, 1);
      if (ok && feasible(r, m)){
        cur[r] = m;
        if (rec(r + 1, m)){ place(r, m, -1); return true; }
      }
      place(r, m, -1);
    }
    return false;
  }
  rec(0, 0);
  return over ? null : { count: sols.length, sols };
}
