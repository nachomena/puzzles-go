/* Marcado propio del Kakuro: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { svgIcon } from '../../ui/templates.js';
import { helpFigure, hfText } from '../../ui/help-figure.js';

/** Ejemplo de 3 × 3 resuelto: dos tramos horizontales (4 y 16) y dos verticales (3 y 17). */
const figure = () => {
  // casillas: (fila, columna) en un tablero de 3 × 3; la primera fila y columna son negras
  const vals = { '1,1': 1, '1,2': 3, '2,1': 2, '2,2': 9 };
  const clues = [[0, 1, '', 3], [0, 2, '', 12], [1, 0, 4, ''], [2, 0, 11, '']];
  let s = '<rect class="hf-cellbg" x="0" y="0" width="3" height="3"/>';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!r || !c) s += `<rect class="hf-black" x="${c}" y="${r}" width="1" height="1"/>`;
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  for (const [r, c, a, d] of clues){
    s += `<line class="hf-grid" x1="${c}" y1="${r}" x2="${c + 1}" y2="${r + 1}"/>`;
    if (a) s += `<text class="hf-label" x="${c + .62}" y="${r + .36}">${a}</text>`;
    if (d) s += `<text class="hf-label" x="${c + .14}" y="${r + .86}">${d}</text>`;
  }
  for (const [k, v] of Object.entries(vals)){ const [r, c] = k.split(',').map(Number); s += hfText(c, r, v, 'hf-digit'); }
  s += '<rect class="hf-wall" x="0" y="0" width="3" height="3"/>';
  return helpFigure(`<svg viewBox="-.06 -.06 3.12 3.12" width="150" aria-hidden="true">${s}</svg>`,
    'La fila de arriba suma 4 (1 + 3) y la de abajo 11 (2 + 9); la columna de la izquierda, 3 (1 + 2), y la de la derecha, 12 (3 + 9).');
};

export const help = () => `
  <p>Rellena las casillas blancas con números del <b>1 al 9</b>. Cada <b>tramo</b> de casillas blancas seguidas, en horizontal o en vertical, suma lo que dice la casilla negra de su izquierda o de encima, y <b>no repite</b> ningún número.</p>
  ${figure()}
  <p>En cada casilla negra, el número de arriba es la suma del tramo que empieza a su derecha, y el de abajo, la del tramo que empieza debajo. Cada tablero tiene una única solución.</p>
  <h3>Trucos</h3>
  <ul>
    <li>Algunas sumas solo se hacen de una manera: 3 en dos casillas es 1 + 2, 4 es 1 + 3, 16 es 7 + 9 y 17 es 8 + 9. En tres: 6 es 1 + 2 + 3, 7 es 1 + 2 + 4, 23 es 6 + 8 + 9 y 24 es 7 + 8 + 9.</li>
    <li>Una casilla está en dos tramos: solo puede llevar un número que valga para los dos.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 6 × 6. Basta con las combinaciones de cada tramo.</li>
    <li><b>Difícil:</b> 10 × 10. Hay que cruzar lo que admite cada casilla con las combinaciones del tramo entero.</li>
    <li><b>Experto:</b> 12 × 12, con tramos de hasta 9 casillas.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla blanca y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz ${svgIcon('pencil').replace('<svg', '<svg class="inline-icon"')} anotas candidatos; la goma borra la casilla.</li>
  </ul>`;
