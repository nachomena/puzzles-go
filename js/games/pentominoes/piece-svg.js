/* Drawing of a Pentominoes piece in SVG (units = cells), in the style of Hexagon: a single flat piece with
   a rounded outline and, inside, a darker groove running through its cells. */
import { PIECES, orient } from './engine/pieces.js';

const GAP = .05, RADIUS = .16;
const f = n => +n.toFixed(3);

/**
 * Outline of a polyomino as a polygon (clockwise vertices, with the inside to the right of the direction
 * of travel), set `inset` inwards.
 */
function outline(cells, inset){
  const has = new Set(cells.map(([x, y]) => `${x},${y}`)), next = new Map();
  for (const [x, y] of cells){
    const edge = (a, b) => next.set(a.join(), b);
    if (!has.has(`${x},${y - 1}`)) edge([x, y], [x + 1, y]);
    if (!has.has(`${x + 1},${y}`)) edge([x + 1, y], [x + 1, y + 1]);
    if (!has.has(`${x},${y + 1}`)) edge([x + 1, y + 1], [x, y + 1]);
    if (!has.has(`${x - 1},${y}`)) edge([x, y + 1], [x, y]);
  }
  // walk the border and keep the corners
  const start = [...next.keys()][0].split(',').map(Number), pts = [];
  let p = start;
  do { pts.push(p); p = next.get(p.join()); } while (p.join() !== start.join());
  const dir = (a, b) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
  const corners = pts.filter((q, i) => {
    const a = dir(pts[(i + pts.length - 1) % pts.length], q), b = dir(q, pts[(i + 1) % pts.length]);
    return a[0] !== b[0] || a[1] !== b[1];
  });
  // each side moves inwards (to its right): the corner moves with both sides
  return corners.map((q, i) => {
    const a = dir(corners[(i + corners.length - 1) % corners.length], q), b = dir(q, corners[(i + 1) % corners.length]);
    return [q[0] + inset * (-a[1] - b[1]), q[1] + inset * (a[0] + b[0])];
  });
}

/** Path of a polygon with rounded corners. */
function roundedPath(pts, r){
  const n = pts.length, towards = (a, b, d) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.min(d, len / 2) / len;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  let d = '';
  pts.forEach((v, i) => {
    const a = towards(v, pts[(i + n - 1) % n], r), b = towards(v, pts[(i + 1) % n], r);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(v[0])} ${f(v[1])} ${f(b[0])} ${f(b[1])}`;
  });
  return d + 'Z';
}

/**
 * Groove: a path through every cell if there is one (starting at one end); otherwise (the T, the X, the
 * F, the Y), a tree joining the centres of neighbouring cells.
 */
function groove(cells){
  const key = ([x, y]) => `${x},${y}`, has = new Set(cells.map(key));
  const near = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(c => has.has(key(c)));
  const seg = (a, b) => `M${a[0] + .5} ${a[1] + .5}L${b[0] + .5} ${b[1] + .5}`;
  const starts = [...cells].sort((a, b) => near(a).length - near(b).length);
  const walk = path => {
    if (path.length === cells.length) return path;
    for (const n of near(path.at(-1))) if (!path.some(c => key(c) === key(n))){ const r = walk([...path, n]); if (r) return r; }
    return null;
  };
  for (const s of starts){
    const path = walk([s]);
    if (path) return path.slice(1).map((c, i) => seg(path[i], c)).join('');
  }
  const seen = new Set([key(starts[0])]), queue = [starts[0]];
  let d = '';
  while (queue.length){
    const c = queue.shift();
    for (const n of near(c)) if (!seen.has(key(n))){ seen.add(key(n)); queue.push(n); d += seg(c, n); }
  }
  return d;
}

/**
 * Content of a piece in cell units (0..w, 0..h) with side m and rotation r.
 * `halo`: light outline of the picked piece (a stroke under the body: it only shows outside).
 */
export function pieceParts(piece, m, r, { halo = false } = {}){
  const o = orient(piece, m, r), body = roundedPath(outline(o.cells, GAP), RADIUS);
  return `<g class="pt-hue-${PIECES[piece].hue}">` +
    (halo ? `<path class="pt-piece__halo" d="${body}"/>` : '') +
    `<path class="pt-piece__body" d="${body}"/>` +
    `<path class="pt-piece__groove" d="${groove(o.cells)}"/></g>`;
}

/** Loose SVG of a piece, for the tray and the drag. */
export function pieceSvg(piece, m, r){
  const o = orient(piece, m, r);
  return `<svg class="pt-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${pieceParts(piece, m, r)}</svg>`;
}

/** Flat icon of a piece (puzzle table): lying down and centred in a 5 × 5 square. */
export function pieceIcon(piece){
  let o = orient(piece, 0, 0);
  if (o.h > o.w) o = orient(piece, 0, 1);
  const dx = (5 - o.w) / 2, dy = (5 - o.h) / 2;
  const d = roundedPath(outline(o.cells, .06).map(([x, y]) => [x + dx, y + dy]), .2);
  return `<svg class="pt-icon" viewBox="-.2 -.2 5.4 5.4" aria-hidden="true"><path class="pt-hue-${PIECES[piece].hue}" d="${d}"/></svg>`;
}
