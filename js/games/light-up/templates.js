/* Light Up's own markup: buttons under the board and help. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfCell, hfText } from '../../ui/help-figure.js';

/** Example: a bulb lights its row and column up to a black cell; the 1 has it next to it. */
const figure = () => {
  const lit = new Set(['0,0', '2,0', '3,0']), black = { '1,1': '1', '3,1': '' };
  let s = '';
  for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++){
    const k = `${x},${y}`;
    if (k in black){ s += hfCell(x, y, 'hf-black') + (black[k] ? hfText(x, y, black[k]) : ''); continue; }
    s += hfCell(x, y, k === '1,0' || lit.has(k) ? 'hf-lit' : 'hf-cell');
  }
  s += `<circle class="hf-bulb" cx="1.5" cy=".5" r=".28"/>`;
  return helpFigure(`<svg viewBox="0 0 4 3" width="168" aria-hidden="true">${s}</svg>`,
    t('games.light-up.figure'));
};

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

export const help = () => t('games.light-up.help', { figure: figure() });
