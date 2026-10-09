/* Dibujo de una pieza de Puzzler Pro en SVG (unidades = casillas): bolas de color unidas, con
   brillo, como las de Smart Circle. */
import { PIECES, orient } from './engine/pieces.js';

const BALL = .42, LINK = .46;

/**
 * Contenido de una pieza en unidades de casilla (0..w, 0..h) con cara m y giro r.
 * `halo`: contorno claro de la pieza elegida (bajo las bolas: solo asoma por fuera).
 */
export function pieceParts(piece, m, r, { halo = false } = {}){
  const { cells } = orient(piece, m, r), has = new Set(cells.map(c => c.join()));
  let links = '';
  for (const [x, y] of cells){
    if (has.has(`${x + 1},${y}`)) links += `<line x1="${x + .5}" y1="${y + .5}" x2="${x + 1.5}" y2="${y + .5}"/>`;
    if (has.has(`${x},${y + 1}`)) links += `<line x1="${x + .5}" y1="${y + .5}" x2="${x + .5}" y2="${y + 1.5}"/>`;
  }
  const balls = r => cells.map(([x, y]) => `<circle cx="${x + .5}" cy="${y + .5}" r="${r}"/>`).join('');
  const shine = cells.map(([x, y]) => `<circle cx="${x + .38}" cy="${y + .36}" r=".16"/>`).join('');
  return `<g class="iq-hue-${PIECES[piece].hue}">` +
    (halo ? `<g class="iq-halo" style="stroke-width:${LINK + .14}">${links}${balls(BALL + .07)}</g>` : '') +
    `<g class="iq-links" style="stroke-width:${LINK}">${links}</g><g class="iq-balls">${balls(BALL)}</g>` +
    `<g class="iq-shine">${shine}</g></g>`;
}

/** SVG suelto de una pieza, para la bandeja y el arrastre (con el degradado del brillo). */
export function pieceSvg(piece, m, r){
  const o = orient(piece, m, r);
  return `<svg class="iq-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${pieceParts(piece, m, r)}</svg>`;
}
