/* Menú de un juego: botón de continuar y lista de niveles. */
import { formatTime } from '../lib/format.js';

/** Bajo cada nivel solo va el mejor tiempo (si lo hay), salvo que el juego diga otra cosa. */
const levelMeta = (meta, L, stats) => meta.levelMeta
  ? meta.levelMeta(L, stats)
  : stats[L]?.best ? `Récord ${formatTime(stats[L].best)}` : '';

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
    if (this.labelEl) this.labelEl.textContent = meta.menuLabel ?? 'Nueva partida';
    this.levelsEl.innerHTML = meta.levelOrder.map(L => {
      const lv = meta.levels[L];
      return `<button class="level" data-action="start-level" data-level="${L}">` +
        `<span class="level__text"><span class="level__name display">${lv.name.toUpperCase()}</span>` +
        `<span class="level__meta">${levelMeta(meta, L, stats)}</span></span>` +
        `</button>`;
    }).join('');
    this.resumeEl.innerHTML = cur
      ? `<button class="resume" data-action="continue"><b class="display">CONTINUAR</b><span>${(meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L].name}, ${formatTime(cur.time || 0)}</span></button>`
      : '';
  }
}
