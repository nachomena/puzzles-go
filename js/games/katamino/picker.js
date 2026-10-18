/* Tabla de retos de un desafío: una fila por línea con sus piezas de partida y una casilla por reto
   (con la pieza que añade). Los resueltos se marcan. */
import { blocksOf } from './engine/sets.js';
import { pieceIcon } from './piece-svg.js';
import meta, { pentaKey, solvedIn } from './meta.js';
import { t } from '../../i18n/index.js';

/**
 * @param {string} L  desafío
 * @param {{ stats: object, cur: object|null }} data  de Store#menuData
 */
export function renderPicker(L, { stats, cur }){
  const blocks = blocksOf(L);
  const head = `<p class="km-pick__count">${t('games.katamino.solvedOf', { a: solvedIn(L, stats), n: meta.levels[L].total })}</p>`;
  return head + blocks.map(b => {
    const base = b.from - 1, cols = b.to - b.from + 1;
    const nums = Array.from({ length: cols }, (_, k) => `<span class="km-pick__num">${b.from + k}</span>`).join('');
    const rows = b.rows.map(row => {
      const icons = row.pieces.slice(0, base).map(p => `<span class="km-pick__base">${pieceIcon(p)}</span>`).join('');
      const cells = Array.from({ length: cols }, (_, k) => {
        const n = b.from + k, st = stats[pentaKey(L, row.label, n)];
        const isCur = cur && cur.L === L && cur.p.label === row.label && cur.p.n === n;
        const cls = (st?.solved ? ' is-done' : '') + (isCur ? ' is-current' : '');
        return `<button class="km-pick__cell${cls}" data-action="pick-puzzle" data-row="${row.label}" data-n="${n}" ` +
          `aria-label="${t('games.katamino.cellAria', { row: row.label, n })}${st?.solved ? t('games.katamino.cellSolved') : ''}">${pieceIcon(row.pieces[n - 1])}</button>`;
      }).join('');
      return `<div class="km-pick__row"><b class="km-pick__label">${row.label}</b>${icons}${cells}</div>`;
    }).join('');
    return `<div class="km-pick" style="--base:${base};--cols:${cols}">` +
      `<div class="km-pick__row km-pick__head"><span></span><span class="km-pick__penta">${t('games.katamino.piecesHead')}</span>${nums}</div>${rows}</div>`;
  }).join('');
}
