/* Menú de un juego: botón de continuar y lista de niveles. */
import { formatTime } from '../lib/format.js';
import { levelSummary } from '../core/stats.js';
import { sparkSvg } from './progress-view.js';

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
   * @param {{ stats: object, cur: object|null, log?: object[] }} data  de Store#menuData o Store.peek
   */
  render(meta, { stats, cur, log = [] }){
    // al lado de cada nivel, la línea de sus últimas partidas (no en los juegos que agrupan el progreso de otra forma)
    const spark = L => meta.progressRow ? '' : sparkSvg(log.filter(e => e.k === L), { W: 72, H: 30, n: 12, cls: 'level__spark' });
    this.titleEl.textContent = meta.name.toUpperCase();
    if (this.labelEl) this.labelEl.textContent = meta.menuLabel ?? 'Nueva partida';
    this.levelsEl.innerHTML = meta.levelOrder.map(L => {
      const lv = meta.levels[L];
      return `<button class="level" data-action="start-level" data-level="${L}">` +
        `<span class="level__text"><span class="level__name display">${lv.name.toUpperCase()}</span>` +
        `<span class="level__meta">${levelMeta(meta, L, stats)}</span></span>` +
        spark(L) + `</button>`;
    }).join('');
    this.resumeEl.innerHTML = cur
      ? `<button class="resume" data-action="continue"><b class="display">CONTINUAR</b><span>${(meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L].name}, ${formatTime(cur.time || 0)}</span></button>`
      : '';
  }
}
