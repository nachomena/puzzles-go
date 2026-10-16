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

/** "ahora", "hace 5 min", "hace 2 h", "ayer", "hace 3 días". */
export function ago(at, now = Date.now()){
  const min = Math.floor((now - at) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

/** La partida a medias jugada más recientemente, o null. */
export function lastSession(items){
  let best = null;
  for (const item of items){
    const cur = item.data.cur;
    if (cur && (!best || (cur.at || 0) > (best.data.cur.at || 0))) best = item;
  }
  return best;
}

/** Tarjeta "Continuar" de la última partida a medias (opción A del boceto), o '' si no hay. */
export function resumeCard(item){
  if (!item) return '';
  const { meta, data: { cur } } = item;
  const level = (meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L]?.name ?? '';
  const detail = [meta.levelOrder.length > 1 ? level : '', formatTime(cur.time || 0), cur.at ? ago(cur.at) : ''].filter(Boolean).join(' · ');
  return `<button class="hub-resume" data-action="resume-last" data-game="${meta.id}">` +
    `<span class="hub-resume__icon">${svgIcon(meta.icon)}</span>` +
    `<span class="hub-resume__text"><span class="hub-resume__kicker">Continuar</span>` +
    `<span class="hub-resume__name">${meta.name}</span><span class="hub-resume__detail">${detail}</span></span>` +
    `<span class="hub-resume__play" aria-hidden="true">${svgIcon('play')}</span></button>`;
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
  constructor(listEl, resumeEl){
    this.listEl = listEl;
    this.resumeEl = resumeEl;
    this.open = new Set();   // grupos desplegados
  }

  /** Abre o cierra un grupo. */
  toggle(group){ if (!this.open.delete(group)) this.open.add(group); }

  /** @param {{ meta: object, data: { stats: object } }[]} items  en el orden del catálogo */
  render(items){
    this.resumeEl.innerHTML = resumeCard(lastSession(items));
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
