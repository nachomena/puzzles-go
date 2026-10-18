/* Circle's own markup: round board, buttons, piece tray and help. */
import { iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

const chip = (action, icon, text, label) =>
  `<button class="btn-chip" data-action="${action}" aria-label="${label}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${icon}"/></svg><span>${text}</span></button>`;

export const boardHtml = () =>
  `<div class="ci-area">` +
  `<div class="ci-board" data-ci-board role="application" aria-label="${t('common.board')}"><svg viewBox="-1.04 -1.04 2.08 2.08"></svg></div>` +
  `<div class="ci-actions">` +
  `<div class="ci-actions__right">` +
  chip('turn-ribs', 'turn', t('games.circle.ribs'), t('games.circle.ribsAria')) +
  `</div></div></div>`;

export const controls = () =>
  `<div class="ci-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.circle.help', {
  gestures: gestureStrip([{ icon: 'drag', piece: 'rings', text: t('common.dragToBoard') }, { icon: 'flip', text: t('common.tapFlip') }]),
  spots: t('games.circle.spotsHelp')
});
