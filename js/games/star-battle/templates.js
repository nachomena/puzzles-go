/* Marcado propio de Star Battle: controles de la partida y texto de ayuda. */
import { iconButton, toolPicker, undoRedo, svgIcon } from '../../ui/templates.js';

export const controls = () =>
  `<div class="toolbar">` +
  toolPicker([
    { tool: 'star', icon: 'star', label: 'Estrellas y X' },
    { tool: 'try', icon: 'star', label: 'Estrellas de prueba' }
  ]) +
  undoRedo() +
  `</div>`;

export const help = () => `
  <p>Coloca estrellas para que cada <b>fila</b>, cada <b>columna</b> y cada <b>región</b> (zona rodeada por línea gruesa) tenga exactamente 2 estrellas.</p>
  <p>Dos estrellas nunca pueden tocarse, ni siquiera en diagonal. Todos los tableros son de 10×10 y tienen una única solución; la dificultad depende de la forma de las regiones.</p>
  <h3>Controles</h3>
  <div class="demo" aria-hidden="true">
    <div class="cell"></div>→<div class="cell cell--x">${svgIcon('x')}</div>→<div class="cell cell--star">${svgIcon('star')}</div>→<div class="cell"></div>
  </div>
  <ul>
    <li>Toca una casilla para pasar de vacía a X, de X a estrella y de estrella a vacía.</li>
    <li>Arrastra el dedo para marcar varias X seguidas.</li>
    <li>Con la herramienta de prueba ${svgIcon('star').replace('<svg', '<svg class="inline-icon inline-icon--try"')} pones <b>estrellas de prueba</b> (con fondo amarillo) para probar una suposición. Cuentan como estrellas: ponen sus X y se ponen rojas si rompen una regla. Tócala otra vez para quitarla, o tócala con la herramienta normal para dejarla como estrella.</li>
  </ul>
  <h3>Truco de inicio</h3>
  <p>Empieza por las regiones pequeñas: si una región cabe en una sola fila o columna, las estrellas de esa fila o columna ya están decididas.</p>`;
