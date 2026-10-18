/* Configuración de Smart Dices. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

/** Niveles: viven en meta.js para que el menú se pinte sin cargar el juego. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** No hay herramientas que elegir: se arrastra para colocar y se toca para girar. */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors', title: t('settings.errors'), desc: t('games.smart-dices.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
