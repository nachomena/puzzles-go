/* Drawing of a Fit piece in SVG (units = cells): joined coloured balls, with shine, like Circle's. */
import { PIECES, orient } from './engine/pieces.js';

const BALL = .42, LINK = .46;

/**
 * Content of a piece in cell units (0..w, 0..h) with side m and rotation r.
 * `halo`: light outline of the picked piece (under the balls: it only shows outside).
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
  return `<g class="ft-hue-${PIECES[piece].hue}">` +
    (halo ? `<g class="ft-halo" style="stroke-width:${LINK + .14}">${links}${balls(BALL + .07)}</g>` : '') +
    `<g class="ft-links" style="stroke-width:${LINK}">${links}</g><g class="ft-balls">${balls(BALL)}</g>` +
    `<g class="ft-shine">${shine}</g></g>`;
}

/** Loose SVG of a piece, for the tray and the drag (with the shine gradient). */
export function pieceSvg(piece, m, r){
  const o = orient(piece, m, r);
  return `<svg class="ft-piece__svg" viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${pieceParts(piece, m, r)}</svg>`;
}
