/* Marcado propio de Rush Hour: aparcamiento, contador de movimientos, deshacer y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { helpFigure, hfCell } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="rh-area"><div class="rh-board" data-rh-board role="application" aria-label="Aparcamiento"><div class="rh-lot"></div></div></div>`;

export const controls = () =>
  `<div class="toolbar"><span class="rh-moves" data-rh-moves></span>${undoRedo()}</div>`;

/** Ejemplo: un coche tapa el paso; al bajarlo, el rojo llega a la salida. */
const figure = () => {
  let s = '';
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) s += hfCell(x, y, 'hf-cell');
  s += `<rect class="hf-car-red" x=".1" y="1.1" width="1.8" height=".8" rx=".18"/>` +
    `<rect class="hf-car" x="2.1" y="1.1" width=".8" height="1.8" rx=".18"/>` +
    `<path class="hf-move" d="M2.5 4.15V4.55M2.3 4.35l.2 .22.2 -.22"/>` +
    `<path class="hf-exit" d="M4.15 1.2 4.5 1.5 4.15 1.8"/>`;
  return helpFigure(`<svg viewBox="0 0 4.7 4.75" width="160" aria-hidden="true">${s}</svg>`,
    'Cada vehículo se mueve solo en su dirección. Baja el coche azul y el rojo llega a la salida.');
};

export const help = () => `
  <p>Saca el <b>coche rojo</b> por la salida de la derecha. Los coches y camiones solo se mueven hacia delante o hacia atrás, en su dirección, y no pueden saltar por encima de otros.</p>
  ${figure()}
  <ul>
    <li>Arrastra un vehículo para moverlo. Cada vez que mueves uno, cuenta un movimiento, sin importar cuántas casillas avance.</li>
    <li>Debajo del tablero ves tus movimientos y el mínimo con el que se puede resolver.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Cuantos más movimientos hacen falta, más difícil: de 4 a 7 en Principiante y 30 o más en Experto.</p>
  <h3>Controles</h3>
  <ul>
    <li>Deshacer, rehacer y volver a empezar están bajo el tablero.</li>
  </ul>`;
