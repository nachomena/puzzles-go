/* Pantalla inicial: lista de juegos disponibles, cada uno con su icono y una frase corta (meta.tagline).
   Los juegos sin menú de niveles (p. ej. el Solitario) muestran su récord en lugar de la frase, porque no
   tienen otro sitio donde verlo. Los juegos de un mismo grupo (meta.group, p. ej. los SmartGames) van en
   una fila que se despliega. */
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

/**
 * Tarjeta de cristal "Continuar" (selector y menú de niveles). `attrs`: la acción del botón.
 * @param {{ icon: string, name: string, detail: string, attrs: string }} c
 */
export const resumeCardHtml = ({ icon, name, detail, attrs }) =>
  `<button class="resume-card glass" ${attrs}>` +
  `<span class="resume-card__icon">${svgIcon(icon)}</span>` +
  `<span class="resume-card__text"><span class="resume-card__kicker">Continuar</span>` +
  `<span class="resume-card__name">${name}</span><span class="resume-card__detail">${detail}</span></span>` +
  `<span class="resume-card__play" aria-hidden="true">${svgIcon('play')}</span></button>`;

/** Tarjeta "Continuar" de la última partida a medias, o '' si no hay. */
export function resumeCard(item){
  if (!item) return '';
  const { meta, data: { cur } } = item;
  const level = (meta.resumeLabel ?? meta.sessionLabel)?.(cur) ?? meta.levels[cur.L]?.name ?? '';
  const detail = [meta.levelOrder.length > 1 ? level : '', formatTime(cur.time || 0), cur.at ? ago(cur.at) : ''].filter(Boolean).join(' · ');
  return resumeCardHtml({ icon: meta.icon, name: meta.name, detail, attrs: `data-action="resume-last" data-game="${meta.id}"` });
}

const CHEVRON = '<svg class="game-row__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

/** Fila de un juego (o de un grupo): icono, nombre, una línea de información y la flecha. */
const row = ({ icon, name, info, attrs, cls = '' }) =>
  `<button class="game-row${cls}" ${attrs}>` +
  `<span class="game-row__icon">${svgIcon(icon)}</span>` +
  `<span class="game-row__text"><span class="game-row__name">${name}</span><span class="game-row__info">${info}</span></span>` +
  CHEVRON + `</button>`;

const gameCard = ({ meta, data }, inGroup) => row({
  icon: meta.icon,
  name: inGroup ? meta.shortName ?? meta.name : meta.name,
  info: (meta.levelOrder.length === 1 && bestLine(meta, data.stats)) || meta.tagline || '',
  attrs: `data-action="open-game" data-game="${meta.id}"`
});

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
      return row({ icon: GROUPS[g].icon, name: GROUPS[g].name, info: `${members.length} juegos`, cls: ' game-group' + (isOpen ? ' is-open' : ''),
        attrs: `data-action="toggle-group" data-group="${g}" aria-expanded="${isOpen}"` }) +
        (isOpen ? `<div class="game-group__items">${members.map(i => gameCard(i, true)).join('')}</div>` : '');
    }).join('');
  }
}
