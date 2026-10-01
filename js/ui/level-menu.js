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

  /** Mientras se carga el juego: solo el título. */
  renderLoading(meta){
    this.titleEl.textContent = meta.name.toUpperCase();
    this.levelsEl.innerHTML = '';
    this.resumeEl.innerHTML = '';
  }

  /**
   * @param {object} game  definición del juego
   * @param {import('../core/store.js').Store} store
   */
  render(game, store){
    this.titleEl.textContent = game.name.toUpperCase();
    this.levelsEl.innerHTML = game.levelOrder.map(L => {
      const lv = game.levels[L];
      return `<button class="level" data-action="start-level" data-level="${L}">` +
        `<span class="level__text"><span class="level__name display">${lv.name.toUpperCase()}</span>` +
        `<span class="level__meta">${levelMeta(lv, store.statsFor(L))}</span></span>` +
        `</button>`;
    }).join('');

    const c = store.state.cur;
    this.resumeEl.innerHTML = store.hasOpenSession
      ? `<button class="resume" data-action="continue"><b class="display">CONTINUAR</b><span>${game.levels[c.L].name}, ${formatTime(c.time || 0)}</span></button>`
      : '';
  }
}
