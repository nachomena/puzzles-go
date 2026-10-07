/* Configuración de Smart Dices. */
import meta from './meta.js';

/** Niveles: viven en meta.js para que el menú se pinte sin cargar el juego. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** No hay herramientas que elegir: se arrastra para colocar y se toca para girar. */
import { SPOTS_SETTING } from '../../ui/fit-spots.js';

export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, spots: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Resaltar errores', desc: 'Marca en rojo los dados que no forman una cara válida y las sumas que no cuadran.' },
  SPOTS_SETTING,
  { key: 'timer',  title: 'Cronómetro',       desc: 'Muestra el tiempo de la partida.' }
]);
