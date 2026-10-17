/* Datos mínimos del Killer Sudoku para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'killer-sudoku',
  name: 'Killer Sudoku',
  icon: 'killer',
  storageKey: 'puzzlesgo.killersudoku.v1',
  /** `target` es el nivel del solucionador lógico que exige el tablero (ver engine/logic-solver.js). */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
