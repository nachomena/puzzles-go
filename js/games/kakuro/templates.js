/* Kakuro's own markup: the shared template provides the keypad; here, the help. */
import { inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfBoard, hfText } from '../../ui/help-figure.js';

/** A solved 3 × 3 example: two across runs (4 and 16) and two down runs (3 and 17). */
const figure = () => {
  // cells: (row, column) on a 3 × 3 board; the first row and column are black
  const vals = { '1,1': 1, '1,2': 3, '2,1': 2, '2,2': 9 };
  const clues = [[0, 1, '', 3], [0, 2, '', 12], [1, 0, 4, ''], [2, 0, 11, '']];
  let s = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!r || !c) s += `<rect class="hf-black" x="${c}" y="${r}" width="1" height="1"/>`;
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  for (const [r, c, a, d] of clues){
    s += `<line class="hf-grid" x1="${c}" y1="${r}" x2="${c + 1}" y2="${r + 1}"/>`;
    if (a) s += `<text class="hf-label" x="${c + .62}" y="${r + .36}">${a}</text>`;
    if (d) s += `<text class="hf-label" x="${c + .14}" y="${r + .86}">${d}</text>`;
  }
  for (const [k, v] of Object.entries(vals)){ const [r, c] = k.split(',').map(Number); s += hfText(c, r, v, 'hf-digit'); }
  return helpFigure(`<svg viewBox="-.04 -.04 3.08 3.08" width="150" aria-hidden="true">${hfBoard('kr-hf', 3, 3, s)}</svg>`,
    t('games.kakuro.figure'));
};

export const help = () => t('games.kakuro.help', { figure: figure(), pencil: inlineIcon('pencil') });
