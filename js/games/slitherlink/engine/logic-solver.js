/* ---------- Solucionador lógico de Slitherlink (técnicas humanas) ----------
   Cada lado está sin decidir (0), es línea (1) o está tachado (2).
   Nivel 1 (Fácil):   números (si ya tiene sus líneas, el resto se tacha; si solo le quedan las justas, son
                      líneas) y puntos (de cada punto salen 0 o 2 líneas).
   Nivel 2 (Medio):   + esquinas (un 1 en una esquina cerrada tacha sus dos lados; un 3, los pone) y no
                      cerrar un lazo pequeño mientras queden líneas o números por cumplir fuera de él.
   Nivel 3 (Difícil): + dentro y fuera: cada casilla está dentro o fuera del lazo; una línea separa
                      casillas distintas y un tachado une iguales. Se razona con esas relaciones en cada
                      número y en cada punto.
   Resolver por lógica ya implica que la solución es única. */
import { geometry } from './grid.js';

export const MAX_LEVEL = 3;
const CONTRA = { contra: true };

function set(s, e, v){
  if (s.e[e] === v) return false;
  if (s.e[e]) throw CONTRA;
  s.e[e] = v;
  return true;
}

/** Nivel 1: los números. */
function cells(s){
  let any = false;
  const { cellEdges } = s.g;
  for (let i = 0; i < s.clues.length; i++){
    const c = s.clues[i];
    if (c < 0) continue;
    let lines = 0, open = 0;
    for (const e of cellEdges[i]){ if (s.e[e] === 1) lines++; else if (!s.e[e]) open++; }
    if (lines > c || lines + open < c) throw CONTRA;
    if (!open) continue;
    if (lines === c) for (const e of cellEdges[i]){ if (!s.e[e] && set(s, e, 2)) any = true; }
    else if (lines + open === c) for (const e of cellEdges[i]){ if (!s.e[e] && set(s, e, 1)) any = true; }
  }
  return any;
}

/** Nivel 1: de cada punto salen 0 o 2 líneas. */
function vertices(s){
  let any = false;
  for (const es of s.g.vertEdges){
    let lines = 0, open = 0;
    for (const e of es){ if (s.e[e] === 1) lines++; else if (!s.e[e]) open++; }
    if (lines > 2 || (lines === 1 && !open)) throw CONTRA;
    if (!open) continue;
    const to = lines === 2 || (lines === 0 && open === 1) ? 2 : lines === 1 && open === 1 ? 1 : 0;
    if (to) for (const e of es) if (!s.e[e] && set(s, e, to)) any = true;
  }
  return any;
}

/**
 * Nivel 2: esquinas. En un punto con los dos lados de fuera de una casilla tachados (o fuera del tablero),
 * sus dos lados de esa esquina van juntos: los dos líneas o los dos tachados. Un 1 no puede con dos: se
 * tachan; un 3 no se cumple sin ellos: son líneas.
 */
function corners(s){
  let any = false;
  const { around, cellEdges, OUT } = s.g;
  for (const { cells: cs, edges: es } of around){
    for (let k = 0; k < 4; k++){
      const cell = cs[k];
      if (cell === OUT) continue;
      const clue = s.clues[cell];
      if (clue !== 1 && clue !== 3) continue;
      // lados de la casilla en este punto: entre ella y sus vecinas de la vuelta (k-1 y k+1)
      const mine = [es[(k + 3) % 4], es[k]], outer = [es[(k + 1) % 4], es[(k + 2) % 4]];
      if (mine.some(e => e < 0) || !outer.every(e => e < 0 || s.e[e] === 2)) continue;
      if (!mine.every(e => cellEdges[cell].includes(e))) continue;
      for (const e of mine) if (!s.e[e] && set(s, e, clue === 1 ? 2 : 1)) any = true;
    }
  }
  return any;
}

