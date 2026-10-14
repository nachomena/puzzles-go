/* Marcado propio de Binario: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Vaciar el tablero')}${undoRedo()}</div>` +
  `<p class="bn-tip">Toca una casilla: rojo · azul · vacía</p>`;

export const help = () => `
  <p>Llena el tablero de <b>rojo</b> y <b>azul</b>.</p>
  <ul>
    <li>No puede haber <b>tres iguales seguidos</b> en una fila ni en una columna.</li>
    <li>Cada fila y cada columna tiene <b>tantos rojos como azules</b>.</li>
    <li><b>No hay dos filas iguales</b>, ni dos columnas iguales.</li>
    <li>Cada reto tiene una sola solución y se resuelve sin adivinar.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla para ponerla roja; otra vez, azul; otra más, vacía. Las que vienen dadas (con un punto) no se pueden cambiar.</li>
    <li>La bombilla señala un error o pone una casilla que se puede deducir, y te dice por qué. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
