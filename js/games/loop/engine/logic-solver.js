/* ---------- Loop logic solver (human techniques) ----------
   Each side is undecided (0), a line (1) or crossed out (2).
   Level 1 (Easy):   numbers (if it already has its lines, the rest are crossed out; if only just enough
                     are left, they are lines) and dots (each dot has 0 or 2 lines).
   Level 2 (Medium): + corners (a 1 in a closed corner crosses out its two sides; a 3 draws them) and not
                     closing a small loop while there are lines or numbers left to meet outside it.
   Level 3 (Hard):   + inside and outside: each cell is inside or outside the loop; a line separates
                     different cells and a cross joins equal ones. It reasons with those relations at
                     each number and each dot.
   Solving by logic already implies the solution is unique. */
import { geometry } from './grid.js';

export const MAX_LEVEL = 3;
const CONTRA = { contra: true };

function set(s, e, v){
  if (s.e[e] === v) return false;
  if (s.e[e]) throw CONTRA;
  s.e[e] = v;
  return true;
}

/** Level 1: the numbers. */
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

/** Level 1: each dot has 0 or 2 lines. */
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
 * Level 2: corners. At a dot where a cell's two outer sides are crossed out (or off the board), its two
 * sides at that corner go together: both lines or both crossed out. A 1 can't take two: they are crossed
 * out; a 3 can't be met without them: they are lines.
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
      // the cell's sides at this dot: between it and its neighbours around (k-1 and k+1)
      const mine = [es[(k + 3) % 4], es[k]], outer = [es[(k + 1) % 4], es[(k + 2) % 4]];
      if (mine.some(e => e < 0) || !outer.every(e => e < 0 || s.e[e] === 2)) continue;
      if (!mine.every(e => cellEdges[cell].includes(e))) continue;
      for (const e of mine) if (!s.e[e] && set(s, e, clue === 1 ? 2 : 1)) any = true;
    }
  }
  return any;
}

/** Level 2: a loop isn't closed if there are lines outside it or unmet numbers. */
function loops(s){
  const { V, E, edgeVerts, cellEdges } = s.g;
  const parent = Int32Array.from({ length: V }, (_, i) => i), size = new Int32Array(V).fill(0);
  const find = x => { while (parent[x] !== x){ parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  let total = 0;
  for (let e = 0; e < E; e++) if (s.e[e] === 1){
    total++;
    const [a, b] = edgeVerts[e], ra = find(a), rb = find(b);
    if (ra === rb){ size[ra]++; continue; }   // there is already a closed loop: the other steps watch it
    parent[ra] = rb; size[rb] += size[ra] + 1;
  }
  let any = false;
  for (let e = 0; e < E; e++){
    if (s.e[e]) continue;
    const [a, b] = edgeVerts[e], r = find(a);
    if (r !== find(b)) continue;
    // it would close the loop: only allowed if it is the last line and all the numbers are met with it
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
 * Level 3: inside and outside. "Same" or "different" relations between cells (and with off the board),
 * with a union-find with parity. With them the possible shapes at each number and each dot are tried.
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
  // known relation between two cells: 0 same, 1 different, -1 unknown
  const rel = (a, b) => { const [ra, pa] = find(a), [rb, pb] = find(b); return ra === rb ? pa ^ pb : -1; };
  let any = false;
  // sides whose two cells already have a known relation
  for (let e = 0; e < E; e++){
    if (s.e[e]) continue;
    const r = rel(edgeCells[e][0], edgeCells[e][1]);
    if (r >= 0 && set(s, e, r ? 1 : 2)) any = true;
  }
  if (any) return true;
  // tries the 16 shapes of a group's four sides; fixes the ones that come out the same in all of them
  const tryAll = (edges, nodes, ok) => {
    let forced = [-1, -1, -1, -1], found = false;
    for (let m = 0; m < 16; m++){
      const x = [m & 1, (m >> 1) & 1, (m >> 2) & 1, (m >> 3) & 1];
      if (edges.some((e, j) => e >= 0 ? (s.e[e] && (s.e[e] === 1) !== !!x[j]) : x[j])) continue;
      if (!ok(x)) continue;
      // relations between the group's cells
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
  // numbers: each neighbour's colour is the cell's plus the side between them
  for (let i = 0; i < OUT; i++){
    const c = s.clues[i];
    if (c < 0) continue;
    const edges = cellEdges[i], nodes = [{ cell: i, path: () => 0 }, ...edges.map((e, j) => ({ cell: edgeCells[e][0] === i ? edgeCells[e][1] : edgeCells[e][0], path: x => x[j] }))];
    if (tryAll(edges, nodes, x => x[0] + x[1] + x[2] + x[3] === c)) any = true;
  }
  // dots: 0 or 2 lines; the colour of each cell around is the first one's plus the sides walked
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
 * Solves with techniques up to `level` from `edges` (0 undecided, 1 line, 2 cross; null = empty).
 * `clues[i]` = the cell's number or −1. Returns { solved, contra?, edges }.
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

/** Next side deduced from `edges` with the techniques up to `level`: { edge, value } or null. */
export function nextDeduction(n, clues, level, edges){
  const g = geometry(n), s = { g, clues, e: Int8Array.from(edges) };
  try {
    for (;;){
      if (!TECHNIQUES.some(t => t.level <= level && t.apply(s))) return null;
      // the first new line (more useful than a cross); otherwise the first new cross
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
