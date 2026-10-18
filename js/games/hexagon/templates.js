/* Hexagon's own markup: hexagonal board, buttons, piece tray and help. */
import { t } from '../../i18n/index.js';
import { SPOTS_HELP } from '../../ui/fit-spots.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="hx-area">` +
  `<div class="hx-board" data-hx-board role="application" aria-label="${t('common.board')}"><svg viewBox="-3.4 -2.98 6.8 5.96"></svg></div>` +
  `<div class="hx-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="hx-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.hexagon.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'hexagon', text: t('common.dragToBoard') }, { icon: 'turn', text: t('games.hexagon.tapTwiceRotate') }, { icon: 'flip', text: t('common.flip') }]),
  spots: SPOTS_HELP
});
