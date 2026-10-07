/* Configuración de Smart Hexagon. */
import meta from './meta.js';
import { SPOTS_SETTING } from '../../ui/fit-spots.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se arrastra para colocar, se toca para girar y un botón voltea. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ spots: true, timer: true });

export const SETTINGS = Object.freeze([
  SPOTS_SETTING,
  { key: 'timer', title: 'Cronómetro', desc: 'Muestra el tiempo de la partida.' }
]);
