/* ---------- Kakuro logic solver (human techniques) ----------
   Level 1: each cell only allows the numbers that appear in some combination of each of its two runs
            (without looking at the other cells), a number already in the run isn't repeated, and a
            number the run needs that only fits in one cell goes there.
   Level 2: + combinations of each run taking into account what each of its cells allows
            (e.g. if one cell of a 16 in two can only be 7 or 9, the other is 9 or 7).
   Solving by logic already implies the solution is unique. */
import { analyse } from '../../killer-sudoku/engine/logic-solver.js';
import { popcount, lowBit } from '../../../lib/bits.js';

export const MAX_LEVEL = 2;
const ALL = 0x3fe;   // digits 1..9 as bits 1..9
const CONTRA = { contra: true };

/** Combinations (masks) of `k` distinct digits that add up to `sum`. */
const COMBOS = new Map();
export function combos(k, sum){
  const key = k * 100 + sum;
  if (!COMBOS.has(key)){
    const out = [];
    const go = (from, left, total, mask) => {
      if (!left){ if (total === sum) out.push(mask); return; }
      for (let d = from; d <= 9 && total + d <= sum; d++) go(d + 1, left - 1, total + d, mask | (1 << d));
    };
    go(1, k, 0, 0);
    COMBOS.set(key, out);
  }
  return COMBOS.get(key);
}

function state(n, white, runs){
  const cand = new Uint16Array(n * n), val = new Int8Array(n * n), of = Array.from({ length: n * n }, () => []);
  for (let i = 0; i < n * n; i++) if (white[i]) cand[i] = ALL;
  runs.forEach((r, k) => r.cells.forEach(i => of[i].push(k)));
  return { n, white, runs, cand, val, of };
}
function place(s, i, d){
  if (s.val[i] === d) return false;
  if (s.val[i] || !(s.cand[i] & (1 << d))) throw CONTRA;
  s.val[i] = d; s.cand[i] = 1 << d;
  for (const k of s.of[i]) for (const j of s.runs[k].cells) if (j !== i && (s.cand[j] & (1 << d))){
    if (s.val[j]) throw CONTRA;
    s.cand[j] &= ~(1 << d);
    if (!s.cand[j]) throw CONTRA;
  }
  return true;
}
function restrict(s, i, mask){
  if (!(s.cand[i] & ~mask)) return false;
  s.cand[i] &= mask;
  if (!s.cand[i]) throw CONTRA;
  return true;
}

/** Singles: a cell with a single possible number. */
function single(s){
  let any = false;
  for (let i = 0; i < s.cand.length; i++) if (s.white[i] && !s.val[i] && popcount(s.cand[i]) === 1){ place(s, i, lowBit(s.cand[i])); any = true; }
  return any;
}

/** Level 1: combinations of the run that include what is already placed, without crossing with the other cells. */
function basic(s){
  let any = false;
  for (const run of s.runs){
    const placed = run.cells.reduce((m, i) => s.val[i] ? m | (1 << s.val[i]) : m, 0);
    const ok = combos(run.cells.length, run.sum).filter(c => (c & placed) === placed);
    if (!ok.length) throw CONTRA;
    const union = ok.reduce((m, c) => m | c, 0) & ~placed, need = ok.reduce((m, c) => m & c, ALL) & ~placed;
    const open = run.cells.filter(i => !s.val[i]);
    for (const i of open) if (restrict(s, i, union)) any = true;
    // a number the run needs that only fits in one of its cells
    for (let m = need; m; m &= m - 1){
      const b = m & -m, where = open.filter(i => s.cand[i] & b);
      if (!where.length) throw CONTRA;
      if (where.length === 1 && place(s, where[0], lowBit(b))) any = true;
    }
  }
  return any;
}

/* Same candidates and sum → same result: it is kept between calls (the generator solves nearly
   identical boards many times). */
const memo = new Map();
function runOptions(sum, masks){
  const key = sum + ':' + masks.join(',');
  let r = memo.get(key);
  if (r === undefined){
    if (memo.size > 200000) memo.clear();
    // analyse() works with the digits as bits 0..8
    r = analyse(masks.map(m => m >> 1), sum, null, true);
    memo.set(key, r);
  }
  return r;
}

/** Level 2: what each cell allows according to the ways of filling the whole run. */
function full(s){
  let any = false;
  for (const run of s.runs){
    const r = runOptions(run.sum, run.cells.map(i => s.val[i] ? 1 << s.val[i] : s.cand[i]));
    if (!r) throw CONTRA;
    run.cells.forEach((i, a) => { if (!s.val[i] && restrict(s, i, r.poss[a] << 1)) any = true; });
  }
  return any;
}

export const TECHNIQUES = [
  { id: 'single', level: 1, apply: single },
  { id: 'basic',  level: 1, apply: basic },
  { id: 'full',   level: 2, apply: full }
];

/**
 * Solves from `values` (0 = empty) with techniques up to `level`. Returns { solved, contra?, grid }.
 */
export function logic(n, white, runs, level, values = null){
  let s;
  try {
    s = state(n, white, runs);
    if (values) for (let i = 0; i < n * n; i++) if (white[i] && values[i] > 0) place(s, i, values[i]);
    while (TECHNIQUES.some(t => t.level <= level && t.apply(s)));
  } catch (e){
    if (e !== CONTRA) throw e;
    return { solved: false, contra: true, grid: null };
  }
  const solved = [...s.val.keys()].every(i => !white[i] || s.val[i]);
  return { solved, grid: Array.from(s.val) };
}

/** Next empty cell deduced with the techniques up to `level`, or null (for the hints). */
export function nextDeduction(n, white, runs, level, values){
  let s;
  try {
    s = state(n, white, runs);
    for (let i = 0; i < n * n; i++) if (white[i] && values[i] > 0) place(s, i, values[i]);
    for (;;){
      for (let i = 0; i < n * n; i++) if (white[i] && !(values[i] > 0) && (s.val[i] || popcount(s.cand[i]) === 1)) return { cell: i, digit: s.val[i] || lowBit(s.cand[i]) };
      if (!TECHNIQUES.some(t => t.level <= level && t.apply(s))) return null;
    }
  } catch (e){
    if (e !== CONTRA) throw e;
    return null;
  }
}
