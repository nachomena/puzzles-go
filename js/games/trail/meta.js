/* Minimal Trail data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'trail',
  name: t('games.trail.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.trail.tagline'),
  icon: 'trail',
  storageKey: 'puzzlesgo.trail.v1',
  /** `target` is the generator level: a bigger board and fewer numbers the higher it is. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
