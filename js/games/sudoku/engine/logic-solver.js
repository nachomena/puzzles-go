/* ---------- Solucionador lógico de Sudoku (técnicas humanas) ----------
   Nivel 1 (Fácil):   singles desnudos y ocultos.
   Nivel 2 (Medio):   + candidatos bloqueados (pointing/claiming), pares y tríos desnudos y ocultos.
   Nivel 3 (Difícil): + X-Wing y Swordfish.
   Un tablero se califica con el nivel mínimo que lo resuelve. */
import { CELLS, SIZE, ALL, ROWS, COLS, BOXES, UNITS, PEERS, rowOf, colOf, boxOf, bit, digitOf } from './grid.js';
import { popcount, lowBit, bitIndices, someCombination } from '../../../lib/bits.js';

export const MAX_LEVEL = 3;
const CONTRA = { contra: true };
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/* ---------- Estado: valores + candidatos ---------- */

function createState(grid){
  const s = { val: new Int8Array(CELLS), cand: new Uint16Array(CELLS).fill(ALL) };
  for (let i = 0; i < CELLS; i++) if (grid[i]) place(s, i, grid[i]);
  return s;
}
function place(s, i, d){
  const b = bit(d);
  if (s.val[i] === d) return;
  if (s.val[i] || !(s.cand[i] & b)) throw CONTRA;
  s.val[i] = d; s.cand[i] = 0;
  for (const p of PEERS[i]){
    if (s.val[p] === d) throw CONTRA;
    if (s.cand[p] & b){ s.cand[p] &= ~b; if (!s.val[p] && !s.cand[p]) throw CONTRA; }
  }
}
/** Quita los dígitos `mask` de la casilla i. true si cambió algo. */
function eliminate(s, i, mask){
  if (!(s.cand[i] & mask)) return false;
  s.cand[i] &= ~mask;
  if (!s.cand[i]) throw CONTRA;
  return true;
}
/**
 * Máscara de posiciones (índice dentro de la unidad) donde cabe cada dígito, y
 * máscara de dígitos ya colocados en la unidad.
 */
function unitMap(s, unit){
  const pos = new Uint16Array(SIZE + 1);
  let placed = 0;
  for (let k = 0; k < SIZE; k++){
    const i = unit[k];
    if (s.val[i]){ placed |= bit(s.val[i]); continue; }
    for (let m = s.cand[i]; m; m &= m - 1) pos[digitOf(m & -m)] |= 1 << k;
  }
  return { pos, placed };
}

/* ---------- Técnicas: cada una devuelve true si avanzó ---------- */

function nakedSingle(s){
  let any = false;
  for (let i = 0; i < CELLS; i++) if (!s.val[i] && popcount(s.cand[i]) === 1){ place(s, i, digitOf(s.cand[i])); any = true; }
  return any;
}

function hiddenSingle(s){
  let any = false;
  for (const unit of UNITS){
    const { pos, placed } = unitMap(s, unit);
    for (const d of DIGITS){
      if (placed & bit(d)) continue;
      if (!pos[d]) throw CONTRA;
      // tras colocar, el mapa de esta unidad ya no vale: se pasa a la siguiente
      if (popcount(pos[d]) === 1){ place(s, unit[lowBit(pos[d])], d); any = true; break; }
    }
  }
  return any;
}

/**
 * Intersecciones caja/línea: si en la unidad `base` un dígito solo cabe en el segmento
 * `seg` (máscara local), se elimina de las casillas `others` de la otra unidad.
 */
const INTERSECTIONS = [];
for (const box of BOXES) for (const [lines, lineOf] of [[ROWS, rowOf], [COLS, colOf]]){
  for (const l of new Set(box.map(lineOf))){
    const line = lines[l], shared = box.filter(i => lineOf(i) === l);
    const localMask = unit => shared.reduce((m, i) => m | (1 << unit.indexOf(i)), 0);
    INTERSECTIONS.push({ base: box, seg: localMask(box), others: line.filter(i => !shared.includes(i)) });   // pointing
    INTERSECTIONS.push({ base: line, seg: localMask(line), others: box.filter(i => !shared.includes(i)) }); // claiming
  }
}

function lockedCandidates(s){
  let any = false;
  const maps = new Map();
  for (const { base, seg, others } of INTERSECTIONS){
    // un mapa algo desfasado solo tiene candidatos de más: si aun así cabe en el segmento, la deducción vale
    let pos = maps.get(base);
    if (!pos) maps.set(base, pos = unitMap(s, base).pos);
    for (const d of DIGITS){
      const m = pos[d];
      if (popcount(m) < 2 || (m & ~seg)) continue;
      for (const j of others) if (eliminate(s, j, bit(d))) any = true;
    }
  }
  return any;
}

