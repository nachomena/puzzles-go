/* Kakuro: tablero de N × N con casillas negras (algunas con sumas) y blancas, que se rellenan del 1
   al 9. Cada tramo de blancas seguidas (en horizontal o en vertical) suma lo que dice la casilla negra
   que tiene a su izquierda o encima, y no repite números. Sin DOM. Casilla i = fila * N + columna.
   `white[i]` = 1 si la casilla es blanca. Un tramo es { cells: [i…], sum, dir: 'h'|'v', clue } (clue =
   la casilla negra de su suma). */
import { shuffle, randInt } from '../../../lib/random.js';

/** Tramos de un tablero: los horizontales y los verticales de dos o más blancas. */
export function runsOf(n, white){
  const runs = [];
  for (const dir of ['h', 'v']){
    for (let a = 0; a < n; a++){
      let cur = null;
      for (let b = 0; b <= n; b++){
        const i = dir === 'h' ? a * n + b : b * n + a;
        if (b < n && white[i]){
          if (!cur) cur = { cells: [], dir, clue: dir === 'h' ? i - 1 : i - n };
          cur.cells.push(i);
        } else if (cur){ runs.push(cur); cur = null; }
      }
    }
  }
  return runs;
}

/** ¿Las blancas forman una sola pieza? */
function connected(n, white){
  const cells = [...white.keys()].filter(i => white[i]);
  if (!cells.length) return false;
  const seen = new Set([cells[0]]), stack = [cells[0]];
  while (stack.length){
    const i = stack.pop(), r = (i / n) | 0, c = i % n;
    for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]){
      const j = rr * n + cc;
      if (rr >= 0 && cc >= 0 && rr < n && cc < n && white[j] && !seen.has(j)){ seen.add(j); stack.push(j); }
    }
  }
  return seen.size === cells.length;
}

/**
 * Forma al azar: la primera fila y la primera columna negras, el resto con casillas negras simétricas
 * (giro de 180°) hasta `black` del área. Una negra solo se pone si no deja ninguna blanca suelta en un
 * tramo de una casilla; luego se cortan los tramos de más de `maxRun`. Las blancas, en una sola pieza.
 * null si no sale.
 */
export function pattern(n, black, maxRun = 9){
  const white = new Uint8Array(n * n);
  for (let r = 1; r < n; r++) for (let c = 1; c < n; c++) white[r * n + c] = 1;
  const mirror = i => { const r = (i / n) | 0, c = i % n; return (n - r) * n + (n - c); };   // dentro de 1..n-1
  const lenAt = (i, dir) => {
    const r = (i / n) | 0, c = i % n, at = k => dir === 'h' ? white[r * n + k] : white[k * n + c];
    const pos = dir === 'h' ? c : r;
    let k = 1;
    for (let j = pos - 1; j >= 0 && at(j); j--) k++;
    for (let j = pos + 1; j < n && at(j); j++) k++;
    return k;
  };
  const near = i => { const r = (i / n) | 0, c = i % n; return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n).map(([a, b]) => a * n + b); };
  // pone negras en i y en su simétrica si no dejan blancas sueltas; si no, lo deshace
  const tryBlack = i => {
    const both = [...new Set([i, mirror(i)])];
    if (both.some(j => !white[j])) return false;
    both.forEach(j => { white[j] = 0; });
    const ok = both.flatMap(near).every(j => !white[j] || (lenAt(j, 'h') >= 2 && lenAt(j, 'v') >= 2));
    if (!ok) both.forEach(j => { white[j] = 1; });
    return ok;
  };
  const area = (n - 1) * (n - 1);
  let blacks = 0;
  for (const i of shuffle([...white.keys()].filter(i => white[i]))){
    if (blacks >= area * black) break;
    if (tryBlack(i)) blacks += i === mirror(i) ? 1 : 2;
  }
  // tramos demasiado largos: una negra dentro, donde no deje sueltas
  for (let pass = 0; pass < 20; pass++){
    const long = runsOf(n, white).filter(r => r.cells.length > maxRun);
    if (!long.length) break;
    for (const r of long) shuffle(r.cells.slice(1, -1)).some(tryBlack);
  }
  const runs = runsOf(n, white);
  if (runs.some(r => r.cells.length < 2 || r.cells.length > maxRun) || !connected(n, white)) return null;
  // toda blanca en un tramo horizontal y en uno vertical
  const inH = new Uint8Array(n * n), inV = new Uint8Array(n * n);
  for (const r of runs) for (const i of r.cells) (r.dir === 'h' ? inH : inV)[i] = 1;
  for (let i = 0; i < n * n; i++) if (white[i] && !(inH[i] && inV[i])) return null;
  return white;
}

/**
 * Rellena las blancas con números del 1 al 9 sin repetir en ningún tramo. null si no puede.
 * Con `bias`, esa parte de los tramos tira a números bajos o a altos: sus sumas salen de pocas
 * combinaciones (16 en dos es 7 + 9) y el tablero tiene más fácil una solución única.
 */
export function fill(n, white, runs, bias = 0, base = null){
  const lean = runs.map(() => Math.random() < bias ? (Math.random() < .5 ? -1 : 1) : 0);
  const of = Array.from({ length: n * n }, () => []);
  runs.forEach((r, k) => r.cells.forEach(i => of[i].push(k)));
  const used = new Int32Array(runs.length), out = new Int8Array(n * n);
  const cells = [...white.keys()].filter(i => white[i]);
  // `base`: lo que ya está puesto se conserva (0 = por rellenar)
  if (base) for (const i of cells) if (base[i] > 0){ out[i] = base[i]; for (const k of of[i]) used[k] |= 1 << base[i]; }
  let steps = 0;
  const go = () => {
    if (++steps > 20000) return false;
    // la casilla con menos opciones
    let best = -1, bestMask = 0, bestN = 10;
    for (const i of cells){
      if (out[i]) continue;
      let mask = 0x3fe;
      for (const k of of[i]) mask &= ~used[k];
      let cnt = 0; for (let m = mask; m; m &= m - 1) cnt++;
      if (cnt < bestN){ best = i; bestMask = mask; bestN = cnt; if (cnt <= 1) break; }
    }
    if (best < 0) return true;
    if (!bestN) return false;
    const digits = []; for (let d = 1; d <= 9; d++) if (bestMask & (1 << d)) digits.push(d);
    const pull = of[best].reduce((t, k) => t + lean[k], 0);
    const order = shuffle(digits).map(d => [d, pull * (d - 5) + Math.random() * 2]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    for (const d of order){
      out[best] = d;
      for (const k of of[best]) used[k] |= 1 << d;
      if (go()) return true;
      for (const k of of[best]) used[k] &= ~(1 << d);
      out[best] = 0;
    }
    return false;
  };
  return go() ? Array.from(out) : null;
}

/** Tramos con la suma de la solución. */
export const withSums = (runs, solution) => runs.map(r => ({ ...r, sum: r.cells.reduce((t, i) => t + solution[i], 0) }));
