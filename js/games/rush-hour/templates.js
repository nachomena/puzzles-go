/* Marcado propio de Rush Hour: aparcamiento, contador de movimientos, deshacer y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfCell } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="rh-area"><div class="rh-board" data-rh-board role="application" aria-label="${t('games.rush-hour.boardAria')}"><div class="rh-lot"></div></div></div>`;

export const controls = () =>
  `<div class="toolbar"><span class="rh-moves" data-rh-moves></span>${undoRedo()}</div>`;

/** Ejemplo: un coche tapa el paso; al bajarlo, el rojo llega a la salida. */
const figure = () => {
  let s = '';
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) s += hfCell(x, y, 'hf-cell');
  s += `<rect class="hf-car-red" x=".1" y="1.1" width="1.8" height=".8" rx=".18"/>` +
    `<rect class="hf-car" x="2.1" y="1.1" width=".8" height="1.8" rx=".18"/>` +
    `<path class="hf-move" d="M2.5 4.15V4.55M2.3 4.35l.2 .22.2 -.22"/>` +
    `<path class="hf-exit" d="M4.15 1.2 4.5 1.5 4.15 1.8"/>`;
  return helpFigure(`<svg viewBox="0 0 4.7 4.75" width="160" aria-hidden="true">${s}</svg>`,
    t('games.rush-hour.figure'));
};

export const help = () => t('games.rush-hour.help', { figure: figure() });
