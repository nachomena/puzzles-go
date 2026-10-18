/* Configuración de Smart Circle. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';
import { SPOTS_SETTING } from '../../ui/fit-spots.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se arrastra para colocar, se toca para elegir y un botón voltea. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ spots: true, timer: true });

export const SETTINGS = Object.freeze([
  SPOTS_SETTING,
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
