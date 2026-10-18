/* Gridlock's own markup: car park, move counter, undo and help. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfCell } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="gl-area"><div class="gl-board" data-gl-board role="application" aria-label="${t('games.gridlock.boardAria')}"><div class="gl-lot"></div></div></div>`;

export const controls = () =>
  `<div class="toolbar"><span class="gl-moves" data-gl-moves></span>${undoRedo()}</div>`;

/**
 * A vehicle like the game's (.gl-car): a block of colour with its darker roof at the front (right if
 * horizontal, bottom if vertical), measured on the short side.
 */
const car = (x, y, w, h, hue) => {
  const k = Math.min(w, h), m = .22 * k, d = .34 * k, f = v => +v.toFixed(3);
  const roof = w > h ? [x + w - m - d, y + m, d, h - 2 * m] : [x + m, y + h - m - d, w - 2 * m, d];
  return `<g class="gl-hue-${hue}"><rect class="gl-hf-car" x="${x}" y="${y}" width="${w}" height="${h}" rx=".18"/>` +
    `<rect class="gl-hf-roof" x="${f(roof[0])}" y="${f(roof[1])}" width="${f(roof[2])}" height="${f(roof[3])}" rx=".09"/></g>`;
};

/** Example: a car blocks the way; moving it down, the red one reaches the exit. */
const figure = () => {
  let s = '<rect class="gl-hf-lot" x="-.15" y="-.15" width="4.45" height="4.3" rx=".3"/>';
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) s += hfCell(x, y, 'hf-cell');
  s += car(.1, 1.1, 1.8, .8, 'red') + car(2.1, 1.1, .8, 1.8, 'blue') +
    `<path class="gl-hf-move" d="M2.5 4.3V4.7M2.3 4.5l.2 .22.2 -.22"/>` +
    `<path class="gl-hf-exit" d="M4.08 1.3 4.28 1.5 4.08 1.7z"/>`;
  return helpFigure(`<svg viewBox="-.2 -.2 4.55 5" width="160" aria-hidden="true">${s}</svg>`,
    t('games.gridlock.figure'));
};

export const help = () => t('games.gridlock.help', { figure: figure() });
