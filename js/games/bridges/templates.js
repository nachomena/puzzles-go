/* Bridges' own markup: board, buttons and help. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure } from '../../ui/help-figure.js';

/** Example: three islands with their bridges (one single and one double) adding up to what each one says. */
const figure = () => {
  const isle = (x, y, n) => `<g class="hf-isle"><circle cx="${x}" cy="${y}" r=".42"/><text x="${x}" y="${y}" dy=".35em" text-anchor="middle">${n}</text></g>`;
  const line = (x1, y1, x2, y2) => `<line class="hf-bridge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  return helpFigure(`<svg viewBox="0 0 4.6 3.4" width="170" aria-hidden="true">` +
    line(.7, .7, 3.9, .7) + line(3.77, .7, 3.77, 2.7) + line(4.03, .7, 4.03, 2.7) +
    isle(.7, .7, 1) + isle(3.9, .7, 3) + isle(3.9, 2.7, 2) + `</svg>`,
    t('games.bridges.figure'));
};

export const boardHtml = () =>
  `<div class="br-board" data-br-board role="application" aria-label="${t('games.bridges.boardAria')}"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

export const help = () => t('games.bridges.help', { figure: figure() });
