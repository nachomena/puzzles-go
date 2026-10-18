/* Placement search: it always fills the first empty cell (all the pieces are rectangles, so their
   top-left corner goes there) and prunes as soon as a die can no longer form a valid face or a row/column
   with an arrow can't add up to what is asked. */
import { SIZE, CELLS, PIECE_TYPES, shape, dieOf, posInDie, FACES, DIE_ROWS, DIE_COLS } from './pieces.js';
import { shuffle } from '../../../lib/random.js';
import { popcount } from '../../../lib/bits.js';

/** For each 9-bit mask: does it fit inside some valid face? */
const SUBSET_OK = new Uint8Array(512);
for (let m = 0; m < 512; m++) for (const face of FACES.keys()) if ((m & face) === m){ SUBSET_OK[m] = 1; break; }

/** Distinct rotations of each type (symmetric pieces repeat their shape). */
export const ROTATIONS = PIECE_TYPES.map((_, type) => {
  const seen = new Set(), out = [];
  for (let rot = 0; rot < 4; rot++){
    const s = shape(type, rot), key = JSON.stringify([s.cells, s.dots]);
    if (!seen.has(key)){ seen.add(key); out.push(rot); }
  }
  return out;
});

/** Options per cell: placements (type, rotation) with their corner on that cell that fit on the board. */
const OPTIONS = Array.from({ length: CELLS }, (_, i) => {
  const r = (i / SIZE) | 0, c = i % SIZE, out = [];
  PIECE_TYPES.forEach((_, type) => ROTATIONS[type].forEach(rot => {
    const s = shape(type, rot);
    if (r + s.h > SIZE || c + s.w > SIZE) return;
    out.push({
      type, rot, r, c,
      cells: s.cells.map(([a, b]) => (r + a) * SIZE + c + b),
      dots: s.dots.map(([a, b]) => (r + a) * SIZE + c + b)
    });
  }));
  return out;
});

const DIE_CELLS = 9;

/**
 * Counts valid placements up to `limit`.
 * @param {{ fixed: {type,rot,r,c}[], arrows: { rows: (number|null)[], cols: (number|null)[] } }} puzzle
 * @param {{ limit?: number, random?: boolean, budget?: number, onSolution?: (p: object[]) => void }} opts
 * @returns {{ count: number, first: {type,rot,r,c}[]|null, nodes: number, over: boolean }}
 */
export function solve({ fixed = [], arrows = { rows: [null, null], cols: [null, null] } }, { limit = 2, random = false, budget = Infinity, onSolution = null } = {}){
  const grid = new Int8Array(CELLS).fill(-1);
  const dieMask = new Uint16Array(4), dieFilled = new Uint8Array(4);
  const left = PIECE_TYPES.map(t => t.count);
  const placed = [];
  let count = 0, first = null, nodes = 0, over = false;

  const sumOK = (pair, target) => {
    if (target == null) return true;
    const [a, b] = pair;
    // With both dice complete the sum must be exact; otherwise it must still be reachable
    const va = popcount(dieMask[a]), vb = popcount(dieMask[b]);
    if (dieFilled[a] === DIE_CELLS && dieFilled[b] === DIE_CELLS) return va + vb === target;
    return va + vb <= target;
  };
  const consistent = touched => {
    for (const d of touched){
      if (!SUBSET_OK[dieMask[d]]) return false;
      if (dieFilled[d] === DIE_CELLS && !FACES.has(dieMask[d])) return false;
    }
    return DIE_ROWS.every((p, k) => sumOK(p, arrows.rows[k])) && DIE_COLS.every((p, k) => sumOK(p, arrows.cols[k]));
  };
  const apply = (opt, sign) => {
    const touched = new Set();
    for (const i of opt.cells){
      grid[i] = sign > 0 ? opt.type : -1;
      const d = dieOf(i);
      dieFilled[d] += sign;
      touched.add(d);
    }
    for (const i of opt.dots) dieMask[dieOf(i)] ^= 1 << posInDie(i);
    return touched;
  };
  const fits = opt => opt.cells.every(i => grid[i] < 0);

  // The puzzle's fixed pieces
  for (const f of fixed){
    const opt = makeOption(f);
    if (!opt || !fits(opt) || left[f.type] <= 0) return { count: 0, first: null, nodes, over };
    left[f.type]--;
    apply(opt, 1);
    placed.push(f);
  }
  if (!consistent([0, 1, 2, 3])) return { count: 0, first: null, nodes, over };

  function rec(start){
    if (++nodes > budget){ over = true; return true; }
    let e = start;
    while (e < CELLS && grid[e] >= 0) e++;
    if (e === CELLS){
      count++;
      if (!first) first = placed.slice();
      onSolution?.(placed);
      return count >= limit;
    }
    const opts = random ? shuffle(OPTIONS[e].slice()) : OPTIONS[e];
    for (const opt of opts){
      if (!left[opt.type] || !fits(opt)) continue;
      left[opt.type]--;
      const touched = apply(opt, 1);
      placed.push({ type: opt.type, rot: opt.rot, r: opt.r, c: opt.c });
      if (consistent(touched) && rec(e + 1)){ apply(opt, -1); left[opt.type]++; placed.pop(); return true; }
      placed.pop();
      apply(opt, -1);
      left[opt.type]++;
    }
    return false;
  }
  rec(0);
  return { count, first, nodes, over };
}

/** Option for a fixed piece with any rotation (including those that repeat a shape). */
function makeOption({ type, rot, r, c }){
  const s = shape(type, rot);
  if (r + s.h > SIZE || c + s.w > SIZE) return null;
  return {
    type, rot, r, c,
    cells: s.cells.map(([a, b]) => (r + a) * SIZE + c + b),
    dots: s.dots.map(([a, b]) => (r + a) * SIZE + c + b)
  };
}

/** Value of each die for a complete placement (0 if the face isn't valid). */
export function diceValues(placements){
  const m = new Uint16Array(4);
  for (const p of placements){
    const s = shape(p.type, p.rot);
    for (const [a, b] of s.dots){ const i = (p.r + a) * SIZE + p.c + b; m[dieOf(i)] |= 1 << posInDie(i); }
  }
  return [...m].map(x => FACES.get(x) || 0);
}
