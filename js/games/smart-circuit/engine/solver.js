/* Búsqueda de soluciones de Smart Circuit.
   Se rellena siempre la primera casilla vacía (orden de lectura); cada colocación debe encajar
   con las salidas de camino de las piezas vecinas ya puestas y no sacar caminos del tablero.
   Una solución es válida si todos los caminos van de punto a punto (sin tramos sueltos ni
   circuitos cerrados) y los puntos son exactamente los del reto. */
import { PIECES, DIRS, DIR_BIT, OPPOSITE, W as BOARD_W, H as BOARD_H } from './pieces.js';
import { shuffle } from '../../../lib/random.js';
import { popcount } from '../../../lib/bits.js';

const maskOf = s => [...s].reduce((m, d) => m | DIR_BIT[d], 0);
/** Gira 90° en sentido horario (y hacia abajo): E→S, S→W, W→N, N→E. */
const ROT_BIT = { 1: 2, 2: 4, 4: 8, 8: 1 };
const rotMask = m => [1, 2, 4, 8].reduce((r, b) => (m & b) ? r | ROT_BIT[b] : r, 0);

/** Caras de una pieza: 0 y 1 con camino; 2 = cara lisa (solo piezas con `blank`). */
export const faceCount = piece => PIECES[piece].faces.length + (PIECES[piece].blank ? 1 : 0);

/**
 * Pieza con una cara y un giro (0..3, de 90° en sentido horario): casillas [x, y] desde su esquina
 * superior izquierda en orden de lectura, salida del camino de cada casilla y puntos (índices).
 */
export function orient(piece, face, rot){
  const p = PIECES[piece], f = p.faces[face] || p.faces[0], blank = face >= p.faces.length;
  let cells = f.cells.map(c => c.slice()), masks = f.ports.map(s => blank ? 0 : maskOf(s));
  let dots = blank ? [] : f.dots.map(d => d.slice());
  for (let r = 0; r < rot; r++){
    // girar 90°: (x, y) → (-y, x)
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

/** Todas las orientaciones distintas de cada pieza (las repetidas por simetría se quitan). */
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
 * Cuenta soluciones hasta `limit`.
 * @param {object} clues
 *   dots:     índices de casilla con punto (obligatorio salvo para enumerar todo)
 *   masks:    (opcional) salida del camino conocida por casilla (array de W*H, null = desconocida)
 *   regions:  (opcional) id de pieza por casilla: la silueta de cada pieza es conocida
 *   fixed:    (opcional) [{ piece, face, rot, x, y }] piezas colocadas
 * @param {{ limit?: number, random?: boolean, W?: number, H?: number, onSolution?: Function, budget?: number }} opts
 */
export function solve(clues = {}, { limit = 2, random = false, W = BOARD_W, H = BOARD_H, onSolution = null, budget = Infinity } = {}){
  const N = W * H;
  const owner = new Int8Array(N).fill(-1), mask = new Uint8Array(N), dot = new Uint8Array(N);
  const wantDots = clues.dots ? new Set(clues.dots) : null;
  const used = new Uint8Array(PIECES.length), placed = [];
  let count = 0, first = null, nodes = 0, over = false;
  // Dos soluciones que se ven igual (p. ej. dos piezas iguales por la cara lisa intercambiadas) son la misma
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
      // la pieza debe ocupar la región entera
      if (clues.regions.filter(r => r === reg).length !== idx.length) return null;
    }
    return idx;
  };
  const apply = (o, idx, on) => idx.forEach((i, k) => {
    owner[i] = on ? o.piece : -1; mask[i] = on ? o.masks[k] : 0; dot[i] = on && o.dots.has(k) ? 1 : 0;
  });

  /** Sin circuitos cerrados: cada componente del camino tiene dos puntos (los extremos). */
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
   * Poda temprana: si algún camino que toca las casillas `idx` ya está completo (todas sus
   * salidas llevan a casillas ocupadas), debe ir de punto a punto; un circuito cerrado no vale.
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

  // Piezas fijas del reto
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
