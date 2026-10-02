/* Configuración del Solitario. */
import meta from './meta.js';
import { BOARDS } from './engine/rules.js';

export const LEVELS = meta.levels;

/** Sin herramientas: se toca una bola y luego el agujero al que salta (o se arrastra). */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ board: 'english', timer: true });

export const SETTINGS = Object.freeze([
  { key: 'board', title: 'Tablero', desc: 'Inglés: 33 agujeros en cruz. Europeo: 37, con un agujero más en cada esquina interior.',
    options: [{ value: 'english', label: `${BOARDS.english.name} (33)` }, { value: 'european', label: `${BOARDS.european.name} (37)` }] },
  { key: 'timer', title: 'Cronómetro', desc: 'Muestra el tiempo de la partida.' }
]);
