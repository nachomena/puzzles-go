/* Datos mínimos del Kakuro para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'kakuro',
  name: 'Kakuro',
  icon: 'kakuro',
  storageKey: 'puzzlesgo.kakuro.v1',
  /** `target` es el nivel del generador (engine/levels.js): tablero más grande y más técnicas. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
