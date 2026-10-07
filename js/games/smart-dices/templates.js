/* Marcado propio de Smart Dices: tablero con flechas, controles, bandeja de piezas y ayuda. */
import { board, iconButton } from '../../ui/templates.js';
import { SPOTS_HELP } from '../../ui/fit-spots.js';

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
  iconButton('reset', 'reset', 'Quitar todas las piezas', { cls: 'icon-btn sd-reset' }) +
  `</div>`;

/** Bajo el tablero solo va la bandeja, para que las piezas se vean sin hacer scroll. */
export const controls = () =>
  `<div class="sd-tray" data-tray aria-label="Piezas sin colocar"></div>` +
  `<p class="sd-tip">Arrastra para colocar · toca para girar</p>`;

export const help = () => `
  <p>Coloca las 12 piezas en el tablero para que cada una de las <b>4 casillas</b> muestre una <b>cara de dado</b> válida, en cualquier orientación.</p>
  <p>Una flecha junto a una fila o columna indica cuánto deben <b>sumar los dos dados</b> de esa fila o columna. Las piezas que ya vienen colocadas (en gris) no se pueden mover; las que pones tú se ven resaltadas. Cada reto tiene una única solución.</p>
  <div class="sd-faces" aria-hidden="true">${faces()}</div>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero para colocarla.</li>
    <li>Toca una pieza para girarla 90°, en la bandeja o en el tablero.</li>
    <li>${SPOTS_HELP}</li>
    <li>Arrastra una pieza fuera del tablero para devolverla a la bandeja.</li>
    <li>La bombilla coloca una pieza en su sitio. Hay una pista cada 10 minutos de juego.</li>
  </ul>
  <h3>Truco de inicio</h3>
  <p>Los puntos suman siempre 12 entre los 4 dados. Si una fila suma 9, la otra suma 3.</p>`;
