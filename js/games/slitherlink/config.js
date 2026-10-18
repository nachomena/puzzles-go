/* Configuración de Slitherlink. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se toca un lado o se arrastra de punto a punto. */
export const TOOL = Object.freeze({ LINE: 'line' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('settings.errors'), desc: t('games.slitherlink.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
