/* Loop: geometry of an N × N board of cells. No DOM.
   Sides (edges between two dots): first the horizontal ones H(r, c) = r * N + c (r from 0 to N), then the
   vertical ones V(r, c) = (N + 1) * N + r * (N + 1) + c (c from 0 to N). Dots (vertices): r * (N + 1) + c.
   Cell i = row * N + column; OUT = n * n is "off the board". */

const cache = new Map();

/** Everything needed for a board of side n (computed once per size). */
export function geometry(n){
  if (cache.has(n)) return cache.get(n);
  const NH = (n + 1) * n, E = NH + n * (n + 1), V = (n + 1) * (n + 1), OUT = n * n;
  const H = (r, c) => r * n + c, Vt = (r, c) => NH + r * (n + 1) + c, P = (r, c) => r * (n + 1) + c;
  const cellEdges = [], vertEdges = Array.from({ length: V }, () => []), edgeVerts = [], edgeCells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cellEdges.push([H(r, c), H(r + 1, c), Vt(r, c), Vt(r, c + 1)]);
  for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++){
    const e = H(r, c);
    edgeVerts[e] = [P(r, c), P(r, c + 1)];
    edgeCells[e] = [r > 0 ? (r - 1) * n + c : OUT, r < n ? r * n + c : OUT];
  }
  for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++){
    const e = Vt(r, c);
    edgeVerts[e] = [P(r, c), P(r + 1, c)];
    edgeCells[e] = [c > 0 ? r * n + c - 1 : OUT, c < n ? r * n + c : OUT];
  }
  for (let e = 0; e < E; e++) for (const v of edgeVerts[e]) vertEdges[v].push(e);
  // around each dot: the 4 cells in order (top-left, top-right, bottom-right, bottom-left) and the
  // 4 sides between each consecutive pair (top, right, bottom, left); off the board, OUT and -1
  const cellAt = (r, c) => r >= 0 && c >= 0 && r < n && c < n ? r * n + c : OUT;
  const around = [];
  for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++){
    around.push({
      cells: [cellAt(r - 1, c - 1), cellAt(r - 1, c), cellAt(r, c), cellAt(r, c - 1)],
      edges: [r > 0 ? Vt(r - 1, c) : -1, c < n ? H(r, c) : -1, r < n ? Vt(r, c) : -1, c > 0 ? H(r, c - 1) : -1]
    });
  }
  const g = { n, NH, E, V, OUT, H, Vt, P, cellEdges, vertEdges, edgeVerts, edgeCells, around };
  cache.set(n, g);
  return g;
}

/** Sides of the loop around the cells `inside` (1 = inside). */
export function loopOf(n, inside){
  const g = geometry(n), at = i => i === g.OUT ? 0 : inside[i];
  return g.edgeCells.map(([a, b]) => at(a) !== at(b) ? 1 : 0);
}

/** Number of each cell: how many of its four sides belong to the loop. */
export const cluesOf = (n, loop) => geometry(n).cellEdges.map(es => es.reduce((t, e) => t + loop[e], 0));

/** Do the lines `lines` (1 = line) form a single closed loop? */
export function isSingleLoop(n, lines){
  const g = geometry(n), on = [];
  for (let e = 0; e < g.E; e++) if (lines[e] === 1) on.push(e);
  if (!on.length) return false;
  for (let v = 0; v < g.V; v++){
    const d = g.vertEdges[v].reduce((t, e) => t + (lines[e] === 1), 0);
    if (d !== 0 && d !== 2) return false;
  }
  // walk from one side: it must go through all of them
  const seen = new Set([on[0]]), stack = [on[0]];
  while (stack.length){
    const e = stack.pop();
    for (const v of g.edgeVerts[e]) for (const f of g.vertEdges[v]) if (lines[f] === 1 && !seen.has(f)){ seen.add(f); stack.push(f); }
  }
  return seen.size === on.length;
}
