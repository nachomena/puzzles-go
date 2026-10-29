/* Dice's own markup: board with arrows, controls, piece tray and help. */
import { board } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

/** Dots of each face (positions 0..8 of the 3×3 grid), as in the rules. */
const FACE_DOTS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const faces = () => Object.entries(FACE_DOTS).map(([n, dots]) =>
  `<span class="dc-face" title="${n}">${[...Array(9).keys()].map(k => `<i${dots.includes(k) ? ' class="on"' : ''}></i>`).join('')}</span>`).join('');

/* Arrow-shaped sum arrow with the number inside.
   Rows: it points left, towards the board; columns: it points up. */
const ARROW_SHAPE = {
  rows: { box: '0 0 56 40', d: 'M3 20 L17 3 H51 a3 3 0 0 1 3 3 V34 a3 3 0 0 1 -3 3 H17 Z' },
  cols: { box: '0 0 40 56', d: 'M20 3 L37 17 V51 a3 3 0 0 1 -3 3 H6 a3 3 0 0 1 -3 -3 V17 Z' }
};
const arrow = (kind, i) =>
  `<span class="dc-arrow-slot"><span class="dc-arrow" data-arrow="${kind}-${i}">` +
  `<svg class="dc-arrow__shape" viewBox="${ARROW_SHAPE[kind].box}" aria-hidden="true"><path d="${ARROW_SHAPE[kind].d}"/></svg>` +
  `<b class="dc-arrow__num"></b></span></span>`;

/**
 * Board with the row arrows on the right and the column arrows underneath.
 * Restart goes bottom left, next to the column arrows (which are centred under each die, so that corner
 * is always free).
 */
export const boardHtml = () =>
  `<div class="dc-area">` +
  board('board--dice') +
  `<div class="dc-arrows dc-arrows--rows">${arrow('rows', 0)}${arrow('rows', 1)}</div>` +
  `<div class="dc-arrows dc-arrows--cols">${arrow('cols', 0)}${arrow('cols', 1)}</div>` +
  `</div>`;

/** Under the board there is only the tray, so the pieces are visible without scrolling. */
export const controls = () =>
  `<div class="dc-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.dice.help', {
  faces: `<div class="dc-faces" aria-hidden="true">${faces()}</div>`,
  gestures: gestureStrip([{ icon: 'drag', piece: 'dice', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapRotate') }])
});
