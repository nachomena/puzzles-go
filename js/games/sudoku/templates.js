/* Sudoku's own markup: toolbar, number keypad and help. */
import { digitControls, inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';

/** Toolbar and keypad from 1 to 9 (ui/templates.js). */
export const controls = () => digitControls(9);

export const help = () => t('games.sudoku.help', { pencil: inlineIcon('pencil') });
