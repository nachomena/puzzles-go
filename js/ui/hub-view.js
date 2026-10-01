/* Pantalla inicial: lista de juegos disponibles. */
import { svgIcon } from './templates.js';
import { plural } from '../lib/format.js';

export class HubView {
  constructor(listEl){ this.listEl = listEl; }

  /** @param {{ meta: object, summary: { inProgress: boolean, solved: number } }[]} items */
  render(items){
    this.listEl.innerHTML = items.map(({ meta, summary }) => {
      const info = summary.inProgress ? 'Partida en curso'
        : summary.solved ? `${meta.tagline} · ${plural(summary.solved, 'resuelto')}` : meta.tagline;
      return `<button class="level game-card" data-action="open-game" data-game="${meta.id}">` +
        `<span class="level__text"><span class="level__name display">${meta.name.toUpperCase()}</span>` +
        `<span class="level__meta">${info}</span></span>` +
        `<span class="game-card__icon">${svgIcon(meta.icon)}</span></button>`;
    }).join('');
  }
}
