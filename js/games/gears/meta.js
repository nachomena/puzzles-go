/* Minimal Gears data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'gears',
  name: t('games.gears.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.gears.tagline'),
  icon: 'gears',
  storageKey: 'puzzlesgo.gears.v1',
  /** `target` is the generator level (engine/generator.js): a bigger panel and fewer clues. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
