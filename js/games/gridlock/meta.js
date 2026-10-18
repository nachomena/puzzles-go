/* Minimal Gridlock data for the picker and the level menu: loaded without the engine or the interface. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';
import { levelSummary } from '../../core/stats.js';

export default Object.freeze({
  id: 'gridlock',
  name: t('games.gridlock.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.gridlock.tagline'),
  icon: 'car',
  storageKey: 'puzzlesgo.rushhour.v1',
  /** `target` is the generator level: higher = more moves to get the red car out. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Old levels, to move records and games (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five,
  /** Under each level, the best time and the game with the fewest moves. */
  levelMeta: (L, stats) => [levelSummary(stats[L]), stats[L]?.bestMoves ? t('games.gridlock.bestMoves', { n: stats[L].bestMoves }) : ''].filter(Boolean).join(' · ')
});
