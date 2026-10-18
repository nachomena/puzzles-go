/* Fit's own markup: ball board, buttons, piece tray and help. */
import { iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="ft-area">` +
  `<div class="ft-board" data-ft-board role="application" aria-label="${t('common.board')}"><svg></svg></div>` +
  `<div class="ft-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="ft-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.fit.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'balls', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapTwiceRotate') }, { icon: 'flip', text: t('common.flip') }])
});
