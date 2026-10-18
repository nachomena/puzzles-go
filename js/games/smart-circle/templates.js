/* Marcado propio de Smart Circle: tablero redondo, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

const chip = (action, icon, text, label) =>
  `<button class="btn-chip" data-action="${action}" aria-label="${label}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${icon}"/></svg><span>${text}</span></button>`;

export const boardHtml = () =>
  `<div class="sl-area">` +
  `<div class="sl-board" data-sl-board role="application" aria-label="${t('common.board')}"><svg viewBox="-1.04 -1.04 2.08 2.08"></svg></div>` +
  `<div class="sl-actions">` +
  `<div class="sl-actions__right">` +
  chip('turn-ribs', 'turn', t('games.smart-circle.ribs'), t('games.smart-circle.ribsAria')) +
  `</div></div></div>`;

export const controls = () =>
  `<div class="sl-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.smart-circle.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'rings', text: t('common.dragToBoard') }, { icon: 'flip', text: t('common.tapFlip') }]),
  spots: t('games.smart-circle.spotsHelp')
});
