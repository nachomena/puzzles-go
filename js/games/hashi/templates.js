/* Marcado propio de Hashi: tablero, botones y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { helpFigure } from '../../ui/help-figure.js';

/** Ejemplo: tres islas con sus puentes (uno sencillo y uno doble) que suman lo que dice cada una. */
const figure = () => {
  const isle = (x, y, n) => `<g class="hf-isle"><circle cx="${x}" cy="${y}" r=".42"/><text x="${x}" y="${y}" dy=".35em" text-anchor="middle">${n}</text></g>`;
  const line = (x1, y1, x2, y2) => `<line class="hf-bridge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  return helpFigure(`<svg viewBox="0 0 4.6 3.4" width="170" aria-hidden="true">` +
    line(.7, .7, 3.9, .7) + line(3.77, .7, 3.77, 2.7) + line(4.03, .7, 4.03, 2.7) +
    isle(.7, .7, 1) + isle(3.9, .7, 3) + isle(3.9, 2.7, 2) + `</svg>`,
    'Cada número dice cuántos puentes salen de la isla: 1, 1 + 2 = 3 y 2.');
};

export const boardHtml = () =>
  `<div class="hs-board" data-hs-board role="application" aria-label="Islas"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Quitar todos los puentes')}${undoRedo()}</div>` +
  `<p class="hs-tip">Desliza de una isla a otra para poner un puente · otra vez para el segundo, y otra para quitarlos</p>`;

export const help = () => `
  <p>Une todas las <b>islas</b> con <b>puentes</b>. El número de cada isla dice cuántos puentes salen de ella.</p>
  ${figure()}
  <ul>
    <li>Los puentes van en línea recta, en horizontal o en vertical, entre dos islas.</li>
    <li>Entre dos islas puede haber uno o dos puentes, como mucho.</li>
    <li>Los puentes no se pueden cruzar ni pasar por encima de una isla.</li>
    <li>Al final, desde cualquier isla se tiene que poder llegar a todas las demás.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Desliza desde una isla hacia la de al lado, o toca el hueco entre las dos, para poner un puente. Repite para el segundo; una tercera vez los quita.</li>
    <li>Toca dos veces seguidas una isla para quitar todos sus puentes.</li>
    <li>Las islas que ya tienen todos sus puentes se ven más apagadas.</li>
  </ul>`;
