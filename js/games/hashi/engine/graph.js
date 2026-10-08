/* Hashi (Puentes): islas con un número en un tablero de W × H; entre dos islas en la misma fila o
   columna, sin otra isla en medio, puede haber 0, 1 o 2 puentes. Cada isla tiene tantos puentes
   como dice su número, los puentes no se cruzan y todas las islas quedan unidas. Sin DOM.

   Un reto es { w, h, islands: [{ x, y, n }] }. Sus posibles puentes ("tramos") se calculan con
   edgesOf: [{ a, b, cells }] (a < b; cells = casillas que pisa el tramo, sin las islas). */

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
  // qué tramos se cruzan (uno horizontal y otro vertical que pisan una misma casilla)
  const byCell = new Map();
  edges.forEach((e, k) => e.cells.forEach(c => { if (!byCell.has(c)) byCell.set(c, []); byCell.get(c).push(k); }));
  edges.forEach(e => { e.cross = []; });
  for (const list of byCell.values()) for (const i of list) for (const j of list) if (i !== j && !edges[i].cross.includes(j)) edges[i].cross.push(j);
  return edges;
}

/** Tramos de cada isla: lista de índices de tramo. */
export const incidence = (islands, edges) => {
  const inc = islands.map(() => []);
  edges.forEach((e, k) => { inc[e.a].push(k); inc[e.b].push(k); });
  return inc;
};

/** ¿Unen los puentes (val > 0) todas las islas? */
export function connected(islands, edges, val){
  const parent = islands.map((_, i) => i), find = i => parent[i] === i ? i : (parent[i] = find(parent[i]));
  edges.forEach((e, k) => { if (val[k] > 0) parent[find(e.a)] = find(e.b); });
  return islands.every((_, i) => find(i) === find(0));
}

/**
 * Cuenta soluciones (hasta `limit`). Deduce en cada paso (lo que falta en una isla frente a lo que
 * caben sus tramos, los cruces, y que todas las islas puedan seguir unidas) y prueba donde no basta.
 * @returns {{ count: number, solution: number[]|null, edges }}
 */
export function solve(puzzle, { limit = 2 } = {}){
  const { islands } = puzzle, edges = edgesOf(puzzle), inc = incidence(islands, edges);
  let count = 0, solution = null;

  /** Puentes que le faltan a la isla i. */
  const missing = (i, val) => inc[i].reduce((n, k) => n - (val[k] > 0 ? val[k] : 0), islands[i].n);

  /** Deduce lo que se pueda; false si hay contradicción. */
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
    // todas las islas tienen que poder seguir unidas con los tramos aún posibles
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
