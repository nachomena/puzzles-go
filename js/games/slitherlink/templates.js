/* Marcado propio de Slitherlink: tablero, botones y ayuda. */
import { undoRedo } from '../../ui/templates.js';
import { helpFigure } from '../../ui/help-figure.js';
import { geometry, loopOf, cluesOf } from './engine/grid.js';

/** Ejemplo de 3 × 3 resuelto: el lazo (calculado con el motor, para que cuadre con los números) y algunos números. */
const figure = () => {
  const n = 3, g = geometry(n), loop = loopOf(n, [1, 0, 1, 1, 1, 1, 0, 1, 0]), clues = cluesOf(n, loop);
  let s = '';
  for (const i of [0, 1, 4, 6, 7]) s += `<text class="hf-num" x="${i % n + .5}" y="${((i / n) | 0) + .5}" dy=".35em" text-anchor="middle">${clues[i]}</text>`;
  const xy = v => [v % (n + 1), (v / (n + 1)) | 0];
  s += loop.map((on, e) => { if (!on) return ''; const [[x1, y1], [x2, y2]] = g.edgeVerts[e].map(xy); return `<line class="hf-loop" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('');
  for (let r = 0; r <= 3; r++) for (let c = 0; c <= 3; c++) s += `<circle class="hf-dot" cx="${c}" cy="${r}" r=".07"/>`;
  return helpFigure(`<svg viewBox="-.3 -.3 3.6 3.6" width="150" aria-hidden="true">${s}</svg>`,
    'Cada número dice cuántos de sus cuatro lados son del lazo. Las casillas sin número pueden tener cualquier cantidad.');
};

export const boardHtml = () =>
  `<div class="sl-board" data-sl-board role="application" aria-label="Tablero"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

export const help = () => `
  <p>Une los puntos con un <b>único lazo cerrado</b>, en horizontal y en vertical. El lazo no se cruza ni se toca a sí mismo, y de cada punto salen 0 o 2 líneas.</p>
  ${figure()}
  <p>Cada <b>número</b> dice cuántos de los cuatro lados de su casilla son del lazo. Cada tablero tiene una única solución.</p>
  <h3>Trucos</h3>
  <ul>
    <li>Un 0 tacha sus cuatro lados. Un 3 en una esquina pone sus dos lados de la esquina.</li>
    <li>El lazo separa las casillas de dentro de las de fuera: una línea entre dos casillas es que una está dentro y la otra fuera.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 5 × 5. Basta con los números y con que de cada punto salgan 0 o 2 líneas.</li>
    <li><b>Difícil:</b> 8 × 8. Además de las esquinas y de no cerrar un lazo pequeño antes de tiempo, hay que pensar qué casillas quedan dentro y cuáles fuera.</li>
    <li><b>Experto:</b> 10 × 10, con lo mismo que el Difícil.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca un lado para poner una línea; un segundo toque lo tacha y otro lo deja vacío.</li>
    <li>Arrastra de punto a punto para dibujar varias líneas seguidas. Si empiezas sobre una línea, el arrastre las borra.</li>
  </ul>`;
