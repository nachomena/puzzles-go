/* Configuración de Star Battle. */
import meta from './meta.js';

export const BOARD = Object.freeze({ size: 10, stars: 2 });

/** Niveles: viven en meta.js para que el menú se pinte sin cargar el juego. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Estado de cada casilla en la partida. TRY: estrella de prueba (cuenta como estrella, con otro fondo). */
export const MARK = Object.freeze({ EMPTY: 0, X: 1, STAR: 2, AUTO_X: 3, TRY: 4 });
export const TOOL = Object.freeze({ STAR: 'star', TRY: 'try' });

export const DEFAULT_SETTINGS = Object.freeze({ autoX: true, errors: false, timer: true, tint: false });

export const SETTINGS = Object.freeze([
  { key: 'autoX',  title: 'X automáticas',     desc: 'Pone X alrededor de cada estrella que colocas.' },
  { key: 'errors', title: 'Resaltar errores',  desc: 'Las estrellas que rompen una regla se ponen rojas.' },
  { key: 'timer',  title: 'Cronómetro',        desc: 'Muestra el tiempo de la partida.' },
  { key: 'tint',   title: 'Colorear regiones', desc: 'Tiñe cada región con un tono distinto.' }
]);
