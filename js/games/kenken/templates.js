/* Marcado propio de KenKen: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { svgIcon } from '../../ui/templates.js';
import { helpFigure, hfText } from '../../ui/help-figure.js';

/** Ejemplo de 3 × 3 resuelto con cuatro jaulas: 6+, 1−, 2× y 2−. */
const figure = () => {
  const vals = [1, 2, 3, 3, 1, 2, 2, 3, 1], labels = { 0: '6+', 3: '1−', 4: '2×', 7: '2−' };
  let s = '<rect class="hf-cellbg" x="0" y="0" width="3" height="3"/>';
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  // bordes de las jaulas
  s += '<path class="hf-wall" d="M0 1H3M1 1V3M1 2H3"/><rect class="hf-wall" x="0" y="0" width="3" height="3"/>';
  vals.forEach((v, i) => {
    const x = i % 3, y = (i / 3) | 0;
    s += hfText(x, y + .08, v, 'hf-digit');
    if (labels[i]) s += `<text class="hf-label" x="${x + .1}" y="${y + .26}">${labels[i]}</text>`;
  });
  return helpFigure(`<svg viewBox="-.06 -.06 3.12 3.12" width="150" aria-hidden="true">${s}</svg>`,
    'En la jaula 6+, 1 + 2 + 3 = 6; en la 2×, 1 × 2 = 2. Ningún número se repite en su fila ni en su columna.');
};

export const help = () => `
  <p>Rellena el tablero de N × N con los números del <b>1 al N</b> sin repetir en ninguna <b>fila</b> ni <b>columna</b>.</p>
  ${figure()}
  <p>Cada <b>jaula</b> (borde grueso) indica el resultado de una operación con sus números: <b>+</b> suma, <b>×</b> multiplica, <b>−</b> resta y <b>÷</b> divide (estas dos, del mayor al menor). Una jaula de una sola casilla dice directamente su número. Dentro de una jaula se pueden repetir números si no están en la misma fila o columna.</p>
  <p>Cada tablero tiene una única solución.</p>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 5 × 5, con sumas, restas y multiplicaciones.</li>
    <li><b>Difícil:</b> 6 × 6, con las cuatro operaciones y sin jaulas de una casilla.</li>
    <li><b>Experto:</b> 7 × 7, sin jaulas de una casilla.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz ${svgIcon('pencil').replace('<svg', '<svg class="inline-icon"')} anotas candidatos; la goma borra la casilla.</li>
  </ul>`;
