/* Kakuro: an N × N board with black cells (some with sums) and white ones, filled with 1 to 9. Each
   run of consecutive white cells (across or down) adds up to what the black cell to its left or above
   it says, and doesn't repeat numbers. No DOM. Cell i = row * N + column.
   `white[i]` = 1 if the cell is white. A run is { cells: [i…], sum, dir: 'h'|'v', clue } (clue =
   the black cell with its sum). */
import { shuffle } from '../../../lib/random.js';

/** Runs of a board: the across and down ones of two or more white cells. */
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

/** Do the white cells form a single piece? */
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
 * Random shape: the first row and the first column black, the rest with symmetric black cells
 * (180° rotation) up to `black` of the area. A black cell is only placed if it leaves no white cell
 * alone in a one-cell run; then runs longer than `maxRun` are cut. The white cells, in a single piece.
 * null if it doesn't work out.
 */
export function pattern(n, black, maxRun = 9){
  const white = new Uint8Array(n * n);
  for (let r = 1; r < n; r++) for (let c = 1; c < n; c++) white[r * n + c] = 1;
  const mirror = i => { const r = (i / n) | 0, c = i % n; return (n - r) * n + (n - c); };   // within 1..n-1
  const lenAt = (i, dir) => {
    const r = (i / n) | 0, c = i % n, at = k => dir === 'h' ? white[r * n + k] : white[k * n + c];
    const pos = dir === 'h' ? c : r;
    let k = 1;
    for (let j = pos - 1; j >= 0 && at(j); j--) k++;
    for (let j = pos + 1; j < n && at(j); j++) k++;
    return k;
  };
  const near = i => { const r = (i / n) | 0, c = i % n; return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n).map(([a, b]) => a * n + b); };
  // puts black cells at i and its mirror if they leave no lone white cells; otherwise undoes it
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
  // runs that are too long: a black cell inside, where it leaves no lone ones
  for (let pass = 0; pass < 20; pass++){
    const long = runsOf(n, white).filter(r => r.cells.length > maxRun);
    if (!long.length) break;
    for (const r of long) shuffle(r.cells.slice(1, -1)).some(tryBlack);
  }
  const runs = runsOf(n, white);
  if (runs.some(r => r.cells.length < 2 || r.cells.length > maxRun) || !connected(n, white)) return null;
  // every white cell in an across run and a down run
  const inH = new Uint8Array(n * n), inV = new Uint8Array(n * n);
  for (const r of runs) for (const i of r.cells) (r.dir === 'h' ? inH : inV)[i] = 1;
  for (let i = 0; i < n * n; i++) if (white[i] && !(inH[i] && inV[i])) return null;
  return white;
}

/**
 * Fills the white cells with numbers 1 to 9 without repeating in any run. null if it can't.
 * With `bias`, that share of the runs leans towards low or high numbers: their sums come from few
 * combinations (16 in two is 7 + 9) and the board more easily has a unique solution.
 */
export function fill(n, white, runs, bias = 0, base = null){
  const lean = runs.map(() => Math.random() < bias ? (Math.random() < .5 ? -1 : 1) : 0);
  const of = Array.from({ length: n * n }, () => []);
  runs.forEach((r, k) => r.cells.forEach(i => of[i].push(k)));
  const used = new Int32Array(runs.length), out = new Int8Array(n * n);
  const cells = [...white.keys()].filter(i => white[i]);
  // `base`: whatever is already placed is kept (0 = to fill)
  if (base) for (const i of cells) if (base[i] > 0){ out[i] = base[i]; for (const k of of[i]) used[k] |= 1 << base[i]; }
  let steps = 0;
  const go = () => {
    if (++steps > 20000) return false;
    // the cell with the fewest options
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

/** Runs with the solution's sum. */
export const withSums = (runs, solution) => runs.map(r => ({ ...r, sum: r.cells.reduce((t, i) => t + solution[i], 0) }));
