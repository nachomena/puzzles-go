/* Pantalla inicial: lista de juegos disponibles. Sin descripciones; solo los juegos sin menú de
   niveles (p. ej. el Solitario) muestran aquí su récord, porque no tienen otro sitio donde verlo. */
import { svgIcon } from './templates.js';
import { formatTime } from '../lib/format.js';
import { statsRows } from '../core/stats.js';

/** "Récord 1:20" o "Récord · Inglés 0:42 · Europeo 3:10" (solo las filas con récord), o ''. */
export function bestLine(meta, stats = {}){
  const rows = statsRows(meta), withBest = rows.filter(r => stats[r.key]?.best);
  if (!withBest.length) return '';
  if (rows.length === 1) return `Récord ${formatTime(stats[rows[0].key].best)}`;
  return 'Récord · ' + withBest.map(r => `${r.name} ${formatTime(stats[r.key].best)}`).join(' · ');
}

export class HubView {
  constructor(listEl){ this.listEl = listEl; }

  /** @param {{ meta: object, data: { stats: object } }[]} items */
  render(items){
    this.listEl.innerHTML = items.map(({ meta, data }) => {
      const info = meta.levelOrder.length === 1 ? bestLine(meta, data.stats) : '';
      return `<button class="level game-card" data-action="open-game" data-game="${meta.id}">` +
        `<span class="level__text"><span class="level__name display">${meta.name.toUpperCase()}</span>` +
        `<span class="level__meta">${info}</span></span>` +
        `<span class="game-card__icon">${svgIcon(meta.icon)}</span></button>`;
    }).join('');
  }
}
