/* Gears' own markup: board, buttons and help. */
import { undoRedo, svgIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure } from '../../ui/help-figure.js';
import { center, viewBox, hexPath, gear, clueText } from './art.js';

/**
 * Solved 3 × 2 example: crank (0), two gears (1 and 2) and the lock (5); slots 3 and 4 touch 2 and 3
 * gears. The directions alternate: 0, 1, 0, 1.
 */
const figure = () => {
  const w = 3, h = 2, kinds = { 0: 'crank', 1: 'player', 2: 'player', 5: 'lock' }, spin = { 0: 0, 1: 1, 2: 0, 5: 1 }, clues = { 3: 2, 4: 3 };
  let s = '';
  for (let i = 0; i < w * h; i++){ const [x, y] = center(w, i); s += `<path class="gr-sock" d="${hexPath(x, y)}"/>`; }
  for (let i = 0; i < w * h; i++){
    const [x, y] = center(w, i);
    s += kinds[i] ? gear(x, y, kinds[i], spin[i], 'on') : clueText(x, y, clues[i]);
  }
  return helpFigure(`<svg class="gr-fig" viewBox="${viewBox(w, h)}" width="190" aria-hidden="true">${s}</svg>`,
    t('games.gears.figure'));
};

export const boardHtml = () =>
  `<div class="gr-board" data-gr-board role="application" aria-label="${t('common.board')}"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">` +
  `<button class="btn-chip" data-action="turn" aria-label="${t('games.gears.turnAria')}">${svgIcon('turn')}<span>${t('games.gears.turn')}</span></button>` +
  undoRedo() + `</div>`;

export const help = () => t('games.gears.help', { figure: figure() });
