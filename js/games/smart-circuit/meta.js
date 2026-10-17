/* Datos mínimos de Smart Circuit para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'smart-circuit',
  name: 'Smart Circuit',
  /** Frase corta bajo el nombre en el selector. */
  tagline: 'Caminos entre los puntos',
  icon: 'circuit',
  storageKey: 'puzzlesgo.smartcircuit.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js); dentro se muestra con su nombre corto. */
  group: 'smart',
  shortName: 'Circuit',
  /** `target` es el nivel del generador; las pistas siguen el cuadernillo original. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
