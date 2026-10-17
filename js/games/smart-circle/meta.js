/* Datos mínimos de Smart Circle para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'smart-circle',
  name: 'Smart Circle',
  icon: 'circle',
  storageKey: 'puzzlesgo.smartcircle.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js); dentro se muestra con su nombre corto. */
  group: 'smart',
  shortName: 'Circle',
  /** `target` es el nivel del generador; las pistas siguen el cuadernillo original. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
