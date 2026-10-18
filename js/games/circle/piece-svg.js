/* Circle geometry and drawing (units: board radius = 1, centre at 0,0).
   Angle of sector s: s · 22.5°, clockwise from the right. */
import { PIECES, SECTORS, bonds } from './engine/pieces.js';

/** Radius of each ring, and of its holes and balls. */
export const RING_R = [.35, .53, .79];
export const BALL_R = [.056, .087, .133];
export const HOLE_R = BALL_R.map(r => r * .78);

const STEP = 2 * Math.PI / SECTORS;
/** Centre of a hole (the sector can have decimals to draw loose pieces). */
export const xy = (ring, sector) => [RING_R[ring] * Math.cos(sector * STEP), RING_R[ring] * Math.sin(sector * STEP)];

const f = n => +n.toFixed(4);

/**
 * SVG markup of a piece: joins between balls, balls and shine.
 * @param {number} piece
 * @param {(ring:number, d:number) => number} sectorOf  sector (with decimals) of each ball [ring, d]
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
  return (halo ? `<g class="ci-halo">${links}${circles(.022)}</g>` : '') +
    `<g class="ci-links">${links}</g><g class="ci-balls">${circles()}</g><g class="ci-shine">${shine}</g>`;
}

/** Circular mean of the sectors of a piece's balls with side m (to centre it). */
function meanSector(piece, m){
  let x = 0, y = 0;
  for (const [, d] of PIECES[piece].balls){ x += Math.cos(m * d * STEP); y += Math.sin(m * d * STEP); }
  return Math.atan2(y, x) / STEP;
}

/** Sector with decimals to draw the loose piece, pointing up (sector 12). */
export const uprightShift = (piece, m) => SECTORS * .75 - meanSector(piece, m);

/** Nearest whole pose to a rotation with decimals. */
export const nearestShift = s => ((Math.round(s) % SECTORS) + SECTORS) % SECTORS;

/** Loose SVG of a piece (tray or drag), cropped to its size. */
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
    svg: `<svg class="ci-loose ${cls}" viewBox="${f(x0 - pad)} ${f(y0 - pad)} ${f(w)} ${f(h)}" aria-hidden="true">` +
      `<g class="ci-piece ci-hue-${PIECES[piece].hue}">${pieceParts(piece, (ring, d) => m * d + s)}</g></svg>`
  };
}
