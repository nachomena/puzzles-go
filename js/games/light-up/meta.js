/* Minimal Light Up data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'light-up',
  name: t('games.light-up.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.light-up.tagline'),
  icon: 'bulb',
  storageKey: 'puzzlesgo.light-up.v1',
  /** `target` is the generator level: a bigger board and fewer numbers the higher it is. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
