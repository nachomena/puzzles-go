/* Minimal Sudoku data for the picker and the level menu: loaded without the game's engine or interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'sudoku',
  name: t('games.sudoku.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.sudoku.tagline'),
  icon: 'grid',
  storageKey: 'puzzlesgo.sudoku.v1',
  /** `target` is the logic solver level the board requires. */
  levels: difficulty({ easy: 1, hard: 2, expert: 3 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.three
});
