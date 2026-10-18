/* Gears drawing in SVG (used by the board and the help figure). Pointy-top hexagons of radius 1; odd
   rows half a cell to the right. */

export const SQ3 = Math.sqrt(3);

/** Centre of slot i on a panel of w columns. */
export const center = (w, i) => { const r = (i / w) | 0, c = i % w; return [SQ3 * (c + .5 + (r & 1) * .5), 1 + r * 1.5]; };

/** viewBox of a w × h panel, with a little margin. */
export const viewBox = (w, h) => `-.1 -.1 ${(SQ3 * (w + .5) + .2).toFixed(3)} ${1.5 * h + .7}`;

const f = v => v.toFixed(3);

/** Hexagon of radius r centred on (x, y). */
export function hexPath(x, y, r = .97){
  let d = '';
  for (let k = 0; k < 6; k++){ const a = Math.PI / 180 * (60 * k - 30); d += `${k ? 'L' : 'M'}${f(x + r * Math.cos(a))} ${f(y + r * Math.sin(a))}`; }
  return d + 'Z';
}

/** Outline of a gear of radius r with n teeth, centred on the origin. */
function teeth(r, n){
  let d = '';
  for (let k = 0; k < n * 2; k++){
    const a0 = k / (n * 2) * Math.PI * 2, a1 = (k + 1) / (n * 2) * Math.PI * 2, rr = k % 2 ? r * .8 : r;
    d += `${k ? 'L' : 'M'}${f(rr * Math.cos(a0))} ${f(rr * Math.sin(a0))}L${f(rr * Math.cos(a1))} ${f(rr * Math.sin(a1))}`;
  }
  return d + 'Z';
}
const TEETH = { 10: teeth(.86, 10), 12: teeth(.86, 12) };

/**
 * Curved turn arrow in the top half, around the axle: 0 = clockwise (like the crank, left to right over
 * the top), 1 = anticlockwise. An arc and a triangular tip at its end.
 */
function arrow(dir){
  const r = .44, deg = Math.PI / 180, a0 = (dir ? -35 : -145) * deg, a1 = (dir ? -145 : -35) * deg, s = dir ? -1 : 1;
  const [x0, y0] = [r * Math.cos(a0), r * Math.sin(a0)], [x1, y1] = [r * Math.cos(a1), r * Math.sin(a1)];
  // direction of travel (tangent) and outwards (radius) at the end
  const tx = -Math.sin(a1) * s, ty = Math.cos(a1) * s, nx = Math.cos(a1), ny = Math.sin(a1);
  const tip = [x1 + tx * .17, y1 + ty * .17], b1 = [x1 - tx * .03 + nx * .15, y1 - ty * .03 + ny * .15], b2 = [x1 - tx * .03 - nx * .15, y1 - ty * .03 - ny * .15];
  return `<path class="gr-arrow" d="M${f(x0)} ${f(y0)}A${r} ${r} 0 0 ${dir ? 0 : 1} ${f(x1)} ${f(y1)}"/>` +
    `<path class="gr-arrow-head" d="M${f(tip[0])} ${f(tip[1])}L${f(b1[0])} ${f(b1[1])}L${f(b2[0])} ${f(b2[1])}Z"/>`;
}

/** The lock's small padlock, under the arrow. */
const PADLOCK = `<g class="gr-pad" transform="translate(0 .2) scale(.75)"><rect x="-.2" y="-.04" width=".4" height=".32" rx=".06"/>` +
  `<path class="gr-shackle" d="M-.13 -.04v-.12a.13 .13 0 0 1 .26 0v.12"/></g>`;

/**
 * A gear at (x, y). kind: 'crank', 'lock', 'fixed' (placed, with an arrow) or 'player'. `dir` is the
 * direction of its arrow; `cls`, extra classes (on, jam, cw/ccw to turn).
 */
export function gear(x, y, kind, dir = 0, cls = ''){
  const body = `<path class="gr-teeth" d="${TEETH[kind === 'crank' || kind === 'lock' ? 12 : 10]}"/>` + (kind === 'lock' ? '' : '<circle class="gr-hub" r=".17"/>');
  const extra = kind === 'player' ? '' : arrow(dir) + (kind === 'lock' ? PADLOCK : '');
  return `<g transform="translate(${f(x)} ${f(y)})"><g class="gr-gear gr-${kind}${cls ? ' ' + cls : ''}"><g class="gr-rot">${body}</g>${extra}</g></g>`;
}

/** A slot's number. */
export const clueText = (x, y, n, cls = '') => `<text class="gr-num${cls}" x="${f(x)}" y="${f(y)}" dy=".26">${n}</text>`;
