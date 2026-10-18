/* Marcado propio de Smart Hexagon: tablero hexagonal, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { SPOTS_HELP } from '../../ui/fit-spots.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="sh-area">` +
  `<div class="sh-board" data-sh-board role="application" aria-label="${t('common.board')}"><svg viewBox="-3.4 -2.98 6.8 5.96"></svg></div>` +
  `<div class="sh-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="sh-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.smart-hexagon.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'hexagon', text: t('common.dragToBoard') }, { icon: 'turn', text: t('games.smart-hexagon.tapTwiceRotate') }, { icon: 'flip', text: t('common.flip') }]),
  spots: SPOTS_HELP
});
