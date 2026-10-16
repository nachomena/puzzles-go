/* Dibujo de Engranajes en SVG (lo usan el tablero y la figura de la ayuda). Hexágonos con punta arriba, de
   radio 1; las filas impares, media casilla a la derecha. */

export const SQ3 = Math.sqrt(3);

/** Centro del hueco i en un panel de w columnas. */
export const center = (w, i) => { const r = (i / w) | 0, c = i % w; return [SQ3 * (c + .5 + (r & 1) * .5), 1 + r * 1.5]; };

/** viewBox de un panel de w × h, con un poco de margen. */
export const viewBox = (w, h) => `-.1 -.1 ${(SQ3 * (w + .5) + .2).toFixed(3)} ${1.5 * h + .7}`;

const f = v => v.toFixed(3);

/** Hexágono de radio r centrado en (x, y). */
export function hexPath(x, y, r = .97){
  let d = '';
  for (let k = 0; k < 6; k++){ const a = Math.PI / 180 * (60 * k - 30); d += `${k ? 'L' : 'M'}${f(x + r * Math.cos(a))} ${f(y + r * Math.sin(a))}`; }
  return d + 'Z';
}

/** Contorno de un engranaje de radio r con n dientes, centrado en el origen. */
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
 * Flecha curva de giro en la mitad de arriba, alrededor del eje: 0 = a la derecha (como la manivela, de
 * izquierda a derecha por arriba), 1 = a la izquierda. Un arco y una punta triangular en su extremo.
 */
function arrow(dir){
  const r = .44, deg = Math.PI / 180, a0 = (dir ? -35 : -145) * deg, a1 = (dir ? -145 : -35) * deg, s = dir ? -1 : 1;
  const [x0, y0] = [r * Math.cos(a0), r * Math.sin(a0)], [x1, y1] = [r * Math.cos(a1), r * Math.sin(a1)];
  // dirección de avance (tangente) y hacia fuera (radio) en el extremo
  const tx = -Math.sin(a1) * s, ty = Math.cos(a1) * s, nx = Math.cos(a1), ny = Math.sin(a1);
  const tip = [x1 + tx * .17, y1 + ty * .17], b1 = [x1 - tx * .03 + nx * .15, y1 - ty * .03 + ny * .15], b2 = [x1 - tx * .03 - nx * .15, y1 - ty * .03 - ny * .15];
  return `<path class="gr-arrow" d="M${f(x0)} ${f(y0)}A${r} ${r} 0 0 ${dir ? 0 : 1} ${f(x1)} ${f(y1)}"/>` +
    `<path class="gr-arrow-head" d="M${f(tip[0])} ${f(tip[1])}L${f(b1[0])} ${f(b1[1])}L${f(b2[0])} ${f(b2[1])}Z"/>`;
}

/** Candado pequeño del cerrojo, bajo la flecha. */
const PADLOCK = `<g class="gr-pad" transform="translate(0 .2) scale(.75)"><rect x="-.2" y="-.04" width=".4" height=".32" rx=".06"/>` +
  `<path class="gr-shackle" d="M-.13 -.04v-.12a.13 .13 0 0 1 .26 0v.12"/></g>`;

/**
 * Un engranaje en (x, y). kind: 'crank' (manivela), 'lock' (cerrojo), 'fixed' (puesto, con flecha) o
 * 'player'. `dir` es el sentido de su flecha; `cls`, clases extra (on, jam, cw/ccw para girar).
 */
export function gear(x, y, kind, dir = 0, cls = ''){
  const body = `<path class="gr-teeth" d="${TEETH[kind === 'crank' || kind === 'lock' ? 12 : 10]}"/>` + (kind === 'lock' ? '' : '<circle class="gr-hub" r=".17"/>');
  const extra = kind === 'player' ? '' : arrow(dir) + (kind === 'lock' ? PADLOCK : '');
  return `<g transform="translate(${f(x)} ${f(y)})"><g class="gr-gear gr-${kind}${cls ? ' ' + cls : ''}"><g class="gr-rot">${body}</g>${extra}</g></g>`;
}

/** Número de un hueco. */
export const clueText = (x, y, n, cls = '') => `<text class="gr-num${cls}" x="${f(x)}" y="${f(y)}" dy=".26">${n}</text>`;
