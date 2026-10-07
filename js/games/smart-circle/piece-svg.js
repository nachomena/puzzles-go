/* Geometría y dibujo de Smart Circle (unidades: radio del tablero = 1, centro en 0,0).
   Ángulo del sector s: s · 22,5°, en el sentido de las agujas del reloj desde la derecha. */
import { PIECES, SECTORS, bonds } from './engine/pieces.js';

/** Radio de cada anillo, y de sus agujeros y bolas. */
export const RING_R = [.35, .53, .79];
export const BALL_R = [.056, .087, .133];
export const HOLE_R = BALL_R.map(r => r * .78);

const STEP = 2 * Math.PI / SECTORS;
/** Centro de un agujero (el sector puede tener decimales para dibujar piezas sueltas). */
export const xy = (ring, sector) => [RING_R[ring] * Math.cos(sector * STEP), RING_R[ring] * Math.sin(sector * STEP)];

const f = n => +n.toFixed(4);

/**
 * Marcado SVG de una pieza: uniones entre bolas, bolas y brillo.
 * @param {number} piece
 * @param {(ring:number, d:number) => number} sectorOf  sector (con decimales) de cada bola [anillo, d]
 * @param {{ halo?: boolean }} [o]
 */
export function pieceParts(piece, sectorOf, { halo = false } = {}){
  const balls = PIECES[piece].balls.map(([ring, d]) => ({ ring, at: xy(ring, sectorOf(ring, d)), r: BALL_R[ring] }));
  const links = bonds(piece).map(([a, b]) => {
    const A = balls[a], B = balls[b], w = Math.min(A.r, B.r) * 1.15;
    return `<line x1="${f(A.at[0])}" y1="${f(A.at[1])}" x2="${f(B.at[0])}" y2="${f(B.at[1])}" stroke-width="${f(w)}"/>`;
  }).join('');
  const circles = (extra = 0) => balls.map((b, k) =>
    `<circle data-k="${k}" cx="${f(b.at[0])}" cy="${f(b.at[1])}" r="${f(b.r + extra)}"/>`).join('');
  const shine = balls.map(b =>
    `<circle cx="${f(b.at[0] - b.r * .3)}" cy="${f(b.at[1] - b.r * .35)}" r="${f(b.r * .55)}"/>`).join('');
  return (halo ? `<g class="sl-halo">${links}${circles(.022)}</g>` : '') +
    `<g class="sl-links">${links}</g><g class="sl-balls">${circles()}</g><g class="sl-shine">${shine}</g>`;
}

/** Media circular de los sectores de las bolas de una pieza con cara m (para centrarla). */
function meanSector(piece, m){
  let x = 0, y = 0;
  for (const [, d] of PIECES[piece].balls){ x += Math.cos(m * d * STEP); y += Math.sin(m * d * STEP); }
  return Math.atan2(y, x) / STEP;
}

/** Sector con decimales para dibujar la pieza suelta, apuntando hacia arriba (sector 12). */
export const uprightShift = (piece, m) => SECTORS * .75 - meanSector(piece, m);

/** Postura entera más cercana a un giro con decimales. */
export const nearestShift = s => ((Math.round(s) % SECTORS) + SECTORS) % SECTORS;

/** SVG suelto de una pieza (bandeja o arrastre), recortado a su tamaño. */
export function looseSvg(piece, m, cls = ''){
  const s = uprightShift(piece, m);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [ring, d] of PIECES[piece].balls){
    const [x, y] = xy(ring, m * d + s), r = BALL_R[ring];
    x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r);
  }
  const pad = .03, w = x1 - x0 + 2 * pad, h = y1 - y0 + 2 * pad;
  return {
    w, h,
    svg: `<svg class="sl-loose ${cls}" viewBox="${f(x0 - pad)} ${f(y0 - pad)} ${f(w)} ${f(h)}" aria-hidden="true">` +
      `<g class="sl-piece sl-hue-${PIECES[piece].hue}">${pieceParts(piece, (ring, d) => m * d + s)}</g></svg>`
  };
}
