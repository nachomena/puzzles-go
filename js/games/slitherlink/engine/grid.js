/* Slitherlink: geometría de un tablero de N × N casillas. Sin DOM.
   Lados (aristas entre dos puntos): primero los horizontales H(f, c) = f * N + c (f de 0 a N), luego los
   verticales V(f, c) = (N + 1) * N + f * (N + 1) + c (c de 0 a N). Puntos (vértices): f * (N + 1) + c.
   Casilla i = fila * N + columna; OUT = n * n es "fuera del tablero". */

const cache = new Map();

/** Todo lo que hace falta de un tablero de lado n (se calcula una vez por tamaño). */
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
  // alrededor de cada punto: las 4 casillas en orden (arriba-izq., arriba-der., abajo-der., abajo-izq.) y los
  // 4 lados entre cada dos seguidas (arriba, derecha, abajo, izquierda); fuera del tablero, OUT y -1
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

/** Lados del lazo que rodea las casillas `inside` (1 = dentro). */
export function loopOf(n, inside){
  const g = geometry(n), at = i => i === g.OUT ? 0 : inside[i];
  return g.edgeCells.map(([a, b]) => at(a) !== at(b) ? 1 : 0);
}

/** Número de cada casilla: cuántos de sus cuatro lados son del lazo. */
export const cluesOf = (n, loop) => geometry(n).cellEdges.map(es => es.reduce((t, e) => t + loop[e], 0));

/** ¿Las líneas `lines` (1 = línea) forman un único lazo cerrado? */
export function isSingleLoop(n, lines){
  const g = geometry(n), on = [];
  for (let e = 0; e < g.E; e++) if (lines[e] === 1) on.push(e);
  if (!on.length) return false;
  for (let v = 0; v < g.V; v++){
    const d = g.vertEdges[v].reduce((t, e) => t + (lines[e] === 1), 0);
    if (d !== 0 && d !== 2) return false;
  }
  // recorrido desde un lado: tiene que pasar por todos
  const seen = new Set([on[0]]), stack = [on[0]];
  while (stack.length){
    const e = stack.pop();
    for (const v of g.edgeVerts[e]) for (const f of g.vertEdges[v]) if (lines[f] === 1 && !seen.has(f)){ seen.add(f); stack.push(f); }
  }
  return seen.size === on.length;
}
