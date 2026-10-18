/* Marcado propio de Puzzler Pro: tablero de bolas, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="iq-area">` +
  `<div class="iq-board" data-iq-board role="application" aria-label="${t('common.board')}"><svg></svg></div>` +
  `<div class="iq-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="iq-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.iq-puzzler.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'balls', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapTwiceRotate') }, { icon: 'flip', text: t('common.flip') }])
});
