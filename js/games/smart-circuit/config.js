/* Configuración de Smart Circuit. */
import meta from './meta.js';
import { SPOTS_SETTING } from '../../ui/fit-spots.js';

export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Sin herramientas que elegir: se arrastra para colocar, se toca para girar y un botón voltea. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, spots: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Resaltar errores', desc: 'Marca en rojo los caminos que se cortan contra otra pieza o contra el borde.' },
  SPOTS_SETTING,
  { key: 'timer',  title: 'Cronómetro',       desc: 'Muestra el tiempo de la partida.' }
]);
