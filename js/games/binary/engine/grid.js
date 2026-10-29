/* Binary: fill an n × n board (n even) with two colours, 1 and 2, so that there
   are no three of the same in a row in any row or column, each row and column has as many of one as of
   the other and no two rows (or two columns) are the same. 0 = empty. No DOM. */

export const EMPTY = 0, A = 1, B = 2;
export const other = v => v === A ? B : A;

/** The board's 2n lines: each one, the indices of its cells (rows and then columns). */
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
 * A deduction: the first cell the rules force, or null if there is none, or { bad: true } if the board
 * already breaks a rule. { i, v, why } with why = 'trio' | 'half' | 'unique'.
 */
export function nextDeduction(n, g){
  const { rows, cols, all } = lines(n), half = n / 2;
  for (const line of all){
    // three in a row: X X _ , _ X X and X _ X
    for (let k = 0; k + 2 < n; k++){
      const [a, b, c] = [g[line[k]], g[line[k + 1]], g[line[k + 2]]];
      if (a && a === b && b === c) return { bad: true };
      if (a && a === b && !c) return { i: line[k + 2], v: other(a), why: 'trio' };
      if (b && b === c && !a) return { i: line[k], v: other(b), why: 'trio' };
      if (a && a === c && !b) return { i: line[k + 1], v: other(a), why: 'trio' };
    }
  }
  for (const line of all){
    // half of one colour already placed: the rest, the other
    let ca = 0, cb = 0, empty = -1;
    for (const i of line){ if (g[i] === A) ca++; else if (g[i] === B) cb++; else if (empty < 0) empty = i; }
    if (ca > half || cb > half) return { bad: true };
    if (empty >= 0 && (ca === half || cb === half)) return { i: empty, v: ca === half ? B : A, why: 'half' };
  }
  for (const group of [rows, cols]){
    // no two equal lines; and one with only two gaps that would end up equal to a complete one
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

/** Applies deductions while there are any. Modifies g. Returns false on reaching a contradiction. */
export function propagate(n, g){
  for (;;){
    const d = nextDeduction(n, g);
    if (!d) return true;
    if (d.bad) return false;
    g[d.i] = d.v;
  }
}

/**
 * A cell deduced by looking one step ahead: if putting a colour in it leads (by deduction) to a
 * contradiction, the other one goes there. { i, v } or null.
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
 * Is it solved completely without guessing? With `deep`, looking one step ahead (lookahead) also counts
 * when the direct deductions run out.
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
 * How many solutions it has (up to `limit`). `random`: try the colours in random order;
 * `onSolution(g)`: called with each one (if it returns true, it stops).
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

/** A random full board that meets the rules. */
export function randomSolution(n){
  let sol = null;
  countSolutions(n, new Array(n * n).fill(EMPTY), { limit: 1, random: true, onSolution: g => { sol = g.slice(); return true; } });
  return sol;
}
