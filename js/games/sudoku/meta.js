/* Datos mínimos del Sudoku para el selector y el menú de niveles: se cargan sin el motor ni la interfaz del juego. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'sudoku',
  name: t('games.sudoku.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.sudoku.tagline'),
  icon: 'grid',
  storageKey: 'puzzlesgo.sudoku.v1',
  /** `target` es el nivel del solucionador lógico que exige el tablero. */
  levels: difficulty({ easy: 1, hard: 2, expert: 3 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.three
});
