/* Configuración de Rush Hour. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** Sin herramientas que elegir: se arrastran los vehículos. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ timer: true });

export const SETTINGS = Object.freeze([
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
