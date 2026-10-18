/* Binary's own markup: buttons under the board and help. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfCell } from '../../ui/help-figure.js';

/** Example: a row with three reds in a row (wrong) and another that is fine. */
const figure = () => {
  const row = (y, colors, ok) => `<text class="${ok ? 'hf-ok' : 'hf-no'}" x=".45" y="${y + .5}" dy=".35em" text-anchor="middle">${ok ? '✓' : '✕'}</text>` +
    colors.map((c, x) => hfCell(x + 1.1, y, c === 'r' ? 'hf-red' : 'hf-blue')).join('');
  return helpFigure(`<svg viewBox="0 0 7.1 2.2" width="220" aria-hidden="true">${row(0, [...'rrrbbb'], false)}${row(1.2, [...'rbrrbb'], true)}</svg>`,
    t('games.binary.figure'));
};

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

export const help = () => t('games.binary.help', { figure: figure() });
