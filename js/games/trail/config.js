/* Trail configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** No tools to choose: the path is drawn by dragging. */
export const TOOL = Object.freeze({ DRAW: 'draw' });

export const DEFAULT_SETTINGS = Object.freeze({ timer: true });

export const SETTINGS = Object.freeze([
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
