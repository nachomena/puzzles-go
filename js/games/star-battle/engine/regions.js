/* Construcción y edición de regiones a partir de una solución. */
import { DIRS4, adjacency, rowOf, colOf, inBounds } from '../../../lib/grid.js';
import { shuffle, pick, randInt } from '../../../lib/random.js';

const FILL_GUARD = 200000;
const PAIRING_JITTER = 1.5;

/** Regiones vecinas de la casilla i distintas de `exclude` (con repetición, en orden DIRS4). */
export function neighbourRegions(N, reg, i, exclude){
  const out = [];
  for (const j of adjacency(N).n4[i]) if (reg[j] !== exclude) out.push(reg[j]);
  return out;
}

/** ¿Sigue siendo conexa la región g si se le quita la casilla `skip`? */
export function connectedWithout(N, reg, g, skip){
  let start = -1, total = 0;
  for (let i = 0; i < N * N; i++) if (reg[i] === g && i !== skip){ total++; if (start < 0) start = i; }
  if (!total) return false;
  const { n4 } = adjacency(N);
  const seen = new Uint8Array(N * N), stack = [start];
  seen[start] = 1;
  let n = 0;
  while (stack.length){
    const i = stack.pop(); n++;
    for (const j of n4[i]) if (!seen[j] && j !== skip && reg[j] === g){ seen[j] = 1; stack.push(j); }
  }
  return n === total;
}

/** Agrupa las estrellas de K en K (K ≤ 2) emparejando las cercanas. */
function groupStars(N, K, stars){
  if (K === 1) return stars.map(s => [s]);
  const groups = [], left = shuffle(stars.slice());
  while (left.length){
    const a = left.shift();
    let bi = 0, bd = Infinity;
    left.forEach((b, i) => {
      const d = Math.abs(rowOf(N, a) - rowOf(N, b)) + Math.abs(colOf(N, a) - colOf(N, b)) + Math.random() * PAIRING_JITTER;
      if (d < bd){ bd = d; bi = i; }
    });
    groups.push([a, left.splice(bi, 1)[0]]);
  }
  return groups;
}

/** Une las dos estrellas de la región g con un camino de casillas libres (BFS aleatorio). */
function connectPair(N, reg, isStar, g, a, b){
  const prev = new Int32Array(N * N).fill(-2);
  prev[a] = -1;
  const q = [a];
  let head = 0, found = false;
  while (head < q.length && !found){
    const i = q[head++], r = rowOf(N, i), c = colOf(N, i);
    for (const [dr, dc] of shuffle(DIRS4.slice())){
      const x = r + dr, y = c + dc;
      if (!inBounds(N, x, y)) continue;
      const j = x * N + y;
      if (prev[j] !== -2) continue;
      if (j === b){ prev[j] = i; found = true; break; }
      if (reg[j] !== -1 || isStar[j]) continue;
      prev[j] = i; q.push(j);
    }
  }
  if (!found) return false;
  for (let p = prev[b]; p !== a; p = prev[p]) reg[p] = g;
  return true;
}

/** Reparte las casillas sueltas entre regiones vecinas al azar. */
function growRegions(N, reg){
  let free = 0;
  for (let i = 0; i < N * N; i++) if (reg[i] < 0) free++;
  for (let guard = 0; free > 0 && guard < FILL_GUARD; guard++){
    const i = randInt(N * N);
    if (reg[i] >= 0) continue;
    const nbs = neighbourRegions(N, reg, i, -1);
    if (!nbs.length) continue;
    reg[i] = pick(nbs); free--;
  }
  return free === 0;
}

/** Regiones conexas con exactamente K estrellas cada una, o null si no se logra. */
export function buildRegions(N, K, stars){
  const reg = new Int8Array(N * N).fill(-1), isStar = new Uint8Array(N * N);
  stars.forEach(s => isStar[s] = 1);
  const groups = groupStars(N, K, stars);
  groups.forEach((gr, g) => gr.forEach(s => reg[s] = g));
  for (let g = 0; g < groups.length; g++){
    if (groups[g].length < 2) continue;
    if (!connectPair(N, reg, isStar, g, groups[g][0], groups[g][1])) return null;
  }
  return growRegions(N, reg) ? reg : null;
}
