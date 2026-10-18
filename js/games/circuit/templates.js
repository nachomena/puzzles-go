/* Circuit's own markup: board, buttons, piece tray and help. */
import { board, iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="ct-area">` + board('board--circuit') +
  `<div class="ct-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="ct-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.circuit.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'circuit', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapTwiceRotate') }, { icon: 'flip', text: t('common.flipFace') }])
});
