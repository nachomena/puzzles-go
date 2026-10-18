/* Killer Sudoku's own markup: the shared template provides the keypad; here, the help. */
import { inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfBoard, hfGrid, hfText } from '../../ui/help-figure.js';
import { cageOutline } from './board-view.js';

/** Example: a solved box with four cages (9, 7, 9 and 20), drawn like the board. */
const figure = () => {
  const vals = [8, 1, 5, 3, 9, 2, 6, 4, 7];
  const cages = [{ cells: [0, 1], sum: 9 }, { cells: [2, 5], sum: 7 }, { cells: [3, 6], sum: 9 }, { cells: [4, 7, 8], sum: 20 }];
  let s = hfGrid(3, 3) + `<path class="ks-cage" d="${cageOutline(cages, 3)}"/>`;
  vals.forEach((v, i) => { s += hfText(i % 3, ((i / 3) | 0) + .08, v, 'hf-digit'); });
  // the sum on the dotted line's corner, on its cell's background (like .ks-sum); further in at the rounded corner
  for (const { cells: [i], sum } of cages){
    const x = i % 3 + (i ? .05 : .15), y = ((i / 3) | 0) + (i ? .05 : .14), w = .08 + String(sum).length * .12;
    s += `<rect class="hf-cellbg" x="${x}" y="${y}" width="${w}" height=".25"/><text class="ks-hf-sum" x="${x + .04}" y="${y + .2}">${sum}</text>`;
  }
  return helpFigure(`<svg viewBox="-.04 -.04 3.08 3.08" width="150" aria-hidden="true">${hfBoard('ks-hf', 3, 3, s)}</svg>`,
    t('games.killer-sudoku.figure'));
};

export const help = () => t('games.killer-sudoku.help', { figure: figure(), pencil: inlineIcon('pencil') });
