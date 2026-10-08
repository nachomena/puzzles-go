/* Marcado propio de KenKen: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { svgIcon } from '../../ui/templates.js';

export const help = () => `
  <p>Rellena el tablero de N × N con los números del <b>1 al N</b> sin repetir en ninguna <b>fila</b> ni <b>columna</b>.</p>
  <p>Cada <b>jaula</b> (borde grueso) indica el resultado de una operación con sus números: <b>+</b> suma, <b>×</b> multiplica, <b>−</b> resta y <b>÷</b> divide (estas dos, del mayor al menor). Una jaula de una sola casilla dice directamente su número. Dentro de una jaula se pueden repetir números si no están en la misma fila o columna.</p>
  <p>Cada tablero tiene una única solución.</p>
  <h3>Niveles</h3>
  <ul>
    <li><b>Principiante:</b> 4 × 4, solo sumas y restas.</li>
    <li><b>Fácil:</b> 5 × 5, también multiplicaciones.</li>
    <li><b>Medio:</b> 6 × 6, con las cuatro operaciones.</li>
    <li><b>Difícil:</b> 6 × 6, sin jaulas de una casilla.</li>
    <li><b>Experto:</b> 7 × 7, sin jaulas de una casilla.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz ${svgIcon('pencil').replace('<svg', '<svg class="inline-icon"')} anotas candidatos; la goma borra la casilla.</li>
    <li>La bombilla señala un número equivocado o pone uno que falta. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
