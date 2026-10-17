/* Marcado propio del Killer Sudoku: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { svgIcon } from '../../ui/templates.js';
import { helpFigure, hfText } from '../../ui/help-figure.js';
import { cageOutline } from './board-view.js';

/** Ejemplo: una caja resuelta con cuatro jaulas (9, 7, 9 y 20). */
const figure = () => {
  const vals = [8, 1, 5, 3, 9, 2, 6, 4, 7];
  const cages = [{ cells: [0, 1], sum: 9 }, { cells: [2, 5], sum: 7 }, { cells: [3, 6], sum: 9 }, { cells: [4, 7, 8], sum: 20 }];
  let s = '<rect class="hf-cellbg" x="0" y="0" width="3" height="3"/>';
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  s += '<rect class="hf-wall" x="0" y="0" width="3" height="3"/>';
  s += `<path class="hf-cage" d="${cageOutline(cages, 3, .1)}"/>`;
  vals.forEach((v, i) => { s += hfText(i % 3, ((i / 3) | 0) + .08, v, 'hf-digit'); });
  for (const { cells, sum } of cages){
    const i = cells[0];
    s += `<text class="hf-label" x="${i % 3 + .18}" y="${((i / 3) | 0) + .36}">${sum}</text>`;
  }
  return helpFigure(`<svg viewBox="-.06 -.06 3.12 3.12" width="150" aria-hidden="true">${s}</svg>`,
    'Cada jaula suma lo que indica: 8 + 1 = 9 y 9 + 4 + 7 = 20. Dentro de una jaula no se repite ningún número.');
};

export const help = () => `
  <p>Es un Sudoku: cada <b>fila</b>, cada <b>columna</b> y cada <b>caja</b> de 3 × 3 lleva los números del 1 al 9 sin repetir.</p>
  ${figure()}
  <p>Además, el tablero está dividido en <b>jaulas</b> con borde punteado. Los números de una jaula <b>suman</b> el número pequeño de su esquina y <b>no se repiten</b> dentro de ella. Hay muy pocos números puestos al empezar: el resto se deduce de las sumas. Cada tablero tiene una única solución.</p>
  <h3>Trucos</h3>
  <ul>
    <li>Algunas sumas solo se pueden hacer de una manera: 3 en dos casillas es 1 + 2, y 17 es 8 + 9.</li>
    <li><b>Regla del 45:</b> cada fila, columna y caja suma 45. Si sabes lo que suman las jaulas que caben enteras en una caja, lo que falta hasta 45 lo suman las casillas que quedan.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> jaulas de 2 y 3 casillas; basta con las sumas y ver dónde cabe cada número.</li>
    <li><b>Difícil:</b> jaulas más grandes; hacen falta candidatos bloqueados, pares y tríos, y siempre la regla del 45 en una fila, columna o caja.</li>
    <li><b>Experto:</b> jaulas de hasta 6 casillas y la regla del 45 en varias filas, columnas o cajas a la vez.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz ${svgIcon('pencil').replace('<svg', '<svg class="inline-icon"')} anotas candidatos; la goma borra la casilla.</li>
  </ul>`;
