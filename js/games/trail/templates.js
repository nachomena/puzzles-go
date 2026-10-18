/* Trail's own markup: buttons under the board and help. */
import { undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfCell, hfText } from '../../ui/help-figure.js';

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

/** 3 × 3 example: the path goes through every cell and touches 1, 2 and 3 in order. */
const figure = () => {
  const path = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1], [0, 2], [1, 2], [2, 2]], nums = { 0: 1, 4: 2, 8: 3 };
  let s = '';
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) s += hfCell(x, y, 'hf-cell');
  s += `<path class="hf-path" d="M${path.map(([x, y]) => `${x + .5} ${y + .5}`).join('L')}"/>`;
  for (const [k, n] of Object.entries(nums)){ const [x, y] = path[k]; s += `<circle class="hf-dot" cx="${x + .5}" cy="${y + .5}" r=".3"/>` + hfText(x, y, n, 'hf-dotnum'); }
  return helpFigure(`<svg viewBox="0 0 3 3" width="132" aria-hidden="true">${s}</svg>`,
    t('games.trail.figure'));
};

export const help = () => t('games.trail.help', { figure: figure() });
