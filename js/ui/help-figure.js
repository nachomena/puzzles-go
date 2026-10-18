/* Small figure for a game's help: a drawn example (SVG) with a line explaining it.
   The colours come from the .hf-* classes (css/overlays.css), the same as the game's. */

/** Figure markup: `svg` is the drawing and `caption` what it shows. */
export const helpFigure = (svg, caption) =>
  `<figure class="help-fig">${svg}<figcaption>${caption}</figcaption></figure>`;

/** A square cell of side 1 at (x, y), with a small gap: for example grids. */
export const hfCell = (x, y, cls) => `<rect class="${cls}" x="${x + .04}" y="${y + .04}" width=".92" height=".92" rx=".1"/>`;

/**
 * A board like the games' (.board): cell background, rounded corners and a thin frame, with `inner` (grid,
 * walls, numbers…) clipped to it. `id` names its clip path (one per figure).
 */
export const hfBoard = (id, w, h, inner, r = .34) =>
  `<clipPath id="${id}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>` +
  `<g clip-path="url(#${id})"><rect class="hf-cellbg" width="${w}" height="${h}"/>${inner}</g>` +
  `<rect class="hf-frame" width="${w}" height="${h}" rx="${r}"/>`;

/** The thin grid of a w × h board. */
export const hfGrid = (w, h) => {
  let s = '';
  for (let x = 1; x < w; x++) s += `<line class="hf-grid" x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 1; y < h; y++) s += `<line class="hf-grid" x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  return s;
};

/** Text centred in cell (x, y). */
export const hfText = (x, y, text, cls = 'hf-num') => `<text class="${cls}" x="${x + .5}" y="${y + .5}" dy=".35em" text-anchor="middle">${text}</text>`;

/* Drawings of the piece games' gestures (in units of 24, like the icons). */

/** Each game's piece, in the left half of the drag drawing. */
const PIECES = {
  squares: '<path d="M3 4h4.5v10h5v4.5H3z"/><path d="M3 9h4.5M3 14h4.5M7.5 14v4.5"/>',
  balls: '<circle cx="5.5" cy="6" r="2.3"/><circle cx="5.5" cy="11" r="2.3"/><circle cx="5.5" cy="16" r="2.3"/><circle cx="10.5" cy="16" r="2.3"/>',
  circuit: '<rect x="2.5" y="6" width="11" height="11" rx="2"/><path d="M2.5 11.5h4a3 3 0 0 1 3 3V17"/>',
  hexagon: '<path d="M5.60 5.10L8.28 6.65L8.28 9.75L5.60 11.30L2.92 9.75L2.92 6.65ZM8.28 9.75L10.97 11.30L10.97 14.40L8.28 15.95L5.60 14.40L5.60 11.30Z"/>',
  dice: '<rect x="2.5" y="6" width="11" height="11" rx="2"/><circle cx="5.5" cy="9" r=".9"/><circle cx="8" cy="11.5" r=".9"/><circle cx="10.5" cy="14" r=".9"/>',
  rings: '<circle cx="5" cy="15.5" r="2.8"/><circle cx="9.5" cy="10" r="2.1"/><circle cx="12.6" cy="5.6" r="1.4"/>'
};
const ARROW = '<path d="M15.5 11.5h6M19 9l2.5 2.5L19 14"/>';

const GESTURE_ART = {
  // rotate: a square piece with a quarter-turn arrow over its corner
  turn: '<rect x="3.5" y="9" width="10.5" height="10.5" rx="1.5"/><path d="M12.5 4.5a7.5 7.5 0 0 1 7 7"/><path d="M17.3 9.8l2.2 1.9 1.9-2.2"/>',
  flip: '<path d="M12 3v18M8.5 7.5L4 12l4.5 4.5zM15.5 7.5L20 12l-4.5 4.5z"/>'
};

/**
 * Gesture strip for the piece games: a drawing and a word per gesture. The drag one ('drag') draws
 * the game's piece: `piece` is a key of PIECES.
 * @param {{ icon: 'drag'|'turn'|'flip', text: string, piece?: string }[]} items
 */
export const gestureStrip = items =>
  `<div class="help-gestures" aria-hidden="true">` +
  items.map(({ icon, text, piece = 'squares' }) => `<div><svg viewBox="0 0 24 24">${icon === 'drag' ? PIECES[piece] + ARROW : GESTURE_ART[icon]}</svg><span>${text}</span></div>`).join('') +
  `</div>`;
