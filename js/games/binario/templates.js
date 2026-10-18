/* Marcado propio de Binario: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfCell } from '../../ui/help-figure.js';

/** Ejemplo: una fila con tres rojos seguidos (mal) y otra bien. */
const figure = () => {
  const row = (y, colors, ok) => `<text class="${ok ? 'hf-ok' : 'hf-no'}" x=".45" y="${y + .5}" dy=".35em" text-anchor="middle">${ok ? '✓' : '✕'}</text>` +
    colors.map((c, x) => hfCell(x + 1.1, y, c === 'r' ? 'hf-red' : 'hf-blue')).join('');
  return helpFigure(`<svg viewBox="0 0 7.1 2.2" width="220" aria-hidden="true">${row(0, [...'rrrbbb'], false)}${row(1.2, [...'rbrrbb'], true)}</svg>`,
    t('games.binario.figure'));
};

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

export const help = () => t('games.binario.help', { figure: figure() });
