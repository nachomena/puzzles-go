/* Marcado propio de Zip: botones bajo el tablero y ayuda. */
import { iconButton, undoRedo } from '../../ui/templates.js';
import { helpFigure, hfCell, hfText } from '../../ui/help-figure.js';

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

/** Ejemplo de 3 × 3: el camino pasa por todas las casillas y toca 1, 2 y 3 en orden. */
const figure = () => {
  const path = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1], [0, 2], [1, 2], [2, 2]], nums = { 0: 1, 4: 2, 8: 3 };
  let s = '';
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) s += hfCell(x, y, 'hf-cell');
  s += `<path class="hf-path" d="M${path.map(([x, y]) => `${x + .5} ${y + .5}`).join('L')}"/>`;
  for (const [k, n] of Object.entries(nums)){ const [x, y] = path[k]; s += `<circle class="hf-dot" cx="${x + .5}" cy="${y + .5}" r=".3"/>` + hfText(x, y, n, 'hf-dotnum'); }
  return helpFigure(`<svg viewBox="0 0 3 3" width="132" aria-hidden="true">${s}</svg>`, 'Un solo camino por todas las casillas, pasando por el 1, el 2 y el 3 en orden.');
};

export const help = () => `
  <p>Dibuja <b>un solo camino</b> que pase por <b>todas las casillas</b> del tablero, una sola vez, y que toque los números <b>en orden</b>: empieza en el 1 y termina en el número más alto.</p>
  ${figure()}
  <ul>
    <li>El camino va de una casilla a otra vecina, en horizontal o en vertical (nunca en diagonal).</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Fácil</b> (6 × 6) al <b>Experto</b> (7 × 7) el tablero crece y hay menos números que te guíen.</p>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra desde el 1 para dibujar; puedes soltar y seguir desde el final.</li>
    <li>Vuelve hacia atrás sobre el camino para borrar, o toca una casilla del camino para dejarlo acabando ahí.</li>
  </ul>`;
