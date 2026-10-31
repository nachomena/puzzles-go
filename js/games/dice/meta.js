/* Minimal Dice data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'dice',
  name: t('games.dice.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.dice.tagline'),
  icon: 'dice',
  storageKey: 'puzzlesgo.dice.v1',
  /** Picker group (see ui/hub-view.js). */
  group: 'pieces',
  /** `target` is the generator level (higher = fewer clues). */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
