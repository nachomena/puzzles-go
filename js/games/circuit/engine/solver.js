/* Circuit solution search.
   It always fills the first empty cell (reading order); each placement must match the path exits of the
   neighbouring pieces already placed and not take paths off the board.
   A solution is valid if every path goes from dot to dot (no loose ends or closed circuits) and the dots
   are exactly the puzzle's. */
import { PIECES, DIRS, DIR_BIT, OPPOSITE, W as BOARD_W, H as BOARD_H } from './pieces.js';
import { shuffle } from '../../../lib/random.js';
import { popcount } from '../../../lib/bits.js';

const maskOf = s => [...s].reduce((m, d) => m | DIR_BIT[d], 0);
/** Rotates 90° clockwise (and downwards): E→S, S→W, W→N, N→E. */
const ROT_BIT = { 1: 2, 2: 4, 4: 8, 8: 1 };
const rotMask = m => [1, 2, 4, 8].reduce((r, b) => (m & b) ? r | ROT_BIT[b] : r, 0);

/** Sides of a piece: 0 and 1 with a path; 2 = blank side (only pieces with `blank`). */
export const faceCount = piece => PIECES[piece].faces.length + (PIECES[piece].blank ? 1 : 0);

/**
 * Piece with a side and a rotation (0..3, of 90° clockwise): cells [x, y] from its top-left corner in
 * reading order, path exit of each cell and dots (indices).
 */
export function orient(piece, face, rot){
  const p = PIECES[piece], f = p.faces[face] || p.faces[0], blank = face >= p.faces.length;
  let cells = f.cells.map(c => c.slice()), masks = f.ports.map(s => blank ? 0 : maskOf(s));
  let dots = blank ? [] : f.dots.map(d => d.slice());
  for (let r = 0; r < rot; r++){
    // rotate 90°: (x, y) → (-y, x)
    cells = cells.map(([x, y]) => [-y, x]); dots = dots.map(([x, y]) => [-y, x]); masks = masks.map(rotMask);
  }
  const minX = Math.min(...cells.map(c => c[0])), minY = Math.min(...cells.map(c => c[1]));
  const norm = cells.map(([x, y]) => [x - minX, y - minY]);
  const dotIdx = dots.map(([x, y]) => cells.findIndex(c => c[0] === x && c[1] === y));
  const order = norm.map((c, i) => i).sort((a, b) => norm[a][1] - norm[b][1] || norm[a][0] - norm[b][0]);
  const oc = order.map(i => norm[i]);
  return {
    piece, face, rot, cells: oc, masks: order.map(i => masks[i]),
    dots: new Set(dotIdx.map(i => order.indexOf(i))),
    w: Math.max(...oc.map(c => c[0])) + 1, h: Math.max(...oc.map(c => c[1])) + 1
  };
}

/** Every distinct orientation of each piece (duplicates by symmetry are removed). */
export const ORIENTATIONS = PIECES.map((_, piece) => {
  const seen = new Set(), out = [];
  for (let face = 0; face < faceCount(piece); face++) for (let rot = 0; rot < 4; rot++){
    const o = orient(piece, face, rot);
    const key = JSON.stringify([o.cells, o.masks, [...o.dots].sort()]);
    if (!seen.has(key)){ seen.add(key); out.push(o); }
  }
  return out;
});

/**
 * Counts solutions up to `limit`.
 * @param {object} clues
 *   dots:     cell indices with a dot (required except to enumerate everything)
 *   masks:    (optional) known path exit per cell (array of W*H, null = unknown)
 *   regions:  (optional) piece id per cell: the outline of each piece is known
 *   fixed:    (optional) [{ piece, face, rot, x, y }] placed pieces
 * @param {{ limit?: number, random?: boolean, W?: number, H?: number, onSolution?: Function, budget?: number }} opts
 */
