/* Bridges configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** No tools to choose: swipe from one island to another to place bridges. */
export const TOOL = Object.freeze({ BRIDGE: 'bridge' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('games.bridges.errors'), desc: t('games.bridges.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
