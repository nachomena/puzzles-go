/* Configuración de Star Battle. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const BOARD = Object.freeze({ size: 10, stars: 2 });

/** Niveles: viven en meta.js para que el menú se pinte sin cargar el juego. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Estado de cada casilla en la partida. TRY: estrella de prueba (cuenta como estrella, con otro fondo). */
export const MARK = Object.freeze({ EMPTY: 0, X: 1, STAR: 2, AUTO_X: 3, TRY: 4 });
export const TOOL = Object.freeze({ STAR: 'star', TRY: 'try' });

export const DEFAULT_SETTINGS = Object.freeze({ autoX: true, errors: false, timer: true, tint: false });

export const SETTINGS = Object.freeze([
  { key: 'autoX',  title: t('games.star-battle.autoX'),   desc: t('games.star-battle.autoXDesc') },
  { key: 'errors', title: t('settings.errors'),           desc: t('games.star-battle.errorsDesc') },
  { key: 'timer',  title: t('settings.timer'),            desc: t('settings.timerDesc') },
  { key: 'tint',   title: t('games.star-battle.tint'),    desc: t('games.star-battle.tintDesc') }
]);
