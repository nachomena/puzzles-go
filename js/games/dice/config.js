/* Dice configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

/** Levels: they live in meta.js so the menu is drawn without loading the game. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** No tools to choose: drag to place and tap to rotate. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('settings.errors'), desc: t('games.dice.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
