/* Bridges: islands with a number on a W × H board; between two islands in the same row
   or column, with no other island in between, there can be 0, 1 or 2 bridges. Each island has as many
   bridges as its number says, bridges don't cross and all the islands end up connected. No DOM.

   A puzzle is { w, h, islands: [{ x, y, n }] }. Its possible bridges ("spans") are computed with
   edgesOf: [{ a, b, cells }] (a < b; cells = cells the span crosses, without the islands). */

export function edgesOf({ w, h, islands }){
  const at = new Map(islands.map((s, i) => [s.y * w + s.x, i])), edges = [];
  islands.forEach((s, a) => {
    for (const [dx, dy] of [[1, 0], [0, 1]]){
      const cells = [];
      for (let x = s.x + dx, y = s.y + dy; x < w && y < h; x += dx, y += dy){
        const b = at.get(y * w + x);
        if (b !== undefined){ if (cells.length) edges.push({ a, b, cells, dir: dx ? 'h' : 'v' }); break; }
        cells.push(y * w + x);
      }
    }
  });
  // which spans cross (one across and one down that cover the same cell)
  const byCell = new Map();
  edges.forEach((e, k) => e.cells.forEach(c => { if (!byCell.has(c)) byCell.set(c, []); byCell.get(c).push(k); }));
  edges.forEach(e => { e.cross = []; });
  for (const list of byCell.values()) for (const i of list) for (const j of list) if (i !== j && !edges[i].cross.includes(j)) edges[i].cross.push(j);
  return edges;
}

/** Spans of each island: list of span indices. */
export const incidence = (islands, edges) => {
  const inc = islands.map(() => []);
  edges.forEach((e, k) => { inc[e.a].push(k); inc[e.b].push(k); });
  return inc;
};

/** Do the bridges (val > 0) connect all the islands? */
export function connected(islands, edges, val){
  const parent = islands.map((_, i) => i), find = i => parent[i] === i ? i : (parent[i] = find(parent[i]));
  edges.forEach((e, k) => { if (val[k] > 0) parent[find(e.a)] = find(e.b); });
  return islands.every((_, i) => find(i) === find(0));
}

/**
 * Counts solutions (up to `limit`). It deduces at each step (what an island is missing against what
 * its spans can hold, the crossings, and that all the islands can stay connected) and guesses where that
 * isn't enough.
 * @returns {{ count: number, solution: number[]|null, edges }}
 */
export function solve(puzzle, { limit = 2 } = {}){
  const { islands } = puzzle, edges = edgesOf(puzzle), inc = incidence(islands, edges);
  let count = 0, solution = null;

  /** Bridges island i is missing. */
  const missing = (i, val) => inc[i].reduce((n, k) => n - (val[k] > 0 ? val[k] : 0), islands[i].n);

  /** Deduces what it can; false if there is a contradiction. */
  const deduce = val => {
    for (let changed = true; changed;){
      changed = false;
      for (let k = 0; k < edges.length; k++) if (val[k] < 0 && edges[k].cross.some(j => val[j] > 0)){ val[k] = 0; changed = true; }
      for (let i = 0; i < islands.length; i++){
        const need = missing(i, val), open = [];
        let room = 0;
        for (const k of inc[i]){
          if (val[k] >= 0) continue;
          const e = edges[k], max = Math.min(2, missing(e.a === i ? e.b : e.a, val));
          if (max <= 0){ val[k] = 0; changed = true; continue; }
          open.push([k, max]); room += max;
        }
        if (need < 0 || need > room) return false;
        if (open.length && (need === room || need === 0)){
          for (const [k, max] of open) val[k] = need === 0 ? 0 : max;
          changed = true;
        }
      }
    }
    // all the islands must still be able to connect with the spans still possible
    return connected(islands, edges, val.map(v => v < 0 ? 1 : v));
  };

  const run = val => {
    if (count >= limit || !deduce(val)) return;
    const k = val.findIndex(v => v < 0);
    if (k < 0){
      if (connected(islands, edges, val)){ count++; solution ??= val.slice(); }
      return;
    }
    for (let v = 2; v >= 0 && count < limit; v--){
      const next = val.slice(); next[k] = v;
      run(next);
    }
  };
  run(new Array(edges.length).fill(-1));
  return { count, solution, edges };
}
