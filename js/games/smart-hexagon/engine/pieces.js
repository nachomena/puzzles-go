/* Piezas y tablero de Smart Hexagon (clon de IQ Hexagon de SmartGames).
   Las clavijas del tablero forman una red triangular (19 clavijas, más un anillo de clavijas
   imaginarias en el borde). Las piezas son trazos que pasan por los puntos medios entre dos
   clavijas vecinas: el tablero tiene 72 de esos puntos y las 12 piezas los llenan todos.
   Coordenadas: axiales "dobles" (u, v) = suma de las dos clavijas de cada punto medio, con
   x = (u + v / 2) / 2 · d e y = v / 2 · d · √3/2 (d = distancia entre clavijas).
   Las 12 piezas se han sacado de las 120 soluciones del cuadernillo original. */

/** Las piezas (SG 314-A … L): puntos medios que ocupa cada una, en una postura de referencia. */
export const PIECES = Object.freeze([
  { id: 'A', hue: 'yellow', pts: [[0, 1], [1, 0], [1, 1], [2, -1], [3, -1], [4, -1]] },
  { id: 'B', hue: 'orange', pts: [[0, 1], [1, 0], [1, 1], [2, -1], [3, -1], [3, 0]] },
  { id: 'C', hue: 'red', pts: [[0, 1], [1, -1], [1, 0], [1, 1], [2, 1], [3, 0]] },
  { id: 'D', hue: 'maroon', pts: [[0, 1], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3]] },
  { id: 'E', hue: 'pink', pts: [[0, 1], [1, 0], [1, 1], [2, -1], [2, 1], [3, -2], [3, 0]] },
  { id: 'F', hue: 'purple', pts: [[0, 1], [1, 0], [1, 1], [2, -1], [2, 1], [3, -1]] },
  { id: 'G', hue: 'navy', pts: [[0, 1], [1, 0], [1, 1], [2, -1], [2, 1], [3, -2], [3, -1]] },
  { id: 'H', hue: 'blue', pts: [[0, 1], [0, 3], [1, 0], [1, 1], [1, 2], [2, -1]] },
  { id: 'I', hue: 'sky', pts: [[0, 1], [1, -2], [1, -1], [1, 0], [2, -1]] },
  { id: 'J', hue: 'aqua', pts: [[0, 1], [0, 3], [1, 0], [1, 1], [1, 2], [2, 1]] },
  { id: 'K', hue: 'green', pts: [[0, 1], [0, 3], [1, 0], [1, 1], [1, 2]] },
  { id: 'L', hue: 'lime', pts: [[0, 1], [0, 3], [1, -1], [1, 0], [1, 1], [1, 2]] }
].map(p => Object.freeze({ ...p, pts: Object.freeze(p.pts.map(q => Object.freeze(q))) })));

const ring = (u, v) => Math.max(Math.abs(u), Math.abs(v), Math.abs(u + v));

/** Clavijas del tablero (anillos 0 a 2), en coordenadas axiales. */
export const POSTS = [];
/** Puntos medios del tablero, en orden: entre clavijas hasta el anillo 3, sin los del borde. */
export const POINTS = [];
for (let u = -3; u <= 3; u++) for (let v = -3; v <= 3; v++){
  if (ring(u, v) > 3) continue;
  if (ring(u, v) <= 2) POSTS.push([u, v]);
  for (const [du, dv] of [[1, 0], [0, 1], [-1, 1]]){
    const a = [u + du, v + dv];
    if (ring(...a) > 3 || (ring(u, v) === 3 && ring(...a) === 3)) continue;
    POINTS.push([2 * u + du, 2 * v + dv]);
  }
}
export const CELLS = POINTS.length;
const INDEX = new Map(POINTS.map((p, i) => [p.join(), i]));
export const pointIndex = (u, v) => INDEX.get(u + ',' + v) ?? -1;

/** Giro de 60° y espejo de la red (valen igual en coordenadas dobles). */
export const rot60 = ([u, v]) => [-v, u + v];
export const mirror = ([u, v]) => [v, u];

/** Puntos de una pieza en una postura { m: 0|1 (cara), r: 0..5 (giro), tu, tv (traslación, pares) }. */
export function pointsOf(piece, { m, r, tu, tv }){
  return PIECES[piece].pts.map(p => {
    let q = m ? mirror(p) : p;
    for (let k = 0; k < r; k++) q = rot60(q);
    return [q[0] + tu, q[1] + tv];
  });
}

/** Casillas (índices de POINTS) de una pieza en una postura, o null si se sale del tablero. */
export function cellsOf(piece, pose){
  const cells = pointsOf(piece, pose).map(([u, v]) => pointIndex(u, v));
  return cells.includes(-1) ? null : cells;
}

/** Pares de puntos unidos de una pieza (vecinos en la red de puntos medios). */
const NEAR = new Set(['1,0', '-1,0', '0,1', '0,-1', '1,-1', '-1,1']);
export function bonds(piece){
  const pts = PIECES[piece].pts, out = [];
  for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++)
    if (NEAR.has((pts[a][0] - pts[b][0]) + ',' + (pts[a][1] - pts[b][1]))) out.push([a, b]);
  return out;
}

let placements = null;
/** Todas las colocaciones distintas de cada pieza en el tablero: [[{ pose, cells, key }]]. */
export function allPlacements(){
  if (placements) return placements;
  placements = PIECES.map((_, p) => {
    const seen = new Set(), out = [];
    for (let m = 0; m < 2; m++) for (let r = 0; r < 6; r++) for (let tu = -14; tu <= 14; tu += 2) for (let tv = -14; tv <= 14; tv += 2){
      const pose = { m, r, tu, tv }, cells = cellsOf(p, pose);
      if (!cells) continue;
      const key = cells.slice().sort((a, b) => a - b).join();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ pose, cells, key });
    }
    return out;
  });
  return placements;
}

/** Simetrías del tablero (6 giros × 2 caras) como permutaciones de las casillas. */
export const SYMMETRIES = (() => {
  const out = [];
  for (let m = 0; m < 2; m++) for (let r = 0; r < 6; r++){
    out.push(POINTS.map(p => {
      let q = m ? mirror(p) : p;
      for (let k = 0; k < r; k++) q = rot60(q);
      return pointIndex(q[0], q[1]);
    }));
  }
  return out;
})();
