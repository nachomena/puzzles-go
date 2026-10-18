/* Marcado propio de Katamino: tablero con listón, botones, bandeja de piezas y ayuda. */
import { board, iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="km-area">` + board('board--katamino') +
  `<div class="km-slider" aria-hidden="true"></div>` +
  `<div class="km-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="km-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.katamino.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'squares', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapTwiceRotate') }, { icon: 'flip', text: t('common.flip') }])
});
