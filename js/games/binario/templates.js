/* Marcado propio de Binario: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { helpFigure, hfCell } from '../../ui/help-figure.js';

/** Ejemplo: una fila con tres rojos seguidos (mal) y otra bien. */
const figure = () => {
  const row = (y, colors, ok) => `<text class="${ok ? 'hf-ok' : 'hf-no'}" x=".45" y="${y + .5}" dy=".35em" text-anchor="middle">${ok ? '✓' : '✕'}</text>` +
    colors.map((c, x) => hfCell(x + 1.1, y, c === 'r' ? 'hf-red' : 'hf-blue')).join('');
  return helpFigure(`<svg viewBox="0 0 7.1 2.2" width="220" aria-hidden="true">${row(0, [...'rrrbbb'], false)}${row(1.2, [...'rbrrbb'], true)}</svg>`,
    'Arriba hay tres rojos seguidos. Abajo no, y hay tantos rojos como azules.');
};

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Vaciar el tablero')}${undoRedo()}</div>` +
  `<p class="bn-tip">Toca una casilla: rojo · azul · vacía</p>`;

export const help = () => `
  <p>Llena el tablero de <b>rojo</b> y <b>azul</b>.</p>
  ${figure()}
  <ul>
    <li>No puede haber <b>tres iguales seguidos</b> en una fila ni en una columna.</li>
    <li>Cada fila y cada columna tiene <b>tantos rojos como azules</b>.</li>
    <li><b>No hay dos filas iguales</b>, ni dos columnas iguales.</li>
    <li>Cada reto tiene una sola solución y se resuelve sin adivinar.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla para ponerla roja; otra vez, azul; otra más, vacía. Las que vienen dadas (con un punto) no se pueden cambiar.</li>
  </ul>`;
