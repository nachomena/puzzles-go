/* Marcado propio del Sudoku: barra de herramientas, teclado numérico y ayuda. */
import { digitControls, svgIcon } from '../../ui/templates.js';

/** Barra de herramientas y teclado del 1 al 9 (ui/templates.js). */
export const controls = () => digitControls(9);

export const help = () => `
  <p>Rellena el tablero para que cada <b>fila</b>, cada <b>columna</b> y cada <b>caja</b> de 3×3 tenga los números del 1 al 9 sin repetir. Cada tablero tiene una única solución.</p>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número del teclado. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz ${svgIcon('pencil').replace('<svg', '<svg class="inline-icon"')} anotas candidatos pequeños en la casilla; toca otra vez para quitarlos.</li>
    <li>La goma borra la casilla seleccionada. En teclado físico: números, flechas, retroceso y <b>N</b> para cambiar de lápiz a número.</li>
    <li>La bombilla da una pista: señala un número equivocado o coloca el siguiente que se puede deducir. Hay una pista cada 10 minutos de juego.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> basta con ver en qué casilla cabe cada número.</li>
    <li><b>Medio:</b> hay que usar pares o tríos de candidatos y candidatos bloqueados en una caja.</li>
    <li><b>Difícil:</b> siempre necesita un <b>X-Wing</b> o un <b>Swordfish</b>: si un número solo cabe en las mismas 2 (o 3) columnas en 2 (o 3) filas, en esas columnas no puede ir en ninguna otra fila. Y lo mismo cambiando filas por columnas.</li>
  </ul>`;