/** n casillas de una unidad con solo n candidatos entre todas: esos dígitos salen del resto. */
const nakedSubset = n => function(s){
  for (const unit of UNITS){
    const open = [];
    for (let k = 0; k < SIZE; k++){ const c = s.cand[unit[k]]; if (c && popcount(c) <= n) open.push(k); }
    if (open.length < n) continue;
    const hit = someCombination(open, n, ks => {
      let union = 0, inside = 0;
      for (const k of ks){ union |= s.cand[unit[k]]; inside |= 1 << k; }
      if (popcount(union) !== n) return false;
      let any = false;
      for (let k = 0; k < SIZE; k++) if (!((inside >> k) & 1) && s.cand[unit[k]] && eliminate(s, unit[k], union)) any = true;
      return any;
    });
    if (hit) return true;
  }
  return false;
};

/** n dígitos que en una unidad solo caben en las mismas n casillas: esas casillas no admiten otros. */
const hiddenSubset = n => function(s){
  for (const unit of UNITS){
    const { pos, placed } = unitMap(s, unit);
    const open = DIGITS.filter(d => !(placed & bit(d)));
    if (open.length <= n) continue;
    const hit = someCombination(open, n, ds => {
      let cells = 0, keep = 0;
      for (const d of ds){ cells |= pos[d]; keep |= bit(d); }
      if (popcount(cells) !== n) return false;
      let any = false;
      for (let m = cells; m; m &= m - 1) if (eliminate(s, unit[31 - Math.clz32(m & -m)], ALL & ~keep)) any = true;
      return any;
    });
    if (hit) return true;
  }
  return false;
};

/**
 * Pez de tamaño n (2 = X-Wing, 3 = Swordfish): si en n filas un dígito solo cabe en las
 * mismas n columnas, se elimina de esas columnas en las demás filas (y al revés).
 */
const fish = n => function(s){
  for (const [bases, covers] of [[ROWS, COLS], [COLS, ROWS]]){
    const maps = bases.map(unit => unitMap(s, unit).pos);
    for (const d of DIGITS){
      // líneas base donde el dígito cabe en 2..n posiciones (posición = índice de la línea que cubre)
      const lines = [];
      for (let b = 0; b < SIZE; b++){ const c = popcount(maps[b][d]); if (c >= 2 && c <= n) lines.push(b); }
      if (lines.length < n) continue;
      const hit = someCombination(lines, n, set => {
        let coverMask = 0, baseMask = 0;
        for (const b of set){ coverMask |= maps[b][d]; baseMask |= 1 << b; }
        if (popcount(coverMask) !== n) return false;
        let any = false;
        for (const c of bitIndices(coverMask)) for (let b = 0; b < SIZE; b++){
          if (!((baseMask >> b) & 1) && eliminate(s, covers[c][b], bit(d))) any = true;
        }
        return any;
      });
      if (hit) return true;
    }
  }
  return false;
};

/** Técnicas por orden de coste; `level` = nivel mínimo en que se permiten. */
export const TECHNIQUES = [
  { id: 'naked-single',  level: 1, apply: nakedSingle },
  { id: 'hidden-single', level: 1, apply: hiddenSingle },
  { id: 'locked',        level: 2, apply: lockedCandidates },
  { id: 'naked-pair',    level: 2, apply: nakedSubset(2) },
  { id: 'hidden-pair',   level: 2, apply: hiddenSubset(2) },
  { id: 'naked-triple',  level: 2, apply: nakedSubset(3) },
  { id: 'hidden-triple', level: 2, apply: hiddenSubset(3) },
  { id: 'x-wing',        level: 3, apply: fish(2) },
  { id: 'swordfish',     level: 3, apply: fish(3) }
];

/**
 * Resuelve con técnicas hasta `level`.
 * Devuelve { solved, contra?, grid, used } — `used` es el conjunto de técnicas que avanzaron.
 */
export function logic(grid, level){
  const used = new Set();
  let s;
  try {
    s = createState(grid);
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
export function grade(grid){
  for (let l = 1; l <= MAX_LEVEL; l++) if (logic(grid, l).solved) return l;
  return MAX_LEVEL + 1;
}

/** Siguiente casilla deducible solo con singles a partir de `grid`, o null. */
export function nextSingle(grid){
  let s;
  try { s = createState(grid); } catch (e){ if (e !== CONTRA) throw e; return null; }
  for (let i = 0; i < CELLS; i++) if (!s.val[i] && popcount(s.cand[i]) === 1) return { cell: i, digit: digitOf(s.cand[i]) };
  for (const unit of UNITS){
    const { pos, placed } = unitMap(s, unit);
    for (const d of DIGITS) if (!(placed & bit(d)) && popcount(pos[d]) === 1) return { cell: unit[lowBit(pos[d])], digit: d };
  }
  return null;
}
