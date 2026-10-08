/* Marcado propio de Rush Hour: aparcamiento, contador de movimientos, deshacer y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';

export const boardHtml = () =>
  `<div class="rh-area"><div class="rh-board" data-rh-board role="application" aria-label="Aparcamiento"><div class="rh-lot"></div></div></div>`;

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Volver a empezar')}` +
  `<span class="rh-moves" data-rh-moves></span>${undoRedo()}</div>`;

export const help = () => `
  <p>Saca el <b>coche rojo</b> por la salida de la derecha. Los coches y camiones solo se mueven hacia delante o hacia atrás, en su dirección, y no pueden saltar por encima de otros.</p>
  <ul>
    <li>Arrastra un vehículo para moverlo. Cada vez que mueves uno, cuenta un movimiento, sin importar cuántas casillas avance.</li>
    <li>Debajo del tablero ves tus movimientos y el mínimo con el que se puede resolver.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Cuantos más movimientos hacen falta, más difícil: de 4 a 7 en Principiante y 30 o más en Experto.</p>
  <h3>Controles</h3>
  <ul>
    <li>Deshacer, rehacer y volver a empezar están bajo el tablero.</li>
    <li>La bombilla hace por ti el mejor movimiento posible desde donde estás. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
