/* Minimal Kakuro data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'kakuro',
  name: t('games.kakuro.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.kakuro.tagline'),
  icon: 'kakuro',
  storageKey: 'puzzlesgo.kakuro.v1',
  /** `target` is the generator level (engine/levels.js): a bigger board and more techniques. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
