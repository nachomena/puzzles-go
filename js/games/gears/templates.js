/* Marcado propio de Engranajes: tablero, botones y ayuda. */
import { undoRedo, svgIcon } from '../../ui/templates.js';
import { helpFigure } from '../../ui/help-figure.js';
import { center, viewBox, hexPath, gear, clueText } from './art.js';

/**
 * Ejemplo resuelto de 3 × 2: manivela (0), dos engranajes (1 y 2) y el cerrojo (5); los huecos 3 y 4
 * tocan 2 y 3 engranajes. Los sentidos se alternan: 0, 1, 0, 1.
 */
const figure = () => {
  const w = 3, h = 2, kinds = { 0: 'crank', 1: 'player', 2: 'player', 5: 'lock' }, spin = { 0: 0, 1: 1, 2: 0, 5: 1 }, clues = { 3: 2, 4: 3 };
  let s = '';
  for (let i = 0; i < w * h; i++){ const [x, y] = center(w, i); s += `<path class="gr-sock" d="${hexPath(x, y)}"/>`; }
  for (let i = 0; i < w * h; i++){
    const [x, y] = center(w, i);
    s += kinds[i] ? gear(x, y, kinds[i], spin[i], 'on') : clueText(x, y, clues[i]);
  }
  return helpFigure(`<svg class="gr-fig" viewBox="${viewBox(w, h)}" width="190" aria-hidden="true">${s}</svg>`,
    'La manivela (plateada) mueve la cadena hasta el cerrojo (verde). Cada número cuenta los engranajes que tocan su hueco.');
};

export const boardHtml = () =>
  `<div class="gr-board" data-gr-board role="application" aria-label="Tablero"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">` +
  `<button class="btn-chip" data-action="turn" aria-label="Girar la manivela">${svgIcon('turn')}<span>Girar</span></button>` +
  undoRedo() + `</div>`;

export const help = () => `
  <p>Pon <b>engranajes</b> en los huecos para que la <b>manivela</b> mueva el <b>cerrojo</b> y lo abra.</p>
  ${figure()}
  <ul>
    <li>Todos los engranajes forman <b>una sola cadena</b> con la manivela, sin piezas sueltas.</li>
    <li>La cadena no puede <b>cerrar ningún círculo</b>: un círculo de engranajes se atasca.</li>
    <li>Dos engranajes que se tocan giran en <b>sentidos contrarios</b>. La manivela gira a la derecha; las flechas dicen hacia dónde tiene que girar el cerrojo y cada engranaje que ya está puesto.</li>
    <li>Un <b>número</b> dice cuántos engranajes tocan ese hueco, que queda vacío.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 5 × 5, con más números y algunos engranajes puestos.</li>
    <li><b>Medio:</b> 6 × 6.</li>
    <li><b>Difícil:</b> 7 × 7, sin engranajes puestos.</li>
    <li><b>Experto:</b> 8 × 8, con los números justos.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca un hueco para marcarlo con un punto (aquí no va); otra vez, para poner un engranaje; otra más, para dejarlo vacío.</li>
    <li>Los engranajes unidos a la manivela se ven en latón; los sueltos, en gris. <b>Girar</b> mueve la manivela y todo lo que ya está unido a ella.</li>
  </ul>`;
