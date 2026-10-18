/* Marcado propio del Kakuro: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfText } from '../../ui/help-figure.js';

/** Ejemplo de 3 × 3 resuelto: dos tramos horizontales (4 y 16) y dos verticales (3 y 17). */
const figure = () => {
  // casillas: (fila, columna) en un tablero de 3 × 3; la primera fila y columna son negras
  const vals = { '1,1': 1, '1,2': 3, '2,1': 2, '2,2': 9 };
  const clues = [[0, 1, '', 3], [0, 2, '', 12], [1, 0, 4, ''], [2, 0, 11, '']];
  let s = '<rect class="hf-cellbg" x="0" y="0" width="3" height="3"/>';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!r || !c) s += `<rect class="hf-black" x="${c}" y="${r}" width="1" height="1"/>`;
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  for (const [r, c, a, d] of clues){
    s += `<line class="hf-grid" x1="${c}" y1="${r}" x2="${c + 1}" y2="${r + 1}"/>`;
    if (a) s += `<text class="hf-label" x="${c + .62}" y="${r + .36}">${a}</text>`;
    if (d) s += `<text class="hf-label" x="${c + .14}" y="${r + .86}">${d}</text>`;
  }
  for (const [k, v] of Object.entries(vals)){ const [r, c] = k.split(',').map(Number); s += hfText(c, r, v, 'hf-digit'); }
  s += '<rect class="hf-wall" x="0" y="0" width="3" height="3"/>';
  return helpFigure(`<svg viewBox="-.06 -.06 3.12 3.12" width="150" aria-hidden="true">${s}</svg>`,
    t('games.kakuro.figure'));
};

export const help = () => t('games.kakuro.help', { figure: figure(), pencil: inlineIcon('pencil') });
