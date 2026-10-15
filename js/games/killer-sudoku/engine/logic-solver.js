/* ---------- Solucionador lógico de Killer Sudoku (técnicas humanas) ----------
   Las del Sudoku (js/games/sudoku/engine/logic-solver.js) más las de las jaulas:
   Nivel 1 (Fácil):    singles y combinaciones de cada jaula (qué números caben en cada casilla
                       según la suma y lo que ya hay).
   Nivel 2 (Medio):    + candidatos bloqueados, pares y tríos, y números que una jaula necesita y que
                       solo caben en una fila, columna o caja (salen del resto de esa unidad).
   Nivel 3 (Difícil):  + regla del 45 en una fila, columna o caja.
   Nivel 4 (Experto):  + regla del 45 en franjas de dos o tres filas, columnas o cajas, X-Wing y Swordfish.
   Un tablero se califica con el nivel mínimo que lo resuelve; resolverlo por lógica ya implica
   que tiene una única solución. */
import { CELLS, ALL, ROWS, COLS, BOXES, bit, digitOf } from '../../sudoku/engine/grid.js';
import { CONTRA, createState, eliminate, TECHNIQUES as SUDOKU } from '../../sudoku/engine/logic-solver.js';
import { popcount } from '../../../lib/bits.js';
import { sees, sumGroups, UNIT_REGIONS, BAND_REGIONS } from './cages.js';

export const MAX_LEVEL = 4;
const sudoku = id => SUDOKU.find(t => t.id === id).apply;

/** Suma de los `k` dígitos más bajos (o más altos) de una máscara. */
function extremeSum(mask, k, high){
  let sum = 0;
  for (let d = high ? 9 : 1; k > 0 && d >= 1 && d <= 9; d += high ? -1 : 1) if (mask & bit(d)){ sum += d; k--; }
  return k > 0 ? Infinity : sum;
}

/**
 * Qué número puede ir en cada casilla del grupo según su suma: { poss: máscara por casilla,
 * need: números que salen en todas las formas de rellenarlo }. null si no hay ninguna.
 * `clash[a][b]` dice si las casillas a y b del grupo no pueden repetir número.
 */
function analyse(masks, sum, clash, allDistinct){
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
      if (next > sum) break;   // dígitos en orden creciente
      // cota: lo que queda tiene que poder completar la suma
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

/* Mismas máscaras → mismo resultado: se guarda entre llamadas (el generador resuelve muchas veces
   tableros casi iguales). */
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

/** Recorta los candidatos de las casillas de los grupos `which` según su suma. */
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
 * Un número que una jaula necesita (sale en todas sus combinaciones) y que dentro de ella solo cabe
 * en casillas de una misma fila, columna o caja: en el resto de esa unidad no puede ir.
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

/** Técnicas por orden de coste; `level` = nivel mínimo en que se permiten. */
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

/** Grupo de suma listo para analizar: qué parejas de casillas no pueden repetir número. */
let nextId = 0;
function group(cells, sum, isCage, cageOf){
  const clash = cells.map(a => cells.map(b => a !== b && (isCage || sees(a, b) || cageOf[a] === cageOf[b])));
  const distinct = isCage || clash.every((row, a) => row.every((c, b) => c || a === b));
  return { id: nextId++, cells, sum, clash, distinct };
}

/**
 * Lo que no cambia de un tablero mientras se resuelve: sus jaulas y los grupos de la regla del 45.
 * Se calcula una vez por reto (el generador lo reutiliza en cada prueba).
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
 * Resuelve con técnicas hasta `level` a partir de `grid` (0 = vacía).
 * `prepared` = prepare(cages). Devuelve { solved, contra?, grid, used }.
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

/** Nivel mínimo con el que se resuelve (MAX_LEVEL + 1 si ninguno basta). */
export function grade(grid, prepared){
  for (let l = 1; l <= MAX_LEVEL; l++) if (logic(grid, prepared, l).solved) return l;
  return MAX_LEVEL + 1;
}

/**
 * Siguiente casilla vacía que se deduce desde `grid` con las técnicas hasta `level` (la primera que
 * quede fija), o null. Para las pistas.
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

