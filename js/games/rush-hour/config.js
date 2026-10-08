/* Configuración de Rush Hour. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se arrastran los vehículos. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ timer: true });

export const SETTINGS = Object.freeze([
  { key: 'timer', title: 'Cronómetro', desc: 'Muestra el tiempo de la partida.' }
]);
