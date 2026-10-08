/* Configuración de Akari. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: tocar alterna bombilla, marca y vacía. */
export const TOOL = Object.freeze({ TAP: 'tap' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Resaltar errores', desc: 'En rojo las bombillas que se ven entre sí y los números con bombillas de más.' },
  { key: 'timer',  title: 'Cronómetro',       desc: 'Muestra el tiempo de la partida.' }
]);
