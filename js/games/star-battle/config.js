/* Star Battle configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const BOARD = Object.freeze({ size: 10, stars: 2 });

/** Levels: they live in meta.js so the menu is drawn without loading the game. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** State of each cell during the game. TRY: trial star (counts as a star, with another look). */
export const MARK = Object.freeze({ EMPTY: 0, X: 1, STAR: 2, AUTO_X: 3, TRY: 4 });
export const TOOL = Object.freeze({ STAR: 'star', TRY: 'try' });

export const DEFAULT_SETTINGS = Object.freeze({ autoX: true, errors: false, timer: true, tint: false });

export const SETTINGS = Object.freeze([
  { key: 'autoX',  title: t('games.star-battle.autoX'),   desc: t('games.star-battle.autoXDesc') },
  { key: 'errors', title: t('settings.errors'),           desc: t('games.star-battle.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'),            desc: t('settings.timerDesc') },
  { key: 'tint',   title: t('games.star-battle.tint'),    desc: t('games.star-battle.tintDesc') }
]);
