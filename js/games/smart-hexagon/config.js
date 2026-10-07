/* Configuración de Smart Hexagon. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se arrastra para colocar, se toca para girar y un botón voltea. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ spots: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'spots', title: 'Mostrar dónde cabe', desc: 'Al elegir una pieza, marca los sitios del tablero donde cabe tal como está girada. Toca uno para verla ahí y otra vez para colocarla.' },
  { key: 'timer', title: 'Cronómetro', desc: 'Muestra el tiempo de la partida.' }
]);
