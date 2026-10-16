/* Configuración de Engranajes. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: tocar alterna punto, engranaje y vacío. */
export const TOOL = Object.freeze({ TAP: 'tap' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Resaltar errores', desc: 'En rojo los números que ya tienen engranajes de más y la cadena cuando cierra un círculo.' },
  { key: 'timer',  title: 'Cronómetro',       desc: 'Muestra el tiempo de la partida.' }
]);
