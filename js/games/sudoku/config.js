/* Sudoku configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';
import { PEN, PENCIL } from '../../core/digit-grid-controller.js';

/** Levels: they live in meta.js so the menu is drawn without loading the game. */
export const LEVELS = meta.levels;
export const LEVEL_ORDER = meta.levelOrder;

/** Tools: write the number or note it down as a candidate. */
export const TOOL = Object.freeze({ PEN, PENCIL });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, autoNotes: true, sameDigit: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors',    title: t('settings.errors'),      desc: t('games.sudoku.errorsDesc') },
  { key: 'autoNotes', title: t('settings.cleanNotes'),  desc: t('games.sudoku.notesDesc') },
  { key: 'sameDigit', title: t('settings.sameNumbers'), desc: t('settings.sameNumbersDesc') },
  { key: 'timer',     title: t('settings.timer'),       desc: t('settings.timerDesc') }
]);
