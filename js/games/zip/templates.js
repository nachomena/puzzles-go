/* Marcado propio de Zip: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Borrar el camino')}${undoRedo()}</div>` +
  `<p class="zp-tip">Arrastra desde el 1 · vuelve atrás sobre el camino para borrar</p>`;

export const help = () => `
  <p>Dibuja <b>un solo camino</b> que pase por <b>todas las casillas</b> del tablero, una sola vez, y que toque los números <b>en orden</b>: empieza en el 1 y termina en el número más alto.</p>
  <ul>
    <li>El camino va de una casilla a otra vecina, en horizontal o en vertical (nunca en diagonal).</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Principiante</b> (5 × 5) al <b>Experto</b> (7 × 7) el tablero crece y hay menos números que te guíen.</p>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra desde el 1 para dibujar; puedes soltar y seguir desde el final.</li>
    <li>Vuelve hacia atrás sobre el camino para borrar, o toca una casilla del camino para dejarlo acabando ahí.</li>
    <li>La bombilla señala dónde se desvía el camino o lo alarga hasta el siguiente número. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
