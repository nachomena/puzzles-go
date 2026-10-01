/* Reglas de Smart Circuit sobre lo que coloca el jugador. Funciones puras, sin DOM.
   `place[piece]` es null (en la bandeja) o { face, rot, x, y } (esquina superior izquierda). */
import { PIECES, W, H, CELLS, DIRS, DIR_BIT, OPPOSITE } from './engine/pieces.js';
import { orient } from './engine/solver.js';
import { lookKey } from './engine/arrangements.js';

/** Casillas (índices), salidas y puntos de una pieza en una posición, o null si se sale del tablero. */
export function cellsOf(piece, { face, rot, x, y }){
  const o = orient(piece, face, rot);
  if (x < 0 || y < 0 || x + o.w > W || y + o.h > H) return null;
  const cells = o.cells.map(([cx, cy]) => (y + cy) * W + x + cx);
  return { cells, masks: o.masks, dots: [...o.dots].map(k => cells[k]), o };
}

/** Qué pieza ocupa cada casilla (-1 = libre). */
export function occupancy(place){
  const grid = new Int8Array(CELLS).fill(-1);
  place.forEach((pos, piece) => { if (pos) for (const i of cellsOf(piece, pos).cells) grid[i] = piece; });
  return grid;
}

/** ¿Cabe la pieza en esa posición sin pisar otras (ignorando su propia posición actual)? */
export function fits(place, piece, pos){
  const fp = cellsOf(piece, pos);
  if (!fp) return false;
  const grid = occupancy(place);
  return fp.cells.every(i => grid[i] < 0 || grid[i] === piece);
}

/** Clave visual de una pieza del jugador (comparable con la de la solución). */
export const keyOf = (piece, pos) => {
  const { o } = cellsOf(piece, pos);
  return lookKey({ piece, face: pos.face, rot: pos.rot, cell: (pos.y + o.cells[0][1]) * W + pos.x + o.cells[0][0] });
};
const solutionKeys = solution => new Set(solution.map(lookKey));

/**
 * Salidas de camino que se cortan: hacia el borde o contra una pieza vecina sin camino ahí.
 * Devuelve [{ cell, dir }] para dibujarlas en rojo.
 */
export function brokenEnds(place){
  const mask = new Uint8Array(CELLS), owner = occupancy(place);
  place.forEach((pos, piece) => { if (pos){ const f = cellsOf(piece, pos); f.cells.forEach((c, k) => mask[c] = f.masks[k]); } });
  const out = [];
  for (let i = 0; i < CELLS; i++) for (const [d, [dx, dy]] of Object.entries(DIRS)){
    if (!(mask[i] & DIR_BIT[d])) continue;
    const x = i % W + dx, y = ((i / W) | 0) + dy;
    if (x < 0 || y < 0 || x >= W || y >= H){ out.push({ cell: i, dir: d }); continue; }
    const n = y * W + x;
    if (owner[n] >= 0 && owner[n] !== owner[i] && !(mask[n] & OPPOSITE[DIR_BIT[d]])) out.push({ cell: i, dir: d });
  }
  return out;
}

/** Resuelto: todas las piezas puestas y se ven exactamente como la solución (única). */
export function isSolved(place, solution){
  if (place.some(p => !p)) return false;
  const keys = solutionKeys(solution);
  return place.every((pos, piece) => keys.has(keyOf(piece, pos)));
}

/** Primera pieza movible colocada que no está como en la solución (o null). */
export function findMistake(place, solution, fixed){
  const keys = solutionKeys(solution);
  const piece = place.findIndex((pos, piece) => pos && !fixed.includes(piece) && !keys.has(keyOf(piece, pos)));
  return piece >= 0 ? { piece } : null;
}

/**
 * Pista: una pieza de la solución que todavía no está. Devuelve { piece, pos } o null.
 * Dos piezas que se ven igual (p. ej. las dos rectas por la cara lisa) son intercambiables.
 */
export function findHint(place, solution){
  const placedKeys = new Set(place.map((pos, piece) => pos ? keyOf(piece, pos) : null));
  const missing = solution.filter(s => !placedKeys.has(lookKey(s)));
  if (!missing.length) return null;
  const s = missing[(Math.random() * missing.length) | 0];
  const o = orient(s.piece, s.face, s.rot);
  const pos = { face: s.face, rot: s.rot, x: s.cell % W - o.cells[0][0], y: ((s.cell / W) | 0) - o.cells[0][1] };
  return { piece: s.piece, pos };
}

export { PIECES };
