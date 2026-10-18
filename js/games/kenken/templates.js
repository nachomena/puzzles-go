/* Marcado propio de KenKen: el teclado lo pone la plantilla común; aquí, la ayuda. */
import { inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure, hfText } from '../../ui/help-figure.js';

/** Ejemplo de 3 × 3 resuelto con cuatro jaulas: 6+, 1−, 2× y 2−. */
const figure = () => {
  const vals = [1, 2, 3, 3, 1, 2, 2, 3, 1], labels = { 0: '6+', 3: '1−', 4: '2×', 7: '2−' };
  let s = '<rect class="hf-cellbg" x="0" y="0" width="3" height="3"/>';
  for (let k = 1; k < 3; k++) s += `<line class="hf-grid" x1="${k}" y1="0" x2="${k}" y2="3"/><line class="hf-grid" x1="0" y1="${k}" x2="3" y2="${k}"/>`;
  // bordes de las jaulas
  s += '<path class="hf-wall" d="M0 1H3M1 1V3M1 2H3"/><rect class="hf-wall" x="0" y="0" width="3" height="3"/>';
  vals.forEach((v, i) => {
    const x = i % 3, y = (i / 3) | 0;
    s += hfText(x, y + .08, v, 'hf-digit');
    if (labels[i]) s += `<text class="hf-label" x="${x + .1}" y="${y + .26}">${labels[i]}</text>`;
  });
  return helpFigure(`<svg viewBox="-.06 -.06 3.12 3.12" width="150" aria-hidden="true">${s}</svg>`,
    t('games.kenken.figure'));
};

export const help = () => t('games.kenken.help', { figure: figure(), pencil: inlineIcon('pencil') });
