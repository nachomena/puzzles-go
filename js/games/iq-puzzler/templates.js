/* Marcado propio de Puzzler Pro: tablero de bolas, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';

export const boardHtml = () =>
  `<div class="iq-area">` +
  `<div class="iq-board" data-iq-board role="application" aria-label="Tablero"><svg></svg></div>` +
  `<div class="iq-actions">` +
  iconButton('reset', 'reset', 'Quitar todas las piezas') +
  `<button class="btn-chip" data-action="flip" aria-label="Voltear la pieza seleccionada">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>Voltear</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="iq-tray" data-tray aria-label="Piezas sin colocar"></div>` +
  `<p class="iq-tip">Arrastra para colocar · toca para elegir y otra vez para girar</p>`;

export const help = () => `
  <p>Coloca las <b>12 piezas</b> de bolas en el tablero de 11 × 5 hasta llenarlo, sin dejar ningún hueco.</p>
  <ul>
    <li>Las piezas se pueden girar y voltear.</li>
    <li>Las piezas ya colocadas al empezar forman parte del reto: no se mueven.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Principiante</b> al <b>Experto</b> cada vez hay menos piezas puestas al empezar: 9 en Principiante, 7 u 8 en Fácil, 5 o 6 en Medio, 4 en Difícil y solo 3 en Experto.</p>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 90°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
    <li>La bombilla señala una pieza mal puesta o coloca una en su sitio. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
