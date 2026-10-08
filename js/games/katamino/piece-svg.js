/* Dibujo de una pieza de Katamino en SVG (unidades = casillas), al estilo de Smart Hexagon: una sola
   pieza plana de contorno redondeado y, por dentro, una ranura más oscura que recorre sus casillas. */
import { PIECES, orient } from './engine/pieces.js';

const GAP = .05, RADIUS = .16;
const f = n => +n.toFixed(3);

/**
 * Contorno de un poliominó como polígono (vértices en sentido horario, con el interior a la derecha
 * del avance), metido `inset` hacia dentro.
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
  // recorrer el borde y quedarse con las esquinas
  const start = [...next.keys()][0].split(',').map(Number), pts = [];
  let p = start;
  do { pts.push(p); p = next.get(p.join()); } while (p.join() !== start.join());
  const dir = (a, b) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
  const corners = pts.filter((q, i) => {
    const a = dir(pts[(i + pts.length - 1) % pts.length], q), b = dir(q, pts[(i + 1) % pts.length]);
    return a[0] !== b[0] || a[1] !== b[1];
  });
  // cada lado se desplaza hacia el interior (a su derecha): la esquina se mueve con los dos lados
  return corners.map((q, i) => {
    const a = dir(corners[(i + corners.length - 1) % corners.length], q), b = dir(q, corners[(i + 1) % corners.length]);
    return [q[0] + inset * (-a[1] - b[1]), q[1] + inset * (a[0] + b[0])];
  });
}

/** Trazado de un polígono con las esquinas redondeadas. */
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
 * Ranura: un camino que pasa por todas las casillas si lo hay (empezando por un extremo); si no
 * (la T, la X, la F, la Y), un árbol que une los centros de casillas vecinas.
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
 * Contenido de una pieza en unidades de casilla (0..w, 0..h) con cara m y giro r.
 * `halo`: contorno claro de la pieza elegida (un trazo bajo el cuerpo: solo asoma por fuera).
 */
export function pieceParts(piece, m, r, { halo = false } = {}){
  const o = orient(piece, m, r), body = roundedPath(outline(o.cells, GAP), RADIUS);
  return `<g class="km-hue-${PIECES[piece].hue}">` +
    (halo ? `<path class="km-piece__halo" d="${body}"/>` : '') +
    `<path class="km-piece__body" d="${body}"/>` +
    `<path class="km-piece__groove" d="${groove(o.cells)}"/></g>`;
}

/** SVG suelto de una pieza, para la bandeja y el arrastre. */
export function pieceSvg(piece, m, r){
  const o = orient(piece, m, r);
  return `<svg class="km-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${pieceParts(piece, m, r)}</svg>`;
}

/** Icono plano de una pieza (tabla de PENTAS): tumbada y centrada en un cuadrado de 5 × 5. */
export function pieceIcon(piece){
  let o = orient(piece, 0, 0);
  if (o.h > o.w) o = orient(piece, 0, 1);
  const dx = (5 - o.w) / 2, dy = (5 - o.h) / 2;
  const d = roundedPath(outline(o.cells, .06).map(([x, y]) => [x + dx, y + dy]), .2);
  return `<svg class="km-icon" viewBox="-.2 -.2 5.4 5.4" aria-hidden="true"><path class="km-hue-${PIECES[piece].hue}" d="${d}"/></svg>`;
}
