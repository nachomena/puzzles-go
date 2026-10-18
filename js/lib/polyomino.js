/* Pieces made of cells (polyominoes) and a solution search to fill a board with them.
   No DOM. Used by Pentominoes (5 × n) and Fit (11 × 5).

   A placed piece is { m, r, x, y }: m = side (0, 1 = flipped), r = clockwise 90° rotation (0..3)
   and (x, y) the top-left corner of its box. */

/**
 * Cells [x, y] of a shape with side `m` and rotation `r`, from the corner of its box and in reading
 * order, with its width and height.
 */
export function orientCells(cells, m, r){
  let out = cells.map(([x, y]) => [m ? -x : x, y]);
  for (let k = 0; k < r; k++) out = out.map(([x, y]) => [-y, x]);
  const minX = Math.min(...out.map(c => c[0])), minY = Math.min(...out.map(c => c[1]));
  out = out.map(([x, y]) => [x - minX, y - minY]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return { cells: out, w: Math.max(...out.map(c => c[0])) + 1, h: Math.max(...out.map(c => c[1])) + 1 };
}

/** Distinct orientations of a shape: [{ m, r, cells, w, h }] (duplicates by symmetry are removed). */
export function orientationsOf(cells){
  const seen = new Set(), out = [];
  for (let m = 0; m < 2; m++) for (let r = 0; r < 4; r++){
    const o = orientCells(cells, m, r), key = JSON.stringify(o.cells);
    if (!seen.has(key)){ seen.add(key); out.push({ m, r, ...o }); }
  }
  return out;
}

/**
 * Solution search to fill a W × H board (up to 60 cells) with pieces.
 * It always fills the first free cell, in reading order (`order: 'rows'`) or by columns
 * (`'columns'`): it pays to walk the board's short side first. The board is held in two 30-bit
 * integers.
 * @param {{ W: number, H: number, shapes: number[][][], order?: 'rows'|'columns' }} o
 *   shapes: cells [x, y] of each piece
 */
export function createPacker({ W, H, shapes, order = 'rows' }){
  const SIZE = W * H, HALF = 30, FULL = (1 << HALF) - 1;
  if (SIZE > 2 * HALF) throw new Error('Board too large');
  const index = order === 'columns' ? (x, y) => x * H + y : (x, y) => y * W + x;
  const bitLo = i => i < HALF ? 1 << i : 0, bitHi = i => i < HALF ? 0 : 1 << (i - HALF);
  const orientations = shapes.map(orientationsOf);

  // Placements whose first cell (in fill order) is i
  const AT = Array.from({ length: SIZE }, () => []);
  orientations.forEach((list, piece) => list.forEach(o => {
    for (let y = 0; y + o.h <= H; y++) for (let x = 0; x + o.w <= W; x++){
      const idx = o.cells.map(([a, b]) => index(x + a, y + b));
      let lo = 0, hi = 0;
      for (const c of idx){ lo |= bitLo(c); hi |= bitHi(c); }
      AT[Math.min(...idx)].push({ piece, pose: Object.freeze({ m: o.m, r: o.r, x, y }), lo, hi });
    }
  }));

  /** Cells [x, y] of a placed piece, or null if it goes off the board. */
  const cellsOf = (piece, { m, r, x, y }) => {
    const o = orientCells(shapes[piece], m, r);
    if (x < 0 || y < 0 || x + o.w > W || y + o.h > H) return null;
    return o.cells.map(([a, b]) => [x + a, y + b]);
  };

  /**
   * Counts the solutions (up to `limit`).
   * @param {number[]} pieces  pieces to place (fixed ones included)
   * @param {object} [opts]
   *   fixed: [{ piece, pose }] already placed · limit · onSolution([{ piece, pose }]) → true to stop
   *   blocked: cells [x, y] that must not be filled (e.g. the spare rows)
   *   random: () => number in [0, 1) to walk the placements in another order
   * @returns {number}  also 0 if the fixed ones go off the board or overlap
   */
  function countSolutions(pieces, { fixed = [], limit = Infinity, onSolution, blocked = [], random } = {}){
    let lo = 0, hi = 0;
    const take = ([x, y]) => {
      const c = index(x, y);
      if ((lo & bitLo(c)) || (hi & bitHi(c))) return false;
      lo |= bitLo(c); hi |= bitHi(c);
      return true;
    };
    for (const c of blocked) take(c);
    const want = new Uint8Array(shapes.length), chosen = new Array(shapes.length).fill(null);
    for (const p of pieces) want[p] = 1;
    for (const { piece, pose } of fixed){
      const cells = cellsOf(piece, pose);
      if (!want[piece] || !cells || !cells.every(take)) return 0;
      want[piece] = 0;
      chosen[piece] = pose;
    }
    let count = 0, stop = false;
    const search = (lo, hi) => {
      // first free cell: the lowest 0 bit
      let i;
      if (lo !== FULL) i = 31 - Math.clz32(~lo & (lo + 1));
      else if (hi !== FULL) i = HALF + 31 - Math.clz32(~hi & (hi + 1));
      else {
        count++;
        if (onSolution && onSolution(pieces.map(piece => ({ piece, pose: { ...chosen[piece] } })))) stop = true;
        if (count >= limit) stop = true;
        return;
      }
      const list = random ? rotated(AT[i], random) : AT[i];
      for (let k = 0, n = list.length; k < n; k++){
        const pl = list[k];
        if (!want[pl.piece] || (lo & pl.lo) || (hi & pl.hi)) continue;
        want[pl.piece] = 0;
        chosen[pl.piece] = pl.pose;
        search(lo | pl.lo, hi | pl.hi);
        want[pl.piece] = 1;
        if (stop) return;
      }
    };
    // bits that aren't cells count as full: full board = both halves at FULL
    if (SIZE <= HALF){ lo |= FULL & ~((1 << SIZE) - 1); hi = FULL; }
    else hi |= FULL & ~((1 << (SIZE - HALF)) - 1);
    search(lo, hi);
    return count;
  }

  /** The list starting at a random point (for different solutions each time). */
  const rotated = (list, random) => { const k = (random() * list.length) | 0; return list.slice(k).concat(list.slice(0, k)); };

  /** First solution that respects the `fixed` pieces, or null. */
  function solve(pieces, opts = {}){
    let found = null;
    countSolutions(pieces, { ...opts, limit: 1, onSolution: sol => { found = sol; return true; } });
    return found;
  }

  return { W, H, orientations, cellsOf, countSolutions, solve };
}
