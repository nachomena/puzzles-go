/* A game's menu: the continue card and the levels, each on a glass card with its difficulty bars and
   its record. The levels that need Pro show a lock instead (core/membership.js). */
import { svgIcon } from './templates.js';
import { levelSummary } from '../core/stats.js';
import { resumeCardHtml } from './hub-view.js';
import { t } from '../i18n/index.js';

/** Under each level goes the record (see levelSummary), unless the game says otherwise. */
const levelMeta = (meta, L, stats) => meta.levelMeta ? meta.levelMeta(L, stats) : levelSummary(stats[L]);

export class LevelMenu {
  constructor({ title, label, levels, resume }){
    Object.assign(this, { titleEl: title, labelEl: label, levelsEl: levels, resumeEl: resume });
  }

  /**
   * @param {{ name: string, levels: object, levelOrder: string[], menuLabel?: string, levelMeta?: Function,
   *   sessionLabel?: Function, resumeLabel?: Function }} meta
   *   the game's data (meta.js)
   * @param {{ stats: object, cur: object|null }} data  from Store#menuData or Store.peek
   * @param {(L: string) => boolean} [locked]  does the level need Pro?
   */
  render(meta, { stats, cur }, locked = () => false){
    this.titleEl.textContent = meta.name.toUpperCase();
    if (this.labelEl) this.labelEl.textContent = meta.menuLabel ?? t('menu.newGame');
    const order = meta.levelOrder;
    this.levelsEl.innerHTML = order.map((L, k) => {
      const bars = order.map((_, j) => `<i${j <= k ? ' class="is-on"' : ''}></i>`).join('');
      const lock = locked(L);
      return `<button class="level-card glass${lock ? ' is-locked' : ''}" data-action="start-level" data-level="${L}">` +
        `<span><span class="level-card__name display">${meta.levels[L].name.toUpperCase()}</span>` +
        `<span class="level-card__bars" aria-hidden="true">${bars}</span></span>` +
        (lock ? `<span class="level-card__meta level-card__lock">${svgIcon('lock')}${t('pro.badge')}</span>`
          : `<span class="level-card__meta">${levelMeta(meta, L, stats)}</span>`) + `</button>`;
    }).join('');
    this.resumeEl.innerHTML = cur
      ? resumeCardHtml({ icon: meta.icon, name: (meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L].name,
          detail: t('hub.inProgress'), attrs: 'data-action="continue"' })
      : '';
  }
}
