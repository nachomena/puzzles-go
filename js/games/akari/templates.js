/* Marcado propio de Akari: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Vaciar el tablero')}${undoRedo()}</div>` +
  `<p class="ak-tip">Toca una casilla: marca · bombilla · vacía</p>`;

export const help = () => `
  <p>Pon <b>bombillas</b> en las casillas blancas hasta que <b>todas queden iluminadas</b>.</p>
  <ul>
    <li>Una bombilla ilumina su fila y su columna hasta que una casilla negra corta la luz.</li>
    <li>Dos bombillas no pueden alumbrarse entre sí.</li>
    <li>Un número en una casilla negra dice cuántas bombillas tiene justo al lado (arriba, abajo, izquierda y derecha). Las negras sin número pueden tener cualquier cantidad.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla para marcarla con un punto (aquí no va); otra vez, para poner una bombilla; otra más, para dejarla vacía.</li>
    <li>La bombilla de abajo señala un error o pone una bombilla que falta. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
