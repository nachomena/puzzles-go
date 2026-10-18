/* ---------- Killer Sudoku logic solver (human techniques) ----------
   Sudoku's (js/games/sudoku/engine/logic-solver.js) plus the cage ones:
   Level 1 (Easy):     singles and combinations of each cage (which numbers fit in each cell given the
                       sum and what is already there).
   Level 2 (Medium):   + locked candidates, pairs and triples, and numbers a cage needs that only fit in
                       one row, column or box (they come out of the rest of that unit).
   Level 3 (Hard):     + the 45 rule in a row, column or box.
   Level 4 (Expert):   + the 45 rule in bands of two or three rows, columns or boxes, X-Wing and Swordfish.
   A board is rated with the lowest level that solves it; solving it by logic already implies that it
   has a single solution. */
import { CELLS, ALL, ROWS, COLS, BOXES, bit, digitOf } from '../../sudoku/engine/grid.js';
import { CONTRA, createState, eliminate, TECHNIQUES as SUDOKU } from '../../sudoku/engine/logic-solver.js';
import { popcount } from '../../../lib/bits.js';
import { sees, sumGroups, UNIT_REGIONS, BAND_REGIONS } from './cages.js';

export const MAX_LEVEL = 4;
const sudoku = id => SUDOKU.find(t => t.id === id).apply;

/** Sum of the `k` lowest (or highest) digits of a mask. */
function extremeSum(mask, k, high){
  let sum = 0;
  for (let d = high ? 9 : 1; k > 0 && d >= 1 && d <= 9; d += high ? -1 : 1) if (mask & bit(d)){ sum += d; k--; }
  return k > 0 ? Infinity : sum;
}

/**
 * Which number can go in each cell of the group given its sum: { poss: mask per cell,
 * need: numbers that appear in every way of filling it }. null if there are none.
 * `clash[a][b]` says whether cells a and b of the group can't repeat a number.
 */
export function analyse(masks, sum, clash, allDistinct){
  const k = masks.length, poss = new Uint16Array(k), vals = new Int8Array(k);
  let need = ALL, found = false;
  const go = (j, total, used) => {
    if (j === k){
      if (total !== sum) return;
      found = true;
      for (let a = 0; a < k; a++) poss[a] |= bit(vals[a]);
      need &= used;
      return;
    }
    const left = k - j - 1;
    for (let m = masks[j]; m; m &= m - 1){
      const d = digitOf(m & -m), next = total + d;
      if (next > sum) break;   // digits in increasing order
      // bound: what is left must be able to complete the sum
      if (allDistinct){
        const free = ALL & ~used & ~bit(d);
        if (next + extremeSum(free, left, false) > sum || next + extremeSum(free, left, true) < sum) continue;
        if (used & bit(d)) continue;
      } else {
        if (next + left > sum || next + 9 * left < sum) continue;
        let ok = true;
        for (let a = 0; a < j; a++) if (vals[a] === d && clash[a][j]){ ok = false; break; }
        if (!ok) continue;
      }
      vals[j] = d;
      go(j + 1, next, used | bit(d));
    }
  };
  go(0, 0, 0);
  return found ? { poss, need } : null;
}

/* Same masks → same result: it is kept between calls (the generator solves nearly identical boards
   many times). */
const memo = new Map();
function analyseGroup(s, g){
  const masks = g.cells.map(i => s.val[i] ? bit(s.val[i]) : s.cand[i]);
  const key = g.id + ':' + masks.join(',');
  let r = memo.get(key);
  if (r === undefined){
    if (memo.size > 200000) memo.clear();
    r = analyse(masks, g.sum, g.clash, g.distinct);
    memo.set(key, r);
  }
  if (!r) throw CONTRA;
  return r;
}

/** Trims the candidates of the cells of groups `which` according to their sum. */
const combos = which => function(s){
  let any = false;
  for (const g of s.groups[which]){
    const { poss } = analyseGroup(s, g);
    g.cells.forEach((i, a) => { if (!s.val[i] && eliminate(s, i, ALL & ~poss[a])) any = true; });
  }
  return any;
};

const UNIT_LIST = [...ROWS, ...COLS, ...BOXES];
/**
 * A number a cage needs (it appears in all its combinations) that within it only fits in cells of the
 * same row, column or box: it can't go in the rest of that unit.
 */
