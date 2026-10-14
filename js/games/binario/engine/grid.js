/* Binario (las reglas de 0h h1): llenar un tablero de n × n (n par) con dos colores, 1 y 2, de modo
   que no haya tres seguidos iguales en una fila o columna, cada fila y columna tenga tantos de uno
   como del otro y no haya dos filas (ni dos columnas) iguales. 0 = vacía. Sin DOM. */

export const EMPTY = 0, A = 1, B = 2;
export const other = v => v === A ? B : A;

/** Las 2n líneas del tablero: cada una, los índices de sus casillas (filas y luego columnas). */
const linesCache = new Map();
export function lines(n){
  if (!linesCache.has(n)){
    const rows = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));
    const cols = Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => r * n + c));
    linesCache.set(n, { rows, cols, all: [...rows, ...cols] });
  }
  return linesCache.get(n);
}

const full = (g, line) => line.every(i => g[i]);
const same = (g, a, b) => a.every((i, k) => g[i] === g[b[k]]);

/**
 * Una deducción: la primera casilla que las reglas obligan a poner, o null si no hay ninguna, o
 * { bad: true } si el tablero ya incumple una regla. { i, v, why } con why = 'trio' | 'half' | 'unique'.
 */
export function nextDeduction(n, g){
  const { rows, cols, all } = lines(n), half = n / 2;
  for (const line of all){
    // tres seguidos: X X _ , _ X X y X _ X
    for (let k = 0; k + 2 < n; k++){
      const [a, b, c] = [g[line[k]], g[line[k + 1]], g[line[k + 2]]];
      if (a && a === b && b === c) return { bad: true };
      if (a && a === b && !c) return { i: line[k + 2], v: other(a), why: 'trio' };
      if (b && b === c && !a) return { i: line[k], v: other(b), why: 'trio' };
      if (a && a === c && !b) return { i: line[k + 1], v: other(a), why: 'trio' };
    }
  }
  for (const line of all){
    // la mitad de un color ya puesta: el resto, del otro
    let ca = 0, cb = 0, empty = -1;
    for (const i of line){ if (g[i] === A) ca++; else if (g[i] === B) cb++; else if (empty < 0) empty = i; }
    if (ca > half || cb > half) return { bad: true };
    if (empty >= 0 && (ca === half || cb === half)) return { i: empty, v: ca === half ? B : A, why: 'half' };
  }
  for (const group of [rows, cols]){
    // dos líneas iguales no; y una con solo dos huecos que quedaría igual a otra completa
    for (let x = 0; x < n; x++){
      const lx = group[x], fx = full(g, lx), holes = fx ? [] : lx.filter(i => !g[i]);
      for (let y = 0; y < n; y++){
        if (x === y) continue;
        const ly = group[y];
        if (fx && x < y && full(g, ly) && same(g, lx, ly)) return { bad: true };
        if (holes.length === 2 && full(g, ly) && lx.every((i, k) => !g[i] || g[i] === g[ly[k]])){
          const k = lx.indexOf(holes[0]);
          return { i: holes[0], v: other(g[ly[k]]), why: 'unique' };
        }
      }
    }
  }
  return null;
}

/** Aplica deducciones mientras haya. Modifica g. Devuelve false si se llega a una contradicción. */
export function propagate(n, g){
  for (;;){
    const d = nextDeduction(n, g);
    if (!d) return true;
    if (d.bad) return false;
    g[d.i] = d.v;
  }
}

/**
 * Una casilla que se deduce mirando un paso más allá: si poner un color en ella lleva (deduciendo) a
 * una contradicción, va el otro. { i, v } o null.
 */
export function lookahead(n, g){
  for (let i = 0; i < g.length; i++){
    if (g[i]) continue;
    for (const v of [A, B]){
      const h = g.slice(); h[i] = v;
      if (!propagate(n, h)) return { i, v: other(v) };
    }
  }
  return null;
}

/**
 * ¿Se resuelve entero sin probar? Con `deep`, vale también mirar un paso más allá (lookahead) cuando
 * las deducciones directas se acaban.
 */
export function solvesByLogic(n, givens, deep = false){
  const g = givens.slice();
  for (;;){
    if (!propagate(n, g)) return false;
    if (g.every(Boolean)) return true;
    const d = deep && lookahead(n, g);
    if (!d) return false;
    g[d.i] = d.v;
  }
}

/**
 * Cuántas soluciones tiene (hasta `limit`). `random`: probar los colores en orden al azar;
 * `onSolution(g)`: se llama con cada una (si devuelve true, se para).
 */
export function countSolutions(n, givens, { limit = 2, random = false, onSolution } = {}){
  let count = 0, stop = false;
  const go = g => {
    if (stop || !propagate(n, g)) return;
    const i = g.indexOf(EMPTY);
    if (i < 0){
      count++;
      if (onSolution?.(g) || count >= limit) stop = true;
      return;
    }
    const order = random && Math.random() < .5 ? [B, A] : [A, B];
    for (const v of order){
      const h = g.slice(); h[i] = v;
      go(h);
      if (stop) return;
    }
  };
  go(givens.slice());
  return count;
}

/** Un tablero lleno al azar que cumple las reglas. */
export function randomSolution(n){
  let sol = null;
  countSolutions(n, new Array(n * n).fill(EMPTY), { limit: 1, random: true, onSolution: g => { sol = g.slice(); return true; } });
  return sol;
}
