/* Loop's own markup: board, buttons and help. */
import { undoRedo } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';
import { helpFigure } from '../../ui/help-figure.js';
import { geometry, loopOf, cluesOf } from './engine/grid.js';

/** Solved 3 × 3 example: the loop (computed with the engine, so it matches the numbers) and some numbers. */
const figure = () => {
  const n = 3, g = geometry(n), loop = loopOf(n, [1, 0, 1, 1, 1, 1, 0, 1, 0]), clues = cluesOf(n, loop);
  let s = '';
  for (const i of [0, 1, 4, 6, 7]) s += `<text class="hf-num" x="${i % n + .5}" y="${((i / n) | 0) + .5}" dy=".35em" text-anchor="middle">${clues[i]}</text>`;
  const xy = v => [v % (n + 1), (v / (n + 1)) | 0];
  s += loop.map((on, e) => { if (!on) return ''; const [[x1, y1], [x2, y2]] = g.edgeVerts[e].map(xy); return `<line class="hf-loop" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('');
  for (let r = 0; r <= 3; r++) for (let c = 0; c <= 3; c++) s += `<circle class="hf-dot" cx="${c}" cy="${r}" r=".07"/>`;
  return helpFigure(`<svg viewBox="-.3 -.3 3.6 3.6" width="150" aria-hidden="true">${s}</svg>`,
    t('games.loop.figure'));
};

export const boardHtml = () =>
  `<div class="lp-board" data-lp-board role="application" aria-label="${t('common.board')}"><svg></svg></div>`;

export const controls = () =>
  `<div class="toolbar">${undoRedo()}</div>`;

export const help = () => t('games.loop.help', { figure: figure() });
