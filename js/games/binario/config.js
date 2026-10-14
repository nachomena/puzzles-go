/* Configuración de Binario. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: tocar alterna rojo, azul y vacía. */
export const TOOL = Object.freeze({ TAP: 'tap' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Resaltar errores', desc: 'Raya las casillas que rompen una regla: tres iguales seguidos, más de la mitad de un color en una línea o dos líneas iguales.' },
  { key: 'timer',  title: 'Cronómetro',       desc: 'Muestra el tiempo de la partida.' }
]);
