/* ---------- Solucionador lógico (técnicas humanas) ----------
   Nivel 1: reglas básicas, casilla obligada en una unidad y
            "esta estrella dejaría sin sitio a otra unidad".
   Nivel 2: + confinamiento (n regiones metidas en n filas/columnas y al revés).
   Nivel 3: + hipótesis: suponer estrella y llegar a contradicción.

   Estado de cada casilla (`st`): UNKNOWN, STAR o EMPTY. */
import { adjacency, touches, rowOf, colOf } from '../../../lib/grid.js';

export const MAX_LEVEL = 3;
const UNKNOWN = 0, STAR = 1, EMPTY = 2;
const CONTRA = { contra: true };

/** Unidades: N filas, N columnas y N regiones, en ese orden. */
function makeCtx(N, K, reg){
  const units = [];
  for (let r = 0; r < N; r++){ const u = []; for (let c = 0; c < N; c++) u.push(r * N + c); units.push(u); }
  for (let c = 0; c < N; c++){ const u = []; for (let r = 0; r < N; r++) u.push(r * N + c); units.push(u); }
  for (let g = 0; g < N; g++) units.push([]);
  for (let i = 0; i < N * N; i++) units[2 * N + reg[i]].push(i);
  const cu = [];
  for (let i = 0; i < N * N; i++) cu.push([rowOf(N, i), N + colOf(N, i), 2 * N + reg[i]]);
  return { N, K, reg, units, cu, nb: adjacency(N).n8, mark: new Int32Array(N * N), umark: new Int32Array(3 * N), tick: 0 };
}

const countStars = (unit, st) => { let s = 0; for (const i of unit) if (st[i] === STAR) s++; return s; };

/** Estrellas y casillas libres de una unidad. */
function unitStatus(unit, st){
  let stars = 0; const unknown = [];
  for (const i of unit){ if (st[i] === STAR) stars++; else if (st[i] === UNKNOWN) unknown.push(i); }
  return { stars, unknown };
}

/** ¿Caben `need` estrellas que no se toquen en estas casillas? (need ≤ 2) */
function canHost(N, cells, need){
  if (need <= 0) return true;
  if (cells.length < need) return false;
  if (need === 1) return true;
  for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) if (!touches(N, cells[i], cells[j])) return true;
  return false;
}
function setStar(ctx, st, i){
  if (st[i] === STAR) return false;
  if (st[i] === EMPTY) throw CONTRA;
  st[i] = STAR;
  for (const j of ctx.nb[i]){ if (st[j] === STAR) throw CONTRA; st[j] = EMPTY; }
  return true;
}
function setEmpty(st, i){
  if (st[i] === STAR) throw CONTRA;
  if (st[i] === UNKNOWN){ st[i] = EMPTY; return true; }
  return false;
}

function basic(ctx, st){
  const { N, K, units } = ctx;
  let any = false, ch = true;
  while (ch){
    ch = false;
    for (const u of units){
      const { stars, unknown } = unitStatus(u, st);
      if (stars > K) throw CONTRA;
      const need = K - stars;
      if (need === 0){ if (unknown.length){ for (const i of unknown) st[i] = EMPTY; ch = true; } continue; }
      if (!canHost(N, unknown, need)) throw CONTRA;
      if (unknown.length === need){ for (const i of unknown) setStar(ctx, st, i); ch = true; }
    }
    if (ch) any = true;
  }
  return any;
}

function level1(ctx, st){
  const { N, K, units, nb, cu, mark, umark } = ctx;
  // casilla obligada: sin ella la unidad no puede colocar sus estrellas
  for (const u of units){
    const { stars, unknown } = unitStatus(u, st);
    const need = K - stars; if (need <= 0) continue;
    for (const c of unknown){
      if (!canHost(N, unknown.filter(x => x !== c), need)){ setStar(ctx, st, c); return true; }
    }
  }
  // una estrella aquí dejaría sin sitio a alguna unidad
  for (let c = 0; c < N * N; c++){
    if (st[c] !== UNKNOWN) continue;
    const t = ++ctx.tick;
    mark[c] = t;
    const touched = [];
    const addUnits = i => { for (const u of cu[i]) if (umark[u] !== t){ umark[u] = t; touched.push(u); } };
    addUnits(c);
    for (const j of nb[c]) if (st[j] === UNKNOWN){ mark[j] = t; addUnits(j); }
    for (const u of touched){
      let s = 0, hasC = false; const rest = [];
      for (const i of units[u]){
        if (i === c) hasC = true;
        if (st[i] === STAR) s++; else if (st[i] === UNKNOWN && mark[i] !== t) rest.push(i);
      }
      const need = K - s - (hasC ? 1 : 0);
      if (need < 0 || !canHost(N, rest, need)){ setEmpty(st, c); return true; }
    }
  }
  return false;
}

