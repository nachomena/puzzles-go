/* Configuración de Hashi. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se desliza de una isla a otra para poner puentes. */
export const TOOL = Object.freeze({ BRIDGE: 'bridge' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('games.hashi.errors'), desc: t('games.hashi.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
