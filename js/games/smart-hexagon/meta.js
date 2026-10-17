/* Datos mínimos de Smart Hexagon para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'smart-hexagon',
  name: 'Smart Hexagon',
  /** Frase corta bajo el nombre en el selector. */
  tagline: 'Trazos entre las clavijas',
  icon: 'hexagon',
  storageKey: 'puzzlesgo.smarthexagon.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js); dentro se muestra con su nombre corto. */
  group: 'smart',
  shortName: 'Hexagon',
  /** `target` es el nivel del generador (más alto = menos piezas puestas, como en el cuadernillo). */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
