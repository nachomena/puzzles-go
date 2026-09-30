/* Pantalla inicial: lista de juegos disponibles. */
import { svgIcon } from './templates.js';
import { plural } from '../lib/format.js';

export class HubView {
  constructor(listEl){ this.listEl = listEl; }

  /** @param {{ game: object, store: import('../core/store.js').Store }[]} entries */
  render(entries){
    this.listEl.innerHTML = entries.map(({ game, store }) => {
      const solved = store.totalSolved();
      const meta = store.hasOpenSession ? 'Partida en curso'
        : solved ? `${game.tagline} · ${plural(solved, 'resuelto')}` : game.tagline;
      return `<button class="level game-card" data-action="open-game" data-game="${game.id}">` +
        `<span class="level__text"><span class="level__name display">${game.name.toUpperCase()}</span>` +
        `<span class="level__meta">${meta}</span></span>` +
        `<span class="game-card__icon">${svgIcon(game.icon)}</span></button>`;
    }).join('');
  }
}
