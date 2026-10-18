/* Marcado propio de Smart Dices: tablero con flechas, controles, bandeja de piezas y ayuda. */
import { board, iconButton } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { gestureStrip } from '../../ui/help-figure.js';

/** Puntos de cada cara (posiciones 0..8 de la rejilla 3×3), como en el reglamento. */
const FACE_DOTS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const faces = () => Object.entries(FACE_DOTS).map(([n, dots]) =>
  `<span class="sd-face" title="${n}">${[...Array(9).keys()].map(k => `<i${dots.includes(k) ? ' class="on"' : ''}></i>`).join('')}</span>`).join('');

/* Flecha de suma con forma de flecha (como en el juego original) y el número dentro.
   Filas: apunta a la izquierda, hacia el tablero; columnas: apunta hacia arriba. */
const ARROW_SHAPE = {
  rows: { box: '0 0 56 40', d: 'M3 20 L17 3 H51 a3 3 0 0 1 3 3 V34 a3 3 0 0 1 -3 3 H17 Z' },
  cols: { box: '0 0 40 56', d: 'M20 3 L37 17 V51 a3 3 0 0 1 -3 3 H6 a3 3 0 0 1 -3 -3 V17 Z' }
};
const arrow = (kind, i) =>
  `<span class="sd-arrow-slot"><span class="sd-arrow" data-arrow="${kind}-${i}">` +
  `<svg class="sd-arrow__shape" viewBox="${ARROW_SHAPE[kind].box}" aria-hidden="true"><path d="${ARROW_SHAPE[kind].d}"/></svg>` +
  `<b class="sd-arrow__num"></b></span></span>`;

/**
 * Tablero con las flechas de las filas a la derecha y las de las columnas debajo.
 * Reiniciar va abajo a la izquierda, junto a las flechas de columna (que van centradas
 * bajo cada dado, así que esa esquina siempre está libre).
 */
export const boardHtml = () =>
  `<div class="sd-area">` +
  board('board--dice') +
  `<div class="sd-arrows sd-arrows--rows">${arrow('rows', 0)}${arrow('rows', 1)}</div>` +
  `<div class="sd-arrows sd-arrows--cols">${arrow('cols', 0)}${arrow('cols', 1)}</div>` +
  `</div>`;

/** Bajo el tablero solo va la bandeja, para que las piezas se vean sin hacer scroll. */
export const controls = () =>
  `<div class="sd-tray" data-tray aria-label="${t('common.trayAria')}"></div>`;

export const help = () => t('games.smart-dices.help', {
  faces: `<div class="sd-faces" aria-hidden="true">${faces()}</div>`,
  gestures: gestureStrip([{ icon: 'drag', piece: 'dice', text: t('common.dragToBoard') }, { icon: 'turn', text: t('common.tapRotate') }])
});