function cageNeeds(s){
  let any = false;
  for (const g of s.groups.cages){
    const { poss, need } = analyseGroup(s, g);
    for (let m = need; m; m &= m - 1){
      const b = m & -m, where = g.cells.filter((i, a) => poss[a] & b);
      if (where.length && where.every(i => s.val[i])) continue;
      for (const unit of UNIT_LIST){
        if (!where.every(i => unit.includes(i))) continue;
        for (const j of unit) if (!s.val[j] && !g.cells.includes(j) && eliminate(s, j, b)) any = true;
      }
    }
  }
  return any;
}

/** Techniques by cost; `level` = the lowest level at which they are allowed. */
export const TECHNIQUES = [
  { id: 'naked-single',  level: 1, apply: sudoku('naked-single') },
  { id: 'hidden-single', level: 1, apply: sudoku('hidden-single') },
  { id: 'cage-combos',   level: 1, apply: combos('cages') },
  { id: 'locked',        level: 2, apply: sudoku('locked') },
  { id: 'cage-needs',    level: 2, apply: cageNeeds },
  { id: 'naked-pair',    level: 2, apply: sudoku('naked-pair') },
  { id: 'hidden-pair',   level: 2, apply: sudoku('hidden-pair') },
  { id: 'naked-triple',  level: 2, apply: sudoku('naked-triple') },
  { id: 'hidden-triple', level: 2, apply: sudoku('hidden-triple') },
  { id: 'rule-45',       level: 3, apply: combos('units45') },
  { id: 'rule-45-bands', level: 4, apply: combos('bands45') },
  { id: 'x-wing',        level: 4, apply: sudoku('x-wing') },
  { id: 'swordfish',     level: 4, apply: sudoku('swordfish') }
];

/** Sum group ready to analyse: which pairs of cells can't repeat a number. */
let nextId = 0;
function group(cells, sum, isCage, cageOf){
  const clash = cells.map(a => cells.map(b => a !== b && (isCage || sees(a, b) || cageOf[a] === cageOf[b])));
  const distinct = isCage || clash.every((row, a) => row.every((c, b) => c || a === b));
  return { id: nextId++, cells, sum, clash, distinct };
}

/**
 * What doesn't change on a board while it is solved: its cages and the 45-rule groups.
 * It is computed once per puzzle (the generator reuses it in every attempt).
 */
export function prepare(cages){
  const cageOf = new Int16Array(CELLS);
  cages.forEach((c, k) => c.cells.forEach(i => { cageOf[i] = k; }));
  const make = list => list.map(({ cells, sum }) => group(cells, sum, false, cageOf));
  return {
    cages: cages.map(({ cells, sum }) => group(cells, sum, true, cageOf)),
    units45: make(sumGroups(cages, UNIT_REGIONS, 4)),
    bands45: make(sumGroups(cages, BAND_REGIONS, 5))
  };
}

/**
 * Solves with techniques up to `level` from `grid` (0 = empty).
 * `prepared` = prepare(cages). Returns { solved, contra?, grid, used }.
 */
export function logic(grid, prepared, level){
  const used = new Set();
  let s;
  try {
    s = createState(grid);
    s.groups = prepared;
    for (;;){
      const t = TECHNIQUES.find(t => t.level <= level && t.apply(s));
      if (!t) break;
      used.add(t.id);
    }
  } catch (e){
    if (e !== CONTRA) throw e;
    return { solved: false, contra: true, grid: null, used };
  }
  return { solved: s.val.every(Boolean), grid: Array.from(s.val), used };
}

/** Lowest level that solves it (MAX_LEVEL + 1 if none is enough). */
export function grade(grid, prepared){
  for (let l = 1; l <= MAX_LEVEL; l++) if (logic(grid, prepared, l).solved) return l;
  return MAX_LEVEL + 1;
}

/**
 * Next empty cell deduced from `grid` with the techniques up to `level` (the first one that becomes
 * fixed), or null. For the hints.
 */
export function nextDeduction(grid, prepared, level){
  let s;
  try {
    s = createState(grid);
    s.groups = prepared;
    for (;;){
      for (let i = 0; i < CELLS; i++) if (!grid[i] && (s.val[i] || popcount(s.cand[i]) === 1)) return { cell: i, digit: s.val[i] || digitOf(s.cand[i]) };
      if (!TECHNIQUES.some(t => t.level <= level && t.apply(s))) return null;
    }
  } catch (e){
    if (e !== CONTRA) throw e;
    return null;
  }
}

