/* Configuración de Slitherlink. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se toca un lado o se arrastra de punto a punto. */
export const TOOL = Object.freeze({ LINE: 'line' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Resaltar errores', desc: 'En rojo los números con más líneas de las que dicen y los puntos con más de dos líneas.' },
  { key: 'timer',  title: 'Cronómetro',       desc: 'Muestra el tiempo de la partida.' }
]);
