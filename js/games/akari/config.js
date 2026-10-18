/* Configuración de Akari. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: tocar alterna bombilla, marca y vacía. */
export const TOOL = Object.freeze({ TAP: 'tap' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('settings.errors'), desc: t('games.akari.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