export function solve(clues = {}, { limit = 2, random = false, W = BOARD_W, H = BOARD_H, onSolution = null, budget = Infinity } = {}){
  const N = W * H;
  const owner = new Int8Array(N).fill(-1), mask = new Uint8Array(N), dot = new Uint8Array(N);
  const wantDots = clues.dots ? new Set(clues.dots) : null;
  const used = new Uint8Array(PIECES.length), placed = [];
  let count = 0, first = null, nodes = 0, over = false;
  // Two solutions that look the same (e.g. two equal pieces on the blank side swapped) are the same
  const seenLooks = new Set();
  const look = () => placed.map(p => {
    const o = ORIENTATIONS[p.piece].find(o => o.face === p.face && o.rot === p.rot);
    return p.cell + ':' + JSON.stringify(o.cells) + JSON.stringify(o.masks) + [...o.dots].join();
  }).sort().join('|');

  const fits = (o, e) => {
    const ax = e % W - o.cells[0][0], ay = ((e / W) | 0) - o.cells[0][1];
    const idx = [];
    for (const [cx, cy] of o.cells){
      const x = ax + cx, y = ay + cy;
      if (x < 0 || y < 0 || x >= W || y >= H) return null;
      const i = y * W + x;
      if (owner[i] >= 0) return null;
      idx.push(i);
    }
    const mine = new Set(idx);
    for (let k = 0; k < idx.length; k++){
      const i = idx[k], m = o.masks[k], x = i % W, y = (i / W) | 0, isDot = o.dots.has(k);
      if (wantDots && (wantDots.has(i) !== isDot)) return null;
      if (clues.masks && clues.masks[i] != null && clues.masks[i] !== m) return null;
      for (const [d, [dx, dy]] of Object.entries(DIRS)){
        const b = DIR_BIT[d], nx = x + dx, ny = y + dy, has = !!(m & b);
        if (nx < 0 || ny < 0 || nx >= W || ny >= H){ if (has) return null; continue; }
        const n = ny * W + nx;
        if (mine.has(n) || owner[n] < 0) continue;
        if (has !== !!(mask[n] & OPPOSITE[b])) return null;
      }
    }
    if (clues.regions){
      const reg = clues.regions[idx[0]];
      if (!idx.every(i => clues.regions[i] === reg)) return null;
      // the piece must cover the whole region
      if (clues.regions.filter(r => r === reg).length !== idx.length) return null;
    }
    return idx;
  };
  const apply = (o, idx, on) => idx.forEach((i, k) => {
    owner[i] = on ? o.piece : -1; mask[i] = on ? o.masks[k] : 0; dot[i] = on && o.dots.has(k) ? 1 : 0;
  });

  /** No closed circuits: each component of the path has two dots (the ends). */
  const pathsOK = () => {
    const seen = new Uint8Array(N);
    for (let s = 0; s < N; s++){
      if (seen[s] || !mask[s]) continue;
      let dots = 0;
      const stack = [s]; seen[s] = 1;
      while (stack.length){
        const i = stack.pop(), x = i % W, y = (i / W) | 0;
        const deg = popcount(mask[i]);
        if (dot[i] ? deg !== 1 : deg !== 2) return false;
        if (dot[i]) dots++;
        for (const [d, [dx, dy]] of Object.entries(DIRS)) if (mask[i] & DIR_BIT[d]){
          const n = (y + dy) * W + x + dx;
          if (!seen[n]){ seen[n] = 1; stack.push(n); }
        }
      }
      if (dots !== 2) return false;
    }
    return true;
  };

  /**
   * Early pruning: if some path touching cells `idx` is already complete (all its exits lead to
   * occupied cells), it must go from dot to dot; a closed circuit doesn't count.
   */
  const closedOK = idx => {
    const seen = new Set();
    for (const s of idx){
      if (seen.has(s) || !mask[s]) continue;
      const stack = [s], comp = []; seen.add(s);
      let open = false, dots = 0;
      while (stack.length){
        const i = stack.pop(), x = i % W, y = (i / W) | 0;
        comp.push(i); if (dot[i]) dots++;
        for (const [d, [dx, dy]] of Object.entries(DIRS)) if (mask[i] & DIR_BIT[d]){
          const n = (y + dy) * W + x + dx;
          if (owner[n] < 0){ open = true; continue; }
          if (!seen.has(n)){ seen.add(n); stack.push(n); }
        }
      }
      if (!open && dots !== 2) return false;
    }
    return true;
  };

  // The puzzle's fixed pieces
  for (const f of clues.fixed || []){
    const o = ORIENTATIONS[f.piece].find(o => o.face === f.face && o.rot === f.rot) ||
      ORIENTATIONS[f.piece].find(o => o.face === f.face);
    const e = f.y * W + f.x, idx = o && fits(o, e);
    if (!idx || used[f.piece]) return { count: 0, first: null, nodes, over };
    used[f.piece] = 1; apply(o, idx, true); placed.push({ piece: o.piece, face: o.face, rot: o.rot, cell: e });
  }

  function rec(start){
    if (++nodes > budget){ over = true; return true; }
    let e = start;
    while (e < N && owner[e] >= 0) e++;
    if (e === N){
      if (!pathsOK()) return false;
      const l = look();
      if (seenLooks.has(l)) return false;
      seenLooks.add(l);
      count++;
      if (!first) first = placed.slice();
      onSolution?.(placed, mask, dot);
      return count >= limit;
    }
    const pieces = random ? shuffle([...PIECES.keys()]) : [...PIECES.keys()];
    for (const p of pieces){
      if (used[p]) continue;
      const opts = random ? shuffle(ORIENTATIONS[p].slice()) : ORIENTATIONS[p];
      for (const o of opts){
        const idx = fits(o, e);
        if (!idx) continue;
        used[p] = 1; apply(o, idx, true); placed.push({ piece: p, face: o.face, rot: o.rot, cell: e });
        const stop = closedOK(idx) && rec(e + 1);
        placed.pop(); apply(o, idx, false); used[p] = 0;
        if (stop) return true;
      }
    }
    return false;
  }
  rec(0);
  return { count, first, nodes, over };
}
