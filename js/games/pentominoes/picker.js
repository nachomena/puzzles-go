/* A level's puzzle table: its sets (one or two), and in each one a row per line with its starting pieces
   and one cell per puzzle (with the piece it adds). The solved ones are marked. */
import { blocksOf } from './engine/sets.js';
import { pieceIcon } from './piece-svg.js';
import meta, { challengeKey, solvedIn, partOf } from './meta.js';
import { t } from '../../i18n/index.js';

/** Tables of a set (one per block of rows with the same puzzle sizes). */
function seriesHtml(part, { stats, cur }){
  const curPart = cur && partOf(cur);
  return blocksOf(part).map(b => {
    const base = b.from - 1, cols = b.to - b.from + 1;
    const nums = Array.from({ length: cols }, (_, k) => `<span class="pt-pick__num">${b.from + k}</span>`).join('');
    const rows = b.rows.map(row => {
      const icons = row.pieces.slice(0, base).map(p => `<span class="pt-pick__base">${pieceIcon(p)}</span>`).join('');
      const cells = Array.from({ length: cols }, (_, k) => {
        const n = b.from + k, st = stats[challengeKey(part, row.label, n)];
        const isCur = curPart === part && cur.p.label === row.label && cur.p.n === n;
        const cls = (st?.solved ? ' is-done' : '') + (isCur ? ' is-current' : '');
        return `<button class="pt-pick__cell${cls}" data-action="pick-puzzle" data-part="${part}" data-row="${row.label}" data-n="${n}" ` +
          `aria-label="${t('games.pentominoes.cellAria', { row: row.label, n })}${st?.solved ? t('games.pentominoes.cellSolved') : ''}">${pieceIcon(row.pieces[n - 1])}</button>`;
      }).join('');
      return `<div class="pt-pick__row"><b class="pt-pick__label">${row.label}</b>${icons}${cells}</div>`;
    }).join('');
    return `<div class="pt-pick" style="--base:${base};--cols:${cols}">` +
      `<div class="pt-pick__row pt-pick__head"><span></span><span class="pt-pick__penta">${t('games.pentominoes.piecesHead')}</span>${nums}</div>${rows}</div>`;
  }).join('');
}

/**
 * @param {string} L  level
 * @param {{ stats: object, cur: object|null }} data  from Store#menuData
 */
export function renderPicker(L, data){
  const { parts, total } = meta.levels[L];
  const head = `<p class="pt-pick__count">${t('games.pentominoes.solvedOf', { a: solvedIn(L, data.stats), n: total })}</p>`;
  return head + parts.map((part, i) =>
    (parts.length > 1 ? `<p class="pt-pick__series">${t('games.pentominoes.series', { n: i + 1 })}</p>` : '') + seriesHtml(part, data)).join('');
}
