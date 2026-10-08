/* Pantalla inicial: lista de juegos disponibles. Sin descripciones; solo los juegos sin menú de
   niveles (p. ej. el Solitario) muestran aquí su récord, porque no tienen otro sitio donde verlo.
   Los juegos de un mismo grupo (meta.group, p. ej. los SmartGames) van en una fila que se despliega. */
import { svgIcon } from './templates.js';
import { formatTime } from '../lib/format.js';
import { statsRows } from '../core/stats.js';

/** Grupos del selector: nombre e icono de su fila. */
export const GROUPS = Object.freeze({
  smart: Object.freeze({ name: 'Smart Games', icon: 'smart' })
});

/** "Récord 1:20" o "Récord · Inglés 0:42 · Europeo 3:10" (solo las filas con récord), o ''. */
export function bestLine(meta, stats = {}){
  const rows = statsRows(meta), withBest = rows.filter(r => stats[r.key]?.best);
  if (!withBest.length) return '';
  if (rows.length === 1) return `Récord ${formatTime(stats[rows[0].key].best)}`;
  return 'Récord · ' + withBest.map(r => `${r.name} ${formatTime(stats[r.key].best)}`).join(' · ');
}

const gameCard = ({ meta, data }, inGroup) => {
  const info = meta.levelOrder.length === 1 ? bestLine(meta, data.stats) : '';
  const name = inGroup ? meta.shortName ?? meta.name : meta.name;
  return `<button class="level game-card" data-action="open-game" data-game="${meta.id}">` +
    `<span class="level__text"><span class="level__name display">${name.toUpperCase()}</span>` +
    `<span class="level__meta">${info}</span></span>` +
    `<span class="game-card__icon">${svgIcon(meta.icon)}</span></button>`;
};

export class HubView {
  constructor(listEl){
    this.listEl = listEl;
    this.open = new Set();   // grupos desplegados
  }

  /** Abre o cierra un grupo. */
  toggle(group){ if (!this.open.delete(group)) this.open.add(group); }

  /** @param {{ meta: object, data: { stats: object } }[]} items  en el orden del catálogo */
  render(items){
    const done = new Set();
    this.listEl.innerHTML = items.map(item => {
      const g = item.meta.group;
      if (!g || !GROUPS[g]) return gameCard(item, false);
      if (done.has(g)) return '';
      done.add(g);
      const members = items.filter(i => i.meta.group === g), isOpen = this.open.has(g);
      return `<button class="level game-card game-group${isOpen ? ' is-open' : ''}" data-action="toggle-group" data-group="${g}" aria-expanded="${isOpen}">` +
        `<span class="level__text"><span class="level__name display">${GROUPS[g].name.toUpperCase()}</span>` +
        `<span class="level__meta">${members.length} juegos</span></span>` +
        `<span class="game-card__icon">${svgIcon(isOpen ? 'chevron-up' : GROUPS[g].icon)}</span></button>` +
        (isOpen ? `<div class="game-group__items">${members.map(i => gameCard(i, true)).join('')}</div>` : '');
    }).join('');
  }
}
