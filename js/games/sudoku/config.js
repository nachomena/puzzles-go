/* Configuración del Sudoku. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';
import { PEN, PENCIL } from '../../core/digit-grid-controller.js';

/** Niveles: viven en meta.js para que el menú se pinte sin cargar el juego. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Herramientas: escribir el número o anotarlo como candidato. */
export const TOOL = Object.freeze({ PEN, PENCIL });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, autoNotes: true, sameDigit: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors',    title: t('settings.errors'),      desc: t('games.sudoku.errorsDesc') },
  { key: 'autoNotes', title: t('settings.cleanNotes'),  desc: t('games.sudoku.notesDesc') },
  { key: 'sameDigit', title: t('settings.sameNumbers'), desc: t('settings.sameNumbersDesc') },
  { key: 'timer',     title: t('settings.timer'),       desc: t('settings.timerDesc') }
]);
