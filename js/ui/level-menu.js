/* Menú de un juego: tarjeta de continuar y los niveles, cada uno en una tarjeta de cristal con sus rayas
   de dificultad y su récord. */
import { formatTime } from '../lib/format.js';
import { levelSummary } from '../core/stats.js';
import { resumeCardHtml } from './hub-view.js';
import { t } from '../i18n/index.js';

/** Bajo cada nivel va el récord (ver levelSummary), salvo que el juego diga otra cosa. */
const levelMeta = (meta, L, stats) => meta.levelMeta ? meta.levelMeta(L, stats) : levelSummary(stats[L]);

export class LevelMenu {
  constructor({ title, label, levels, resume }){
    Object.assign(this, { titleEl: title, labelEl: label, levelsEl: levels, resumeEl: resume });
  }

  /**
   * @param {{ name: string, levels: object, levelOrder: string[], menuLabel?: string, levelMeta?: Function,
   *   sessionLabel?: Function, resumeLabel?: Function }} meta
   *   datos del juego (meta.js)
   * @param {{ stats: object, cur: object|null }} data  de Store#menuData o Store.peek
   */
  render(meta, { stats, cur }){
    this.titleEl.textContent = meta.name.toUpperCase();
    if (this.labelEl) this.labelEl.textContent = meta.menuLabel ?? t('menu.newGame');
    const order = meta.levelOrder;
    this.levelsEl.innerHTML = order.map((L, k) => {
      const bars = order.map((_, j) => `<i${j <= k ? ' class="is-on"' : ''}></i>`).join('');
      return `<button class="level-card glass" data-action="start-level" data-level="${L}">` +
        `<span><span class="level-card__name display">${meta.levels[L].name.toUpperCase()}</span>` +
        `<span class="level-card__bars" aria-hidden="true">${bars}</span></span>` +
        `<span class="level-card__meta">${levelMeta(meta, L, stats)}</span></button>`;
    }).join('');
    this.resumeEl.innerHTML = cur
      ? resumeCardHtml({ icon: meta.icon, name: (meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L].name,
          detail: formatTime(cur.time || 0), attrs: 'data-action="continue"' })
      : '';
  }
}
