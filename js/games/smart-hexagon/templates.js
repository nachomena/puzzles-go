/* Marcado propio de Smart Hexagon: tablero hexagonal, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { SPOTS_HELP } from '../../ui/fit-spots.js';

export const boardHtml = () =>
  `<div class="sh-area">` +
  `<div class="sh-board" data-sh-board role="application" aria-label="Tablero"><svg viewBox="-3.4 -2.98 6.8 5.96"></svg></div>` +
  `<div class="sh-actions">` +
  iconButton('reset', 'reset', 'Quitar todas las piezas') +
  `<button class="btn-chip" data-action="flip" aria-label="Voltear la pieza seleccionada">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>Voltear</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="sh-tray" data-tray aria-label="Piezas sin colocar"></div>` +
  `<p class="sh-tip">Arrastra para colocar · toca para elegir y otra vez para girar</p>`;

export const help = () => `
  <p>Coloca las <b>12 piezas</b> en el tablero hasta llenarlo: los trazos pasan entre las clavijas y no puede quedar ningún hueco.</p>
  <ul>
    <li>Las piezas se pueden girar y tienen dos caras: se pueden poner por cualquiera de las dos.</li>
    <li>Las piezas ya colocadas al empezar forman parte del reto: no se mueven.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Principiante</b> al <b>Experto</b> cada vez hay menos piezas colocadas al empezar: de 8 a 10 en Principiante, y solo 2 a 4 en Experto.</p>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 60°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
    <li>${SPOTS_HELP}</li>
    <li>La bombilla señala una pieza mal puesta o coloca una en su sitio. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
