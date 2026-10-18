/* Configuración de Smart Circuit. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Sin herramientas que elegir: se arrastra para colocar, se toca para girar y un botón voltea. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('settings.errors'), desc: t('games.smart-circuit.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
