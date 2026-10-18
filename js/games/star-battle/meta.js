/* Minimal Star Battle data for the picker and the level menu: loaded without the game's engine or interface. */
import { difficulty, LEVEL_ORDER } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'star-battle',
  name: t('games.star-battle.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.star-battle.tagline'),
  icon: 'star',
  storageKey: 'starbattlego.v2',   // legacy key: keeps saved games and statistics
  /** `target` is the logic solver level the board requires. */
  levels: difficulty({ easy: 1, hard: 2, expert: 3 }),
  levelOrder: LEVEL_ORDER
});
