/* Marcado propio de Hashi: tablero, botones y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';

export const boardHtml = () =>
  `<div class="hs-board" data-hs-board role="application" aria-label="Islas"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">${iconButton('reset', 'reset', 'Quitar todos los puentes')}${undoRedo()}</div>` +
  `<p class="hs-tip">Desliza de una isla a otra para poner un puente · otra vez para el segundo, y otra para quitarlos</p>`;

export const help = () => `
  <p>Une todas las <b>islas</b> con <b>puentes</b>. El número de cada isla dice cuántos puentes salen de ella.</p>
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
    <li>La bombilla señala un puente que sobra o pone uno que falta. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;
