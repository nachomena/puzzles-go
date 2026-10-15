/* Marcado propio del Solitario: tablero redondo, botones y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { helpFigure } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="ps-area">` +
  `<div class="ps-board" data-ps-board role="application" aria-label="Tablero">` +
  `<svg class="ps-wood" viewBox="-4.5 -4.5 9 9" aria-hidden="true"></svg><div class="ps-balls"></div></div>` +
  `<div class="ps-actions">` +
  `<div class="toolbar__group">${iconButton('undo', 'undo', 'Deshacer')}${iconButton('redo', 'redo', 'Rehacer')}</div>` +
  `</div></div>`;

export const controls = () =>
  '';

/** Ejemplo: bola, bola y hueco; la primera salta a la vecina y esta se quita. */
const figure = () => {
  const row = (x0, balls) => balls.map((b, k) => `<circle class="${b ? 'hf-ball' : 'hf-hole'}" cx="${x0 + k}" cy=".9" r=".36"/>`).join('');
  return helpFigure(`<svg viewBox="-.5 0 7.6 1.4" width="230" aria-hidden="true">` +
    row(0, [1, 1, 0]) + `<path class="hf-jump" d="M0 .42Q1 -.25 2 .42"/>` +
    `<path class="hf-arrow" d="M3.05 .9H4M3.75 .68 4 .9l-.25 .22"/>` + row(5.1, [0, 0, 1]) + `</svg>`,
    'Salta sobre la bola de al lado hasta el hueco; la bola saltada se quita.');
};

export const help = () => `
  <p>Una bola salta sobre otra vecina, en horizontal o en vertical, hasta un agujero vacío justo detrás. La bola saltada se retira y va a la ranura del borde.</p>
  ${figure()}
  <ul>
    <li>El objetivo es dejar <b>una sola bola</b>. Lo ideal es que quede en el centro.</li>
    <li>No se salta en diagonal ni sobre más de una bola.</li>
    <li>La partida termina cuando ya no queda ningún salto posible.</li>
  </ul>
  <h3>Tableros</h3>
  <ul>
    <li><b>Inglés</b> (33 agujeros): se empieza con el centro vacío.</li>
    <li><b>Europeo</b> (37 agujeros): tiene un agujero más en cada esquina interior. Con el centro vacío no se puede terminar con una sola bola, así que se empieza con el de encima vacío.</li>
  </ul>
  <p>El tablero se cambia en Ajustes y se usa en la siguiente partida.</p>
  <h3>Controles</h3>
  <ul>
    <li>Toca una bola para elegirla: se marcan los agujeros a los que puede saltar. Toca uno para saltar, o arrastra la bola hasta él.</li>
    <li>Puedes deshacer y rehacer los saltos.</li>
  </ul>`;
