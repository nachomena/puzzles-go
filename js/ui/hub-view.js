/* Home screen: list of available games, each with its icon and a short line (meta.tagline).
   Games without a level menu (e.g. Peg Solitaire) show their record instead of the line, because they
   have nowhere else to show it. Games in the same group (meta.group, e.g. the piece games) go in a row
   that expands. */
import { svgIcon } from './templates.js';
import { formatTime } from '../lib/format.js';
import { statsRows } from '../core/stats.js';
import { t } from '../i18n/index.js';

/** Picker groups: name and icon of their row. */
export const GROUPS = Object.freeze({
  pieces: Object.freeze({ name: t('hub.groups.pieces'), icon: 'pieces' })
});

/** "Best 1:20" or "Best · English 0:42 · European 3:10" (only the rows with a record), or ''. */
export function bestLine(meta, stats = {}){
  const rows = statsRows(meta), withBest = rows.filter(r => stats[r.key]?.best);
  if (!withBest.length) return '';
  if (rows.length === 1) return t('common.record', { time: formatTime(stats[rows[0].key].best) });
  return t('common.recordWord') + ' · ' + withBest.map(r => `${r.name} ${formatTime(stats[r.key].best)}`).join(' · ');
}

/** "just now", "5 min ago", "2 h ago", "yesterday", "3 days ago". */
export function ago(at, now = Date.now()){
  const min = Math.floor((now - at) / 60000);
  if (min < 1) return t('hub.now');
  if (min < 60) return t('hub.minutesAgo', { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t('hub.hoursAgo', { n: h });
  const d = Math.floor(h / 24);
  return d === 1 ? t('hub.yesterday') : t('hub.daysAgo', { n: d });
}

/** The most recently played unfinished game, or null. */
export function lastSession(items){
  let best = null;
  for (const item of items){
    const cur = item.data.cur;
    if (cur && (!best || (cur.at || 0) > (best.data.cur.at || 0))) best = item;
  }
  return best;
}

/**
 * Glass "Continue" card (picker and level menu). `attrs`: the button's action.
 * @param {{ icon: string, name: string, detail: string, attrs: string }} c
 */
export const resumeCardHtml = ({ icon, name, detail, attrs }) =>
  `<button class="resume-card glass" ${attrs}>` +
  `<span class="resume-card__icon">${svgIcon(icon)}</span>` +
  `<span class="resume-card__text"><span class="resume-card__kicker">${t('hub.continue')}</span>` +
  `<span class="resume-card__name">${name}</span><span class="resume-card__detail">${detail}</span></span>` +
  `<span class="resume-card__play" aria-hidden="true">${svgIcon('play')}</span></button>`;

/** "Continue" card for the last unfinished game, or '' if there is none. */
export function resumeCard(item){
  if (!item) return '';
  const { meta, data: { cur } } = item;
  const level = (meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L]?.name ?? '';
  const detail = [meta.levelOrder.length > 1 ? level : '', formatTime(cur.time || 0), cur.at ? ago(cur.at) : ''].filter(Boolean).join(' · ');
  return resumeCardHtml({ icon: meta.icon, name: meta.name, detail, attrs: `data-action="resume-last" data-game="${meta.id}"` });
}

const CHEVRON = '<svg class="game-row__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

/** Row for a game (or a group): icon, name, a line of information and the arrow. */
const row = ({ icon, name, info, attrs, cls = '' }) =>
  `<button class="game-row${cls}" ${attrs}>` +
  `<span class="game-row__icon">${svgIcon(icon)}</span>` +
  `<span class="game-row__text"><span class="game-row__name">${name}</span><span class="game-row__info">${info}</span></span>` +
  CHEVRON + `</button>`;

const gameCard = ({ meta, data }, inGroup) => row({
  icon: meta.icon,
  name: inGroup ? meta.shortName ?? meta.name : meta.name,
  info: (meta.levelOrder.length === 1 && bestLine(meta, data.stats)) || meta.tagline || '',
  attrs: `data-action="open-game" data-game="${meta.id}"`
});

export class HubView {
  constructor(listEl, resumeEl){
    this.listEl = listEl;
    this.resumeEl = resumeEl;
    this.open = new Set();   // grupos desplegados
  }

  /** Expands or collapses a group. */
  toggle(group){ if (!this.open.delete(group)) this.open.add(group); }

  /** @param {{ meta: object, data: { stats: object } }[]} items  in catalogue order */
  render(items){
    this.resumeEl.innerHTML = resumeCard(lastSession(items));
    const done = new Set();
    this.listEl.innerHTML = items.map(item => {
      const g = item.meta.group;
      if (!g || !GROUPS[g]) return gameCard(item, false);
      if (done.has(g)) return '';
      done.add(g);
      const members = items.filter(i => i.meta.group === g), isOpen = this.open.has(g);
      return row({ icon: GROUPS[g].icon, name: GROUPS[g].name, info: t('hub.gamesCount', { n: members.length }), cls: ' game-group' + (isOpen ? ' is-open' : ''),
        attrs: `data-action="toggle-group" data-group="${g}" aria-expanded="${isOpen}"` }) +
        (isOpen ? `<div class="game-group__items">${members.map(i => gameCard(i, true)).join('')}</div>` : '');
    }).join('');
  }
}
