/* Geometría y dibujo de Smart Hexagon (unidades: distancia entre clavijas = 1, centro en 0,0). */
import { PIECES, bonds, pointsOf } from './engine/pieces.js';

const S3 = Math.sqrt(3) / 2;
/** Posición de una clavija (coordenadas axiales). */
export const postXY = ([u, v]) => [u + v / 2, v * S3];
/** Posición de un punto medio (coordenadas dobles). */
export const pointXY = ([u, v]) => [(u + v / 2) / 2, v / 2 * S3];
/** Coordenadas dobles (con decimales) de una posición. */
export const toDoubled = (x, y) => { const v = y / S3 * 2; return [2 * x - v / 2, v]; };

/** Grosor del trazo de las piezas. */
export const STROKE = .3;
const f = n => +n.toFixed(4);

/**
 * Uniones por las que pasa la ranura interior: en un giro cerrado de 60° los tres puntos están
 * unidos entre sí (el trazo exterior rellena el codo), pero el camino real va por el vértice del
 * codo, así que se quita la unión opuesta a él (el vértice es el punto con menos uniones).
 */
const pathCache = new Map();
function pathBonds(piece){
  if (pathCache.has(piece)) return pathCache.get(piece);
  const all = bonds(piece), deg = new Map();
  for (const [a, b] of all){ deg.set(a, (deg.get(a) || 0) + 1); deg.set(b, (deg.get(b) || 0) + 1); }
  const has = (a, b) => all.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const drop = new Set();
  const n = PIECES[piece].pts.length;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++){
    if (!has(a, b) || !has(b, c) || !has(a, c)) continue;
    const apex = [a, b, c].reduce((x, y) => deg.get(y) < deg.get(x) ? y : x);
    const [p, q] = [a, b, c].filter(v => v !== apex);
    drop.add(Math.min(p, q) + ',' + Math.max(p, q));
  }
  const out = all.filter(([a, b]) => !drop.has(Math.min(a, b) + ',' + Math.max(a, b)));
  pathCache.set(piece, out);
  return out;
}

/** Marcado SVG de una pieza con postura `pose`: trazo exterior, ranura interior más oscura y halo. */
export function pieceParts(piece, pose, { halo = false } = {}){
  const pts = pointsOf(piece, pose).map(pointXY);
  const seg = list => list.map(([a, b]) =>
    `<line data-k="${a}" x1="${f(pts[a][0])}" y1="${f(pts[a][1])}" x2="${f(pts[b][0])}" y2="${f(pts[b][1])}"/>`).join('');
  const lines = seg(bonds(piece)), groove = seg(pathBonds(piece));
  // círculos invisibles en cada punto: dan de qué punto se agarra la pieza
  const grips = pts.map(([x, y], k) => `<circle data-k="${k}" cx="${f(x)}" cy="${f(y)}" r="${STROKE * .6}"/>`).join('');
  return (halo ? `<g class="sh-halo">${lines}</g>` : '') +
    `<g class="sh-outer">${lines}</g><g class="sh-inner">${groove}</g><g class="sh-grips">${grips}</g>`;
}

/** SVG suelto de una pieza con cara m y giro r (bandeja o arrastre), recortado a su tamaño. */
export function looseSvg(piece, m, r){
  const pose = { m, r, tu: 0, tv: 0 }, pts = pointsOf(piece, pose).map(pointXY), pad = STROKE / 2 + .04;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) - x0 + pad, h = Math.max(...ys) - y0 + pad;
  return {
    w, h,
    svg: `<svg class="sh-loose" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" aria-hidden="true">` +
      `<g class="sh-piece sh-hue-${PIECES[piece].hue}">${pieceParts(piece, pose)}</g></svg>`
  };
}