/** Confinamiento: compara las estrellas que piden un bloque de líneas y las regiones que lo tocan. */
function confine(ctx, st){
  const { N, K, units, reg } = ctx;
  const needReg = new Int8Array(N);
  for (let g = 0; g < N; g++) needReg[g] = K - countStars(units[2 * N + g], st);
  for (let o = 0; o < 2; o++){
    const line = o === 0 ? i => rowOf(N, i) : i => colOf(N, i);
    const needLine = new Int8Array(N), lineMask = new Int32Array(N);
    const mn = new Int8Array(N).fill(99), mx = new Int8Array(N).fill(-1);
    for (let l = 0; l < N; l++) needLine[l] = K - countStars(units[o * N + l], st);
    for (let i = 0; i < N * N; i++) if (st[i] === UNKNOWN){
      const l = line(i), g = reg[i];
      lineMask[l] |= 1 << g;
      if (l < mn[g]) mn[g] = l;
      if (l > mx[g]) mx[g] = l;
    }
    // Vacía las casillas libres que cumplen `test`; true si cambió algo.
    const clear = test => {
      let ch = false;
      for (let i = 0; i < N * N; i++) if (st[i] === UNKNOWN && test(line(i), reg[i])){ st[i] = EMPTY; ch = true; }
      return ch;
    };
    for (let a = 0; a < N; a++){
      let needL = 0, touch = 0;
      for (let b = a; b < N - 1; b++){
        needL += needLine[b]; touch |= lineMask[b];
        let inMask = 0, sumIn = 0, sumT = 0;
        for (let g = 0; g < N; g++){
          if (mx[g] >= 0 && mn[g] >= a && mx[g] <= b){ inMask |= 1 << g; sumIn += needReg[g]; }
          if ((touch >> g) & 1) sumT += needReg[g];
        }
        if (sumIn > needL || sumT < needL) throw CONTRA;
        // Las regiones encerradas llenan el bloque: el resto del bloque queda vacío
        if (sumIn === needL && inMask && clear((l, g) => l >= a && l <= b && !((inMask >> g) & 1))) return true;
        // Las regiones que tocan el bloque gastan ahí todas sus estrellas
        if (sumT === needL && clear((l, g) => (l < a || l > b) && ((touch >> g) & 1))) return true;
      }
    }
  }
  return false;
}

/** Hipótesis: si suponer una estrella lleva a contradicción, la casilla está vacía. */
function hypo(ctx, st){
  for (let c = 0; c < st.length; c++){
    if (st[c] !== UNKNOWN) continue;
    const cp = st.slice();
    try { setStar(ctx, cp, c); propagate(ctx, cp, 2); }
    catch (e){ if (e !== CONTRA) throw e; setEmpty(st, c); return true; }
  }
  return false;
}

/** Técnicas por orden de coste; `minLevel` indica desde qué nivel se permite cada una. */
const TECHNIQUES = [
  { minLevel: 0, apply: basic },
  { minLevel: 1, apply: level1 },
  { minLevel: 2, apply: confine },
  { minLevel: 3, apply: hypo }
];

function propagate(ctx, st, level){
  // Tras cada avance se vuelve a empezar por la técnica más barata
  while (TECHNIQUES.some(t => level >= t.minLevel && t.apply(ctx, st)));
}

/** Aplica técnicas hasta `level`. Devuelve { solved, contra?, st }. */
export function logic(N, K, reg, level){
  const ctx = makeCtx(N, K, reg), st = new Int8Array(N * N);
  try { propagate(ctx, st, level); }
  catch (e){ if (e !== CONTRA) throw e; return { contra: true, solved: false, st }; }
  let stars = 0;
  for (const v of st) if (v === STAR) stars++;
  return { solved: stars === N * K, st };
}

export const isEmptyState = v => v === EMPTY;
export const isUnknownState = v => v === UNKNOWN;

/** Nivel mínimo con el que se resuelve (MAX_LEVEL + 1 si ninguno basta). */
export function grade(N, K, reg){
  for (let l = 1; l <= MAX_LEVEL; l++) if (logic(N, K, reg, l).solved) return l;
  return MAX_LEVEL + 1;
}
