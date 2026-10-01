/* Configuración del Sudoku. */
import meta from './meta.js';

/** Niveles: viven en meta.js para que el menú se pinte sin cargar el juego. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Herramientas: escribir el número o anotarlo como candidato. */
export const TOOL = Object.freeze({ PEN: 'pen', PENCIL: 'pencil' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, autoNotes: true, sameDigit: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors',    title: 'Resaltar errores',        desc: 'Los números repetidos en una fila, columna o caja se ponen rojos.' },
  { key: 'autoNotes', title: 'Limpiar notas',           desc: 'Al poner un número se borra de las notas de su fila, columna y caja.' },
  { key: 'sameDigit', title: 'Resaltar números iguales', desc: 'Marca todas las casillas con el número seleccionado.' },
  { key: 'timer',     title: 'Cronómetro',              desc: 'Muestra el tiempo de la partida.' }
]);
