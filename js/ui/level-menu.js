/* Menú de un juego: botón de continuar y lista de niveles. */
import { formatTime, plural } from '../lib/format.js';

function levelMeta(level, stats){
  if (!stats.solved) return level.desc;
  return plural(stats.solved, 'resuelto') + (stats.best ? `, récord ${formatTime(stats.best)}` : '');
}

export class LevelMenu {
  constructor({ title, levels, resume }){
    Object.assign(this, { titleEl: title, levelsEl: levels, resumeEl: resume });
  }

  /**
   * @param {{ name: string, levels: object, levelOrder: string[] }} meta  datos del juego (meta.js)
   * @param {{ stats: object, cur: object|null }} data  de Store#menuData o Store.peek
   */
  render(meta, { stats, cur }){
    this.titleEl.textContent = meta.name.toUpperCase();
    this.levelsEl.innerHTML = meta.levelOrder.map(L => {
      const lv = meta.levels[L];
      return `<button class="level" data-action="start-level" data-level="${L}">` +
        `<span class="level__text"><span class="level__name display">${lv.name.toUpperCase()}</span>` +
        `<span class="level__meta">${levelMeta(lv, stats[L] || {})}</span></span>` +
        `</button>`;
    }).join('');
    this.resumeEl.innerHTML = cur
      ? `<button class="resume" data-action="continue"><b class="display">CONTINUAR</b><span>${meta.levels[cur.L].name}, ${formatTime(cur.time || 0)}</span></button>`
      : '';
  }
}
