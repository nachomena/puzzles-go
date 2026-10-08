/* KenKen: cuadrado de N × N con los números del 1 al N sin repetir en filas ni columnas, dividido en
   jaulas; cada jaula da el resultado de una operación con sus números (+, −, ×, ÷; en − y ÷, del
   mayor al menor y con dos casillas). Sin DOM. Casilla i = fila * N + columna.
   Una jaula es { cells: [i…], op: '+'|'-'|'*'|'/'|'', target }. */
import { shuffle, randInt } from '../../../lib/random.js';

/** Cuadrado latino al azar: casilla a casilla con números en orden aleatorio y vuelta atrás. */
export function latin(n){
  const out = new Array(n * n).fill(0), row = new Int32Array(n), col = new Int32Array(n);
  const go = i => {
    if (i === n * n) return true;
    const r = (i / n) | 0, c = i % n;
    for (const v of shuffle([...Array(n).keys()].map(k => k + 1))){
      const b = 1 << v;
      if ((row[r] & b) || (col[c] & b)) continue;
      out[i] = v; row[r] |= b; col[c] |= b;
      if (go(i + 1)) return true;
      row[r] &= ~b; col[c] &= ~b;
    }
    return false;
  };
  go(0);
  return out;
}

/** Resultado de la operación con estos números, o null si no vale (− y ÷ solo con dos). */
export function evaluate(op, vals){
  if (op === '') return vals.length === 1 ? vals[0] : null;
  if (op === '+') return vals.reduce((a, b) => a + b, 0);
  if (op === '*') return vals.reduce((a, b) => a * b, 1);
  if (vals.length !== 2) return null;
  const [hi, lo] = vals[0] >= vals[1] ? vals : [vals[1], vals[0]];
  if (op === '-') return hi - lo;
  return hi % lo === 0 ? hi / lo : null;
}

/** Divide el tablero en jaulas unidas de `sizes` casillas (tamaño al azar de la lista). */
export function partition(n, sizes){
  const owner = new Int16Array(n * n).fill(-1), cages = [];
  const nb = i => { const r = (i / n) | 0, c = i % n, o = []; if (r) o.push(i - n); if (r < n - 1) o.push(i + n); if (c) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
  for (const start of shuffle([...Array(n * n).keys()])){
    if (owner[start] >= 0) continue;
    const want = sizes[randInt(sizes.length)], cells = [start];
    owner[start] = cages.length;
    while (cells.length < want){
      const opts = cells.flatMap(nb).filter(j => owner[j] < 0);
      if (!opts.length) break;
      const j = opts[randInt(opts.length)];
      owner[j] = cages.length; cells.push(j);
    }
    cages.push(cells);
  }
  return { cages, owner };
}

/**
 * Cuenta soluciones (hasta `limit`), jaula a jaula: primero la que tiene menos combinaciones posibles
 * con lo que ya está puesto en sus filas y columnas.
 */
export function countSolutions(n, cages, limit = 2){
  const rowOf = i => (i / n) | 0, colOf = i => i % n;
  // combinaciones de cada jaula (sin repetir número en una misma fila o columna dentro de ella)
  const tuples = cages.map(({ cells, op, target }) => {
    const out = [], vals = new Array(cells.length);
    const go = k => {
      if (k === cells.length){ if (evaluate(op, vals) === target) out.push(vals.slice()); return; }
      for (let v = 1; v <= n; v++){
        let ok = true;
        for (let j = 0; j < k; j++) if (vals[j] === v && (rowOf(cells[j]) === rowOf(cells[k]) || colOf(cells[j]) === colOf(cells[k]))){ ok = false; break; }
        if (!ok) continue;
        vals[k] = v; go(k + 1);
      }
    };
    go(0);
    return out;
  });
  const rowMask = new Int32Array(n), colMask = new Int32Array(n), done = new Uint8Array(cages.length);
  let count = 0;
  const fits = (c, t) => cages[c].cells.every((i, k) => !(rowMask[rowOf(i)] & (1 << t[k])) && !(colMask[colOf(i)] & (1 << t[k])));
  const apply = (c, t, on) => cages[c].cells.forEach((i, k) => { rowMask[rowOf(i)] ^= 1 << t[k]; colMask[colOf(i)] ^= 1 << t[k]; });
  const go = left => {
    if (!left){ count++; return; }
    let best = -1, bestList = null;
    for (let c = 0; c < cages.length; c++){
      if (done[c]) continue;
      const list = tuples[c].filter(t => fits(c, t));
      if (!list.length) return;
      if (!bestList || list.length < bestList.length){ best = c; bestList = list; if (list.length === 1) break; }
    }
    done[best] = 1;
    for (const t of bestList){
      apply(best, t);
      go(left - 1);
      apply(best, t);
      if (count >= limit) break;
    }
    done[best] = 0;
  };
  go(cages.length);
  return count;
}
