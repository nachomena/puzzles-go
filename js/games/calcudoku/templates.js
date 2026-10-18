/* Calcudoku's own markup: the shared template provides the keypad; here, the help. */
import { inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfBoard, hfGrid, hfText } from '../../ui/help-figure.js';

/** A solved 3 × 3 example with four cages (6+, 1−, 2× and 2−), drawn like the board. */
const figure = () => {
  const vals = [1, 2, 3, 3, 1, 2, 2, 3, 1], labels = { 0: '6+', 3: '1−', 4: '2×', 7: '2−' };
  // grid and cage borders
  let s = hfGrid(3, 3) + '<path class="hf-wall" d="M0 1H3M1 1V3M1 2H3"/>';
  vals.forEach((v, i) => {
    const x = i % 3, y = (i / 3) | 0;
    s += hfText(x, y + .1, v, 'hf-digit');
    // the operation tucked into the corner (like .cc-label); further in at the rounded corner
    if (labels[i]) s += `<text class="cc-hf-label" x="${x + (i ? .08 : .15)}" y="${y + (i ? .26 : .3)}">${labels[i]}</text>`;
  });
  return helpFigure(`<svg viewBox="-.04 -.04 3.08 3.08" width="150" aria-hidden="true">${hfBoard('cc-hf', 3, 3, s)}</svg>`,
    t('games.calcudoku.figure'));
};

export const help = () => t('games.calcudoku.help', { figure: figure(), pencil: inlineIcon('pencil') });
