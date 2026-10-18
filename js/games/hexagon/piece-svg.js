/* Hexagon geometry and drawing (units: distance between pegs = 1, centre at 0,0). */
import { PIECES, bonds, pointsOf } from './engine/pieces.js';

const S3 = Math.sqrt(3) / 2;
/** Position of a peg (axial coordinates). */
export const postXY = ([u, v]) => [u + v / 2, v * S3];
/** Position of a midpoint (doubled coordinates). */
export const pointXY = ([u, v]) => [(u + v / 2) / 2, v / 2 * S3];
/** Doubled coordinates (with decimals) of a position. */
export const toDoubled = (x, y) => { const v = y / S3 * 2; return [2 * x - v / 2, v]; };

/** Stroke width of the pieces. */
export const STROKE = .3;
const f = n => +n.toFixed(4);

/**
 * Joins the inner groove goes through: in a tight 60° turn the three points are joined to each other
 * (the outer stroke fills the elbow), but the real path goes through the elbow's vertex, so the join
 * opposite it is removed (the vertex is the point with the fewest joins).
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

/** SVG markup of a piece with pose `pose`: outer stroke, darker inner groove and halo. */
export function pieceParts(piece, pose, { halo = false } = {}){
  const pts = pointsOf(piece, pose).map(pointXY);
  const seg = list => list.map(([a, b]) =>
    `<line data-k="${a}" x1="${f(pts[a][0])}" y1="${f(pts[a][1])}" x2="${f(pts[b][0])}" y2="${f(pts[b][1])}"/>`).join('');
  const lines = seg(bonds(piece)), groove = seg(pathBonds(piece));
  // invisible circles on each point: they tell which point the piece is grabbed by
  const grips = pts.map(([x, y], k) => `<circle data-k="${k}" cx="${f(x)}" cy="${f(y)}" r="${STROKE * .6}"/>`).join('');
  return (halo ? `<g class="hx-halo">${lines}</g>` : '') +
    `<g class="hx-outer">${lines}</g><g class="hx-inner">${groove}</g><g class="hx-grips">${grips}</g>`;
}

/** Loose SVG of a piece with side m and rotation r (tray or drag), cropped to its size. */
export function looseSvg(piece, m, r){
  const pose = { m, r, tu: 0, tv: 0 }, pts = pointsOf(piece, pose).map(pointXY), pad = STROKE / 2 + .04;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) - x0 + pad, h = Math.max(...ys) - y0 + pad;
  return {
    w, h,
    svg: `<svg class="hx-loose" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" aria-hidden="true">` +
      `<g class="hx-piece hx-hue-${PIECES[piece].hue}">${pieceParts(piece, pose)}</g></svg>`
  };
}