/** Nivel 2: no se cierra un lazo si quedan líneas fuera de él o números sin cumplir. */
function loops(s){
  const { V, E, edgeVerts, cellEdges } = s.g;
  const parent = Int32Array.from({ length: V }, (_, i) => i), size = new Int32Array(V).fill(0);
  const find = x => { while (parent[x] !== x){ parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  let total = 0;
  for (let e = 0; e < E; e++) if (s.e[e] === 1){
    total++;
    const [a, b] = edgeVerts[e], ra = find(a), rb = find(b);
    if (ra === rb){ size[ra]++; continue; }   // ya hay un lazo cerrado: lo vigilan los demás pasos
    parent[ra] = rb; size[rb] += size[ra] + 1;
  }
  let any = false;
  for (let e = 0; e < E; e++){
    if (s.e[e]) continue;
    const [a, b] = edgeVerts[e], r = find(a);
    if (r !== find(b)) continue;
    // cerraría el lazo: solo vale si es la última línea y con ella se cumplen todos los números
    let ok = size[r] === total;
    if (ok) for (let i = 0; i < s.clues.length && ok; i++){
      if (s.clues[i] < 0) continue;
      const lines = cellEdges[i].reduce((t, f) => t + (s.e[f] === 1 || f === e ? 1 : 0), 0);
      if (lines !== s.clues[i]) ok = false;
    }
    if (!ok && set(s, e, 2)) any = true;
  }
  return any;
}

/**
 * Nivel 3: dentro y fuera. Relaciones de "igual" o "distinta" entre casillas (y con fuera del tablero),
 * con un union-find con paridad. Con ellas se prueban las formas posibles en cada número y en cada punto.
 */
function parity(s){
  const { E, edgeCells, cellEdges, around, OUT } = s.g, N = OUT + 1;
  const parent = Int32Array.from({ length: N }, (_, i) => i), par = new Uint8Array(N);
  const find = x => { let p = 0; while (parent[x] !== x){ p ^= par[x]; x = parent[x]; } return [x, p]; };
  const join = (a, b, d) => {
    const [ra, pa] = find(a), [rb, pb] = find(b);
    if (ra === rb){ if ((pa ^ pb) !== d) throw CONTRA; return; }
    parent[ra] = rb; par[ra] = pa ^ pb ^ d;
  };
  for (let e = 0; e < E; e++) if (s.e[e]) join(edgeCells[e][0], edgeCells[e][1], s.e[e] === 1 ? 1 : 0);
  // relación conocida entre dos casillas: 0 igual, 1 distinta, -1 no se sabe
  const rel = (a, b) => { const [ra, pa] = find(a), [rb, pb] = find(b); return ra === rb ? pa ^ pb : -1; };
  let any = false;
  // lados cuyas dos casillas ya tienen relación conocida
  for (let e = 0; e < E; e++){
    if (s.e[e]) continue;
    const r = rel(edgeCells[e][0], edgeCells[e][1]);
    if (r >= 0 && set(s, e, r ? 1 : 2)) any = true;
  }
  if (any) return true;
  // prueba las 16 formas de los cuatro lados de un grupo; fija los que salen igual en todas
  const tryAll = (edges, nodes, ok) => {
    let forced = [-1, -1, -1, -1], found = false;
    for (let m = 0; m < 16; m++){
      const x = [m & 1, (m >> 1) & 1, (m >> 2) & 1, (m >> 3) & 1];
      if (edges.some((e, j) => e >= 0 ? (s.e[e] && (s.e[e] === 1) !== !!x[j]) : x[j])) continue;
      if (!ok(x)) continue;
      // relaciones entre las casillas del grupo
      let fine = true;
      for (let a = 0; a < nodes.length && fine; a++) for (let b = a + 1; b < nodes.length && fine; b++){
        const r = rel(nodes[a].cell, nodes[b].cell);
        if (r >= 0 && r !== (nodes[a].path(x) ^ nodes[b].path(x))) fine = false;
      }
      if (!fine) continue;
      found = true;
      x.forEach((v, j) => { forced[j] = forced[j] === -1 ? v : forced[j] === v ? v : 2; });
    }
    if (!found) throw CONTRA;
    let changed = false;
    edges.forEach((e, j) => { if (e >= 0 && !s.e[e] && forced[j] < 2 && set(s, e, forced[j] ? 1 : 2)) changed = true; });
    return changed;
  };
  // números: el color de cada vecina es el de la casilla más el lado que las separa
  for (let i = 0; i < OUT; i++){
    const c = s.clues[i];
    if (c < 0) continue;
    const edges = cellEdges[i], nodes = [{ cell: i, path: () => 0 }, ...edges.map((e, j) => ({ cell: edgeCells[e][0] === i ? edgeCells[e][1] : edgeCells[e][0], path: x => x[j] }))];
    if (tryAll(edges, nodes, x => x[0] + x[1] + x[2] + x[3] === c)) any = true;
  }
  // puntos: 0 o 2 líneas; el color de cada casilla de la vuelta es el de la primera más los lados recorridos
  for (const { cells: cs, edges } of around){
    const nodes = cs.map((cell, k) => ({ cell, path: x => { let p = 0; for (let j = 0; j < k; j++) p ^= x[j]; return p; } }));
    if (tryAll(edges, nodes, x => { const d = x[0] + x[1] + x[2] + x[3]; return d === 0 || d === 2; })) any = true;
  }
  return any;
}

export const TECHNIQUES = [
  { id: 'cells',    level: 1, apply: cells },
  { id: 'vertices', level: 1, apply: vertices },
  { id: 'corners',  level: 2, apply: corners },
  { id: 'loops',    level: 2, apply: loops },
  { id: 'parity',   level: 3, apply: parity }
];

/**
 * Resuelve con técnicas hasta `level` a partir de `edges` (0 sin decidir, 1 línea, 2 tachado; null = vacío).
 * `clues[i]` = número de la casilla o −1. Devuelve { solved, contra?, edges }.
 */
export function logic(n, clues, level, edges = null){
  const g = geometry(n), s = { g, clues, e: edges ? Int8Array.from(edges) : new Int8Array(g.E) };
  try {
    while (TECHNIQUES.some(t => t.level <= level && t.apply(s)));
  } catch (e){
    if (e !== CONTRA) throw e;
    return { solved: false, contra: true, edges: null };
  }
  return { solved: s.e.every(Boolean), edges: Array.from(s.e) };
}

/** Siguiente lado que se deduce desde `edges` con las técnicas hasta `level`: { edge, value } o null. */
export function nextDeduction(n, clues, level, edges){
  const g = geometry(n), s = { g, clues, e: Int8Array.from(edges) };
  try {
    for (;;){
      if (!TECHNIQUES.some(t => t.level <= level && t.apply(s))) return null;
      // la primera línea nueva (más útil que un tachado); si no, el primer tachado nuevo
      const line = [...s.e.keys()].find(e => !edges[e] && s.e[e] === 1);
      if (line !== undefined) return { edge: line, value: 1 };
      const cross = [...s.e.keys()].find(e => !edges[e] && s.e[e] === 2);
      if (cross !== undefined) return { edge: cross, value: 2 };
    }
  } catch (e){
    if (e !== CONTRA) throw e;
    return null;
  }
}
