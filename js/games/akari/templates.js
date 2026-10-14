/* Marcado propio de Akari: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { helpFigure, hfCell, hfText } from '../../ui/help-figure.js';

/** Ejemplo: una bombilla ilumina su fila y su columna hasta una negra; el 1 la tiene al lado. */
const figure = () => {
  const lit = new Set(['0,0', '2,0', '3,0']), black = { '1,1': '1', '3,1': '' };
  let s = '';
  for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++){
    const k = `${x},${y}`;
    if (k in black){ s += hfCell(x, y, 'hf-black') + (black[k] ? hfText(x, y, black[k]) : ''); continue; }
    s += hfCell(x, y, k === '1,0' || lit.has(k) ? 'hf-lit' : 'hf-cell');
  }
  s += `<circle class="hf-bulb" cx="1.5" cy=".5" r=".28"/>`;
  return helpFigure(`<svg viewBox="0 0 4 3" width="168" aria-hidden="true">${s}</svg>`,
    'La bombilla ilumina su fila y su columna hasta una casilla negra. El 1 tiene justo una bombilla al lado.');
};

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Vaciar el tablero')}${undoRedo()}</div>` +
  `<p class="ak-tip">Toca una casilla: marca · bombilla · vacía</p>`;

export const help = () => `
  <p>Pon <b>bombillas</b> en las casillas blancas hasta que <b>todas queden iluminadas</b>.</p>
  ${figure()}
  <ul>
    <li>Una bombilla ilumina su fila y su columna hasta que una casilla negra corta la luz.</li>
    <li>Dos bombillas no pueden alumbrarse entre sí.</li>
    <li>Un número en una casilla negra dice cuántas bombillas tiene justo al lado (arriba, abajo, izquierda y derecha). Las negras sin número pueden tener cualquier cantidad.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla para marcarla con un punto (aquí no va); otra vez, para poner una bombilla; otra más, para dejarla vacía.</li>
  </ul>`;
