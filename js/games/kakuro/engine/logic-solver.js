/* ---------- Solucionador lógico de Kakuro (técnicas humanas) ----------
   Nivel 1: cada casilla solo admite los números que salen en alguna combinación de cada uno de sus
            dos tramos (sin mirar el resto de casillas), un número que ya está en el tramo no se repite,
            y un número que el tramo necesita y que solo cabe en una casilla va ahí.
   Nivel 2: + combinaciones de cada tramo teniendo en cuenta lo que admite cada una de sus casillas
            (p. ej. si una casilla de un 16 en dos solo puede ser 7 o 9, la otra es 9 o 7).
   Resolver por lógica ya implica que la solución es única. */
import { analyse } from '../../killer-sudoku/engine/logic-solver.js';
import { popcount, lowBit } from '../../../lib/bits.js';

export const MAX_LEVEL = 2;
const ALL = 0x3fe;   // dígitos 1..9 como bits 1..9
const CONTRA = { contra: true };

/** Combinaciones (máscaras) de `k` dígitos distintos que suman `sum`. */
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

/** Singles: una casilla con un solo número posible. */
function single(s){
  let any = false;
  for (let i = 0; i < s.cand.length; i++) if (s.white[i] && !s.val[i] && popcount(s.cand[i]) === 1){ place(s, i, lowBit(s.cand[i])); any = true; }
  return any;
}

/** Nivel 1: combinaciones del tramo que incluyen lo ya puesto, sin cruzar con el resto de casillas. */
function basic(s){
  let any = false;
  for (const run of s.runs){
    const placed = run.cells.reduce((m, i) => s.val[i] ? m | (1 << s.val[i]) : m, 0);
    const ok = combos(run.cells.length, run.sum).filter(c => (c & placed) === placed);
    if (!ok.length) throw CONTRA;
    const union = ok.reduce((m, c) => m | c, 0) & ~placed, need = ok.reduce((m, c) => m & c, ALL) & ~placed;
    const open = run.cells.filter(i => !s.val[i]);
    for (const i of open) if (restrict(s, i, union)) any = true;
    // un número que el tramo necesita y que solo cabe en una de sus casillas
    for (let m = need; m; m &= m - 1){
      const b = m & -m, where = open.filter(i => s.cand[i] & b);
      if (!where.length) throw CONTRA;
      if (where.length === 1 && place(s, where[0], lowBit(b))) any = true;
    }
  }
  return any;
}

/* Mismos candidatos y suma → mismo resultado: se guarda entre llamadas (el generador resuelve muchas
   veces tableros casi iguales). */
const memo = new Map();
function runOptions(sum, masks){
  const key = sum + ':' + masks.join(',');
  let r = memo.get(key);
  if (r === undefined){
    if (memo.size > 200000) memo.clear();
    // analyse() trabaja con los dígitos como bits 0..8
    r = analyse(masks.map(m => m >> 1), sum, null, true);
    memo.set(key, r);
  }
  return r;
}

/** Nivel 2: lo que admite cada casilla según las formas de rellenar el tramo entero. */
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
 * Resuelve desde `values` (0 = vacía) con técnicas hasta `level`. Devuelve { solved, contra?, grid }.
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

/** Siguiente casilla vacía que se deduce con las técnicas hasta `level`, o null (para las pistas). */
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
