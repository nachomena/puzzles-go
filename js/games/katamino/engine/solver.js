/* Búsqueda de soluciones de un PENTA: cubrir el tablero de W × n con n pentominós.
   Se rellena siempre la primera casilla libre (en orden de lectura) con alguna orientación de una
   pieza sin usar cuya primera casilla caiga ahí.
   El tablero (hasta 5 × 12 = 60 casillas) va en dos enteros de 30 bits: filas 0–5 y filas 6–11.
   Las casillas de más allá de la fila n se dan por ocupadas, así una pieza no puede salirse. */
import { W, MAX_N, ORIENTATIONS, cellsOf } from './pieces.js';

const HALF = 30, SIZE = W * MAX_N, FULL = (1 << HALF) - 1;
const bitLo = i => i < HALF ? 1 << i : 0, bitHi = i => i < HALF ? 0 : 1 << (i - HALF);

/**
 * Colocaciones que tienen su primera casilla en i: [{ piece, pose, lo, hi }].
 * Solo se descartan las que se salen por los lados o por abajo del tablero más largo.
 */
const AT = Array.from({ length: SIZE }, (_, i) => {
  const ax = i % W, ay = (i / W) | 0, out = [];
  ORIENTATIONS.forEach((list, piece) => list.forEach(o => {
    const [x0, y0] = o.cells[0], x = ax - x0, y = ay - y0;
    if (x < 0 || x + o.w > W || y + o.h > MAX_N) return;
    let lo = 0, hi = 0;
    for (const [cx, cy] of o.cells){ const c = (y + cy) * W + x + cx; lo |= bitLo(c); hi |= bitHi(c); }
    out.push({ piece, pose: Object.freeze({ m: o.m, r: o.r, x, y }), lo, hi });
  }));
  return out;
});

/** Bits ocupados al empezar: lo que queda fuera de un tablero de n filas. */
function outside(n){
  let lo = 0, hi = 0;
  for (let c = W * n; c < SIZE; c++){ lo |= bitLo(c); hi |= bitHi(c); }
  return [lo, hi];
}

/**
 * Cuenta las soluciones (hasta `limit`).
 * @param {number[]} pieces  piezas del PENTA (tantas como filas)
 * @param {{ fixed?: {piece:number, pose:{m,r,x,y}}[], limit?: number, onSolution?: (sol) => void|boolean }} [opts]
 *   fixed: piezas ya colocadas. onSolution recibe [{ piece, pose }] de todas las piezas; si devuelve
 *   true, se para.
 * @returns {number}  0 también si las fijas se salen o se pisan
 */
export function countSolutions(pieces, { fixed = [], limit = Infinity, onSolution } = {}){
  const n = pieces.length;
  let [lo, hi] = outside(n);
  const want = new Uint8Array(12), chosen = new Array(12).fill(null);
  for (const p of pieces) want[p] = 1;
  for (const { piece, pose } of fixed){
    const cells = cellsOf(piece, pose, n);
    if (!want[piece] || !cells) return 0;
    for (const c of cells){
      if ((lo & bitLo(c)) || (hi & bitHi(c))) return 0;
      lo |= bitLo(c); hi |= bitHi(c);
    }
    want[piece] = 0;
    chosen[piece] = pose;
  }
  let count = 0, stop = false;

  const search = (lo, hi) => {
    // primera casilla libre: el bit más bajo a 0
    let i;
    if (lo !== FULL) i = 31 - Math.clz32(~lo & (lo + 1));
    else if (hi !== FULL) i = HALF + 31 - Math.clz32(~hi & (hi + 1));
    else {
      count++;
      if (onSolution && onSolution(pieces.map(piece => ({ piece, pose: { ...chosen[piece] } })))) stop = true;
      if (count >= limit) stop = true;
      return;
    }
    for (const pl of AT[i]){
      if (!want[pl.piece] || (lo & pl.lo) || (hi & pl.hi)) continue;
      want[pl.piece] = 0;
      chosen[pl.piece] = pl.pose;
      search(lo | pl.lo, hi | pl.hi);
      want[pl.piece] = 1;
      if (stop) return;
    }
  };
  search(lo, hi);
  return count;
}

/** Primera solución que respeta las piezas `fixed`, o null. */
export function solve(pieces, fixed = []){
  let found = null;
  countSolutions(pieces, { fixed, limit: 1, onSolution: sol => { found = sol; return true; } });
  return found;
}
