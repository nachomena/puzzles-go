/* Light Up: on an N × N board with black cells (some with a number), place bulbs on the white
   ones so that all of them are lit. A bulb lights its row and its column up to the first black cell;
   two bulbs can't see each other; a black cell with a number has exactly that many bulbs next to it.
   No DOM.
   A puzzle is { n, cells }: cells[i] = -1 white, 5 black without a number, 0..4 black with a number. */

export const WHITE = -1, BLACK = 5;
export const isBlack = v => v >= 0;

/** Neighbours in a cross. */
export const around = (n, i) => {
  const r = (i / n) | 0, c = i % n, out = [];
  if (r) out.push(i - n); if (r < n - 1) out.push(i + n); if (c) out.push(i - 1); if (c < n - 1) out.push(i + 1);
  return out;
};

/** White cells that cell i sees (in its row and column, up to a black one), not counting itself. */
export function sight(n, cells, i){
  const out = [], r = (i / n) | 0, c = i % n;
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]){
    for (let y = r + dr, x = c + dc; y >= 0 && x >= 0 && y < n && x < n; y += dr, x += dc){
      if (isBlack(cells[y * n + x])) break;
      out.push(y * n + x);
    }
  }
  return out;
}

/** View of each cell, computed once. */
export const sights = (n, cells) => cells.map((v, i) => isBlack(v) ? [] : sight(n, cells, i));

/** Which cells are lit with these bulbs (bulbs[i] = 1). */
export function lit(n, cells, bulbs, see = sights(n, cells)){
  const out = new Uint8Array(n * n);
  bulbs.forEach((b, i) => { if (b){ out[i] = 1; for (const j of see[i]) out[j] = 1; } });
  return out;
}

/**
 * Counts solutions (up to `limit`). It picks the unlit cell with the fewest places from which it could
 * be lit and tries each one (the earlier ones are ruled out so the same one isn't counted twice).
 */
export function countSolutions(n, cells, { limit = 2, onSolution } = {}){
  const size = n * n, see = sights(n, cells);
  const state = new Int8Array(size);   // 0 free, 1 bulb, -1 ruled out (on white cells)
  let count = 0;
  const numbered = cells.map((v, i) => v >= 0 && v <= 4 ? i : -1).filter(i => i >= 0);

  const canBulb = i => !isBlack(cells[i]) && state[i] === 0 && !see[i].some(j => state[j] === 1);
  const numbersOk = () => numbered.every(b => {
    let on = 0, maybe = 0;
    for (const j of around(n, b)){ if (state[j] === 1) on++; else if (canBulb(j)) maybe++; }
    return on <= cells[b] && on + maybe >= cells[b];
  });

  const go = () => {
    if (count >= limit || !numbersOk()) return;
    // unlit cell with the fewest options
    let best = -1, bestOpts = null;
    for (let i = 0; i < size; i++){
      if (isBlack(cells[i]) || state[i] === 1 || see[i].some(j => state[j] === 1)) continue;
      const opts = [i, ...see[i]].filter(canBulb);
      if (!opts.length) return;
      if (!bestOpts || opts.length < bestOpts.length){ best = i; bestOpts = opts; if (opts.length === 1) break; }
    }
    if (best < 0){
      // everything lit: the numbers must be exact
      if (numbered.every(b => around(n, b).filter(j => state[j] === 1).length === cells[b])){
        count++; onSolution?.(state.map(v => v === 1 ? 1 : 0));
      }
      return;
    }
    const banned = [];
    for (const o of bestOpts){
      state[o] = 1;
      go();
      state[o] = -1;      // in the following branches this one no longer has a bulb
      banned.push(o);
      if (count >= limit) break;
    }
    for (const o of banned) state[o] = 0;
  };
  go();
  return count;
}
