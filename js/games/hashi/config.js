/* Configuración de Hashi. */
import meta from './meta.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se desliza de una isla a otra para poner puentes. */
export const TOOL = Object.freeze({ BRIDGE: 'bridge' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: 'Marcar islas con puentes de más', desc: 'En rojo las que ya tienen más puentes de los que dice su número.' },
  { key: 'timer', title: 'Cronómetro', desc: 'Muestra el tiempo de la partida.' }
]);
