/* Marcado propio de Katamino: tablero con listón, botones, bandeja de piezas y ayuda. */
import { board, iconButton } from '../../ui/templates.js';

export const boardHtml = () =>
  `<div class="km-area">` + board('board--katamino') +
  `<div class="km-slider" aria-hidden="true"></div>` +
  `<div class="km-actions">` +
  iconButton('reset', 'reset', 'Quitar todas las piezas') +
  `<button class="btn-chip" data-action="flip" aria-label="Voltear la pieza seleccionada">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>Voltear</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="km-tray" data-tray aria-label="Piezas sin colocar"></div>` +
  `<p class="km-tip">Arrastra para colocar · toca para elegir y otra vez para girar</p>`;

export const help = () => `
  <p>Un <b>PENTA</b> es un reto: llenar el tablero con las piezas que te da, sin dejar huecos. En el PENTA 5 hay que cubrir 5 filas con 5 piezas; en el PENTA 8, 8 filas con 8 piezas.</p>
  <ul>
    <li>Todas las piezas son pentominós (de 5 casillas) y se pueden girar y voltear.</li>
    <li>Un PENTA puede tener varias soluciones: vale cualquiera.</li>
  </ul>
  <h3>Desafíos</h3>
  <p>Cada desafío tiene varias filas (A, B, C…). En cada fila empiezas con unas pocas piezas y, al resolver un PENTA, el siguiente añade una pieza nueva y una fila más de tablero. Tus piezas se quedan donde estaban: puedes reacomodarlas. Del <b>Pequeño Slam</b> al <b>Desafío</b>, cada vez es más difícil.</p>
  <p>Puedes jugar cualquier PENTA desde la tabla. Los que has resuelto quedan marcados y la partida a medias se guarda para continuarla.</p>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 90°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
    <li>La bombilla señala una pieza que impide terminar o coloca una más. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
