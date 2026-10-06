/* Pantalla de estadísticas: por cada juego, récord, media y resueltos de cada nivel, y su racha. */
import { formatTime, plural } from '../lib/format.js';
import { statsRows, average, currentStreak } from '../core/stats.js';

const time = s => s ? formatTime(s) : '—';

function streakLine(streak){
  if (!streak?.best) return '';
  const now = currentStreak(streak);
  const text = now ? `Racha: ${plural(now, 'día')} · mejor ${streak.best}` : `Mejor racha: ${plural(streak.best, 'día')}`;
  return `<p class="stats-game__streak">${text}</p>`;
}

export class StatsView {
  constructor(listEl){ this.listEl = listEl; }

  /** @param {{ meta: object, data: { stats: object, streak: object } }[]} items */
  render(items){
    this.listEl.innerHTML = items.map(({ meta, data }) => {
      const rows = statsRows(meta), stats = data.stats || {};
      const played = rows.some(r => stats[r.key]?.solved);
      const body = played
        ? `<div class="stats-table" role="table">` +
          `<div class="stats-row stats-row--head" role="row"><span></span><span>Récord</span><span>Media</span><span>Resueltos</span></div>` +
          rows.map(r => {
            const st = stats[r.key] || {};
            return `<div class="stats-row" role="row"><span>${r.name}</span><span>${time(st.best)}</span>` +
              `<span>${time(average(st))}</span><span>${st.solved || 0}</span></div>`;
          }).join('') + `</div>`
        : `<p class="stats-empty">Aún sin partidas resueltas</p>`;
      return `<section class="stats-game"><h2 class="stats-game__name display">${meta.name.toUpperCase()}</h2>` +
        streakLine(data.streak) + body + `</section>`;
    }).join('');
  }
}
