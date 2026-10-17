/* Marcado propio de Smart Hexagon: tablero hexagonal, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';
import { SPOTS_HELP } from '../../ui/fit-spots.js';
import { gestureStrip } from '../../ui/help-figure.js';

export const boardHtml = () =>
  `<div class="sh-area">` +
  `<div class="sh-board" data-sh-board role="application" aria-label="Tablero"><svg viewBox="-3.4 -2.98 6.8 5.96"></svg></div>` +
  `<div class="sh-actions">` +
  `<button class="btn-chip" data-action="flip" aria-label="Voltear la pieza seleccionada">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flip"/></svg><span>Voltear</span></button>` +
  `</div></div>`;

export const controls = () =>
  `<div class="sh-tray" data-tray aria-label="Piezas sin colocar"></div>`;

export const help = () => `
  <p>Coloca las <b>12 piezas</b> en el tablero hasta llenarlo: los trazos pasan entre las clavijas y no puede quedar ningún hueco.</p>
  <ul>
    <li>Las piezas se pueden girar y tienen dos caras: se pueden poner por cualquiera de las dos.</li>
    <li>Las piezas ya colocadas al empezar forman parte del reto: no se mueven.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Fácil</b> al <b>Experto</b> cada vez hay menos piezas colocadas al empezar.</p>
  <h3>Controles</h3>
  ${gestureStrip([{ icon: 'drag', piece: 'hexagon', text: 'Arrastra al tablero' }, { icon: 'turn', text: 'Toca dos veces: gira 60°' }, { icon: 'flip', text: 'Voltear' }])}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 60°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
    <li>${SPOTS_HELP}</li>
  </ul>`;
