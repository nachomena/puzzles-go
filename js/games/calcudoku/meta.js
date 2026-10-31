/* Minimal Calcudoku data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'calcudoku',
  name: t('games.calcudoku.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.calcudoku.tagline'),
  icon: 'calcudoku',
  storageKey: 'puzzlesgo.calcudoku.v1',
  /** `target` is the generator level: a bigger board and more operations the higher it is. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
