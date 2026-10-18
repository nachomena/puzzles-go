/* Peg Solitaire's own markup: round board, buttons and help. */
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

/** Example: ball, ball and hole; the first jumps over its neighbour into the hole and that one is removed. */
const figure = () => {
  // the board's hole and ball (.ps-hole, .ps-ball), on a strip of the board's wood
  const defs = '<defs>' +
    '<radialGradient id="ps-hf-hole" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="#0c0c0f"/><stop offset=".7" stop-color="#141318"/><stop offset="1" stop-color="#232228"/></radialGradient>' +
    '<radialGradient id="ps-hf-ball" cx="33%" cy="27%" r="99%"><stop offset="0" stop-color="#fff"/><stop offset=".07" stop-color="#e6e5ec"/><stop offset=".24" stop-color="#b3b2bd"/><stop offset=".55" stop-color="#7a7985"/><stop offset=".85" stop-color="#45444d"/><stop offset="1" stop-color="#2c2b32"/></radialGradient>' +
    '</defs>';
  const row = (x0, balls) => `<rect class="ps-hf-wood" x="${x0 - .5}" y=".4" width="3" height="1" rx=".5"/>` +
    balls.map((b, k) => `<circle class="ps-hf-hole" cx="${x0 + k}" cy=".9" r=".27"/>` +
      (b ? `<circle class="ps-hf-ball" cx="${x0 + k}" cy=".9" r=".36"/>` : '')).join('');
  return helpFigure(`<svg viewBox="-.6 -.45 7.4 1.95" width="240" aria-hidden="true">${defs}` +
    row(0, [1, 1, 0]) +
    // the jump: from the first ball, over its neighbour, into the hole
    `<path class="ps-hf-jump" d="M.05 .4Q1 -.45 1.92 .32"/><path class="ps-hf-jump" d="M1.62 .26 1.94 .34 1.9 .02"/>` +
    `<path class="ps-hf-arrow" d="M3.05 .9H3.95M3.7 .68 3.95 .9 3.7 1.12"/>` + row(4.9, [0, 0, 1]) + `</svg>`,
    t('games.peg-solitaire.figure'));
};

export const help = () => t('games.peg-solitaire.help', { figure: figure() });
