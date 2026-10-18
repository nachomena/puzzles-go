/* Pentominoes' own markup: board with slider, buttons, piece tray and help. */
import { board, iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="pt-area">` + board('board--pentominoes') +
  `<div class="pt-slider" aria-hidden="true"></div>` +
  `<div class="pt-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="${t('common.flipAria')}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>${t('common.flip')}</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="pt-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.pentominoes.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'squares', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapTwiceRotate') }, { icon: 'flip', text: t('common.flip') }])
});
