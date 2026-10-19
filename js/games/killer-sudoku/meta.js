/* Minimal Killer Sudoku data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'killer-sudoku',
  name: t('games.killer-sudoku.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.killer-sudoku.tagline'),
  icon: 'killer',
  storageKey: 'puzzlesgo.killersudoku.v1',
  /** `target` is the logic solver level the board requires (see engine/logic-solver.js). */
  levels: difficulty({ easy: 1, hard: 2, expert: 3 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
