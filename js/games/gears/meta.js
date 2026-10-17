/* Datos mínimos de Engranajes para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'gears',
  name: 'Engranajes',
  icon: 'gears',
  storageKey: 'puzzlesgo.gears.v1',
  /** `target` es el nivel del generador (engine/generator.js): panel más grande y menos pistas. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
