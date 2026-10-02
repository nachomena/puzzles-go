/* Marcado propio del Solitario: tablero redondo, botones y ayuda. */
import { iconButton } from '../../ui/templates.js';

export const boardHtml = () =>
  `<div class="ps-area">` +
  `<div class="ps-board" data-ps-board role="application" aria-label="Tablero">` +
  `<svg class="ps-wood" viewBox="-4.5 -4.5 9 9" aria-hidden="true"></svg><div class="ps-balls"></div></div>` +
  `<div class="ps-actions">` +
  iconButton('reset', 'reset', 'Empezar de nuevo') +
  `<span class="ps-status" data-ps-status aria-live="polite"></span>` +
  `<div class="toolbar__group">${iconButton('undo', 'undo', 'Deshacer')}${iconButton('redo', 'redo', 'Rehacer')}</div>` +
  `</div></div>`;

export const controls = () =>
  `<p class="ps-tip">Toca una bola y luego el agujero al que salta, o arrástrala</p>`;

export const help = () => `
  <p>Una bola salta sobre otra vecina, en horizontal o en vertical, hasta un agujero vacío justo detrás. La bola saltada se retira y va a la ranura del borde.</p>
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
