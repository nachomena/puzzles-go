/* Marcado propio del Killer Sudoku: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfText } from '../../ui/help-figure.js';
import { cageOutline } from './board-view.js';

/** Ejemplo: una caja resuelta con cuatro jaulas (9, 7, 9 y 20). */
const figure = () => {
  const vals = [8, 1, 5, 3, 9, 2, 6, 4, 7];
  const cages = [{ cells: [0, 1], sum: 9 }, { cells: [2, 5], sum: 7 }, { cells: [3, 6], sum: 9 }, { cells: [4, 7, 8], sum: 20 }];
  let s = '<rect class="hf-cellbg" x="0" y="0" width="3" height="3"/>';
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  s += '<rect class="hf-wall" x="0" y="0" width="3" height="3"/>';
  s += `<path class="hf-cage" d="${cageOutline(cages, 3, .1)}"/>`;
  vals.forEach((v, i) => { s += hfText(i % 3, ((i / 3) | 0) + .08, v, 'hf-digit'); });
  for (const { cells, sum } of cages){
    const i = cells[0];
    s += `<text class="hf-label" x="${i % 3 + .18}" y="${((i / 3) | 0) + .36}">${sum}</text>`;
  }
  return helpFigure(`<svg viewBox="-.06 -.06 3.12 3.12" width="150" aria-hidden="true">${s}</svg>`,
    t('games.killer-sudoku.figure'));
};

export const help = () => t('games.killer-sudoku.help', { figure: figure(), pencil: inlineIcon('pencil') });
