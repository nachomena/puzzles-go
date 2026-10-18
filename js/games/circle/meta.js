/* Minimal Circle data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'circle',
  name: t('games.circle.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.circle.tagline'),
  icon: 'circle',
  storageKey: 'puzzlesgo.smartcircle.v1',
  /** Picker group (see ui/hub-view.js). */
  group: 'pieces',
  /** `target` is the generator level; the clues follow the original booklet. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
