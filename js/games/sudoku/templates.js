/* Marcado propio del Sudoku: barra de herramientas, teclado numérico y ayuda. */
import { digitControls, inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';

/** Barra de herramientas y teclado del 1 al 9 (ui/templates.js). */
export const controls = () => digitControls(9);

export const help = () => t('games.sudoku.help', { pencil: inlineIcon('pencil') });
