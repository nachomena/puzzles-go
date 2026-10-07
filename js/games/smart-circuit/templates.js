/* Marcado propio de Smart Circuit: tablero, botones, bandeja de piezas y ayuda. */
import { board, iconButton } from '../../ui/templates.js';
import { SPOTS_HELP } from '../../ui/fit-spots.js';

export const boardHtml = () =>
  `<div class="sc-area">` + board('board--circuit') +
  `<div class="sc-actions">` +
  iconButton('reset', 'reset', 'Quitar todas las piezas') +
  `<button class="btn-chip" data-action="flip" aria-label="Voltear la pieza seleccionada">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>Voltear</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="sc-tray" data-tray aria-label="Piezas sin colocar"></div>` +
  `<p class="sc-tip">Arrastra para colocar · toca para elegir y otra vez para girar</p>`;

export const help = () => `
  <p>Coloca las <b>10 piezas</b> en el tablero para unir los <b>puntos</b> por parejas con caminos: con 2 puntos hay 1 camino, con 4 hay 2 y con 6 hay 3.</p>
  <ul>
    <li>Hay que usar todas las piezas, y cada camino empieza y termina en un punto: no puede quedar ningún tramo suelto ni ningún circuito cerrado.</li>
    <li>Los puntos del reto son todos los que hay: no se pueden añadir otros.</li>
    <li>La mayoría de piezas tienen dos caras con caminos distintos; las rectas y las de dos casillas también se pueden poner por su cara lisa.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Principiante:</b> ves la forma de los caminos y algunas piezas colocadas.</li>
    <li><b>Fácil:</b> ves la silueta de todas las piezas, pero no los caminos.</li>
    <li><b>Medio:</b> ves la forma de los caminos.</li>
    <li><b>Difícil:</b> algunas piezas con punto ya están colocadas.</li>
    <li><b>Experto:</b> solo ves los puntos.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 90°. <b>Voltear</b> cambia de cara la pieza elegida.</li>
    <li>${SPOTS_HELP}</li>
    <li>La bombilla señala una pieza mal puesta o coloca una en su sitio. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
