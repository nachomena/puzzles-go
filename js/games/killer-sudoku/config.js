/* Killer Sudoku configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';
import { PEN, PENCIL } from '../../core/digit-grid-controller.js';

export const LEVELS = meta.levels;

/** Tools: write the number or note it down as a candidate. */
export const TOOL = Object.freeze({ PEN, PENCIL });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, autoNotes: true, sameDigit: true, timer: true, tint: false });

export const SETTINGS = Object.freeze([
  { key: 'errors',    title: t('settings.errors'),      desc: t('games.killer-sudoku.errorsDesc') },
  { key: 'autoNotes', title: t('settings.cleanNotes'),  desc: t('games.killer-sudoku.notesDesc') },
  { key: 'sameDigit', title: t('settings.sameNumbers'), desc: t('settings.sameNumbersDesc') },
  { key: 'tint',      title: t('games.killer-sudoku.tint'),          desc: t('games.killer-sudoku.tintDesc') },
  { key: 'timer',     title: t('settings.timer'),       desc: t('settings.timerDesc') }
]);
