/* Marcado propio del Solitario: tablero redondo, botones y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="ps-area">` +
  `<div class="ps-board" data-ps-board role="application" aria-label="${t('common.board')}">` +
  `<svg class="ps-wood" viewBox="-4.5 -4.5 9 9" aria-hidden="true"></svg><div class="ps-balls"></div></div>` +
  `<div class="ps-actions">` +
  `<div class="toolbar__group">${iconButton('undo', 'undo', t('common.undo'))}${iconButton('redo', 'redo', t('common.redo'))}</div>` +
  `</div></div>`;

export const controls = () =>
  '';

/** Ejemplo: bola, bola y hueco; la primera salta a la vecina y esta se quita. */
const figure = () => {
  const row = (x0, balls) => balls.map((b, k) => `<circle class="${b ? 'hf-ball' : 'hf-hole'}" cx="${x0 + k}" cy=".9" r=".36"/>`).join('');
  return helpFigure(`<svg viewBox="-.5 0 7.6 1.4" width="230" aria-hidden="true">` +
    row(0, [1, 1, 0]) + `<path class="hf-jump" d="M0 .42Q1 -.25 2 .42"/>` +
    `<path class="hf-arrow" d="M3.05 .9H4M3.75 .68 4 .9l-.25 .22"/>` + row(5.1, [0, 0, 1]) + `</svg>`,
    t('games.peg-solitaire.figure'));
};

export const help = () => t('games.peg-solitaire.help', { figure: figure() });
