/* Minimal Loop data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'loop',
  name: t('games.loop.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.loop.tagline'),
  icon: 'loop',
  storageKey: 'puzzlesgo.slitherlink.v1',
  /** `target` is the generator level (engine/generator.js): a bigger board and more techniques. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
