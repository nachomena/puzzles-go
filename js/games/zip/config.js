/* Configuración de Zip. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se dibuja el camino arrastrando. */
export const TOOL = Object.freeze({ DRAW: 'draw' });

export const DEFAULT_SETTINGS = Object.freeze({ timer: true });

export const SETTINGS = Object.freeze([
  { key: 'timer', title: 'Cronómetro', desc: 'Muestra el tiempo de la partida.' }
]);
