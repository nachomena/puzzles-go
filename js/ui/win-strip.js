/* Tira de la pantalla de victoria: tus últimas partidas del nivel como puntos sobre una línea, de la
   más rápida (izquierda) a la más lenta, con la de hoy resaltada y tu media marcada. */
import { formatTime } from '../lib/format.js';

const W = 300, H = 60, PAD = 12, Y = 24;

/** Marcado de la tira para `strip` (ver core/progress.js#winStrip), o '' si no hay. */
export function winStripSvg(strip){
  if (!strip) return '';
  const { times, today, hints, avg } = strip;
  const lo = Math.min(today, ...times), hi = Math.max(today, ...times);
  const x = v => hi === lo ? W / 2 : PAD + (v - lo) / (hi - lo) * (W - 2 * PAD);
  const tx = x(today), anchor = tx < 40 ? 'start' : tx > W - 40 ? 'end' : 'middle';
  return `<svg class="win-strip" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hoy ${formatTime(today)}; tu media de las últimas ${times.length}: ${formatTime(avg)}">` +
    `<line class="win-strip__axis" x1="${PAD}" x2="${W - PAD}" y1="${Y}" y2="${Y}"/>` +
    times.map(t => `<circle class="win-strip__dot" cx="${x(t).toFixed(1)}" cy="${Y}" r="4.5"/>`).join('') +
    `<line class="win-strip__avg" x1="${x(avg).toFixed(1)}" x2="${x(avg).toFixed(1)}" y1="${Y - 9}" y2="${Y + 9}"/>` +
    `<text class="win-strip__label" x="${x(avg).toFixed(1)}" y="${Y + 21}" text-anchor="middle">media ${formatTime(avg)}</text>` +
    `<circle class="win-strip__today${hints ? ' is-hints' : ''}" cx="${tx.toFixed(1)}" cy="${Y}" r="7"/>` +
    `<text class="win-strip__label win-strip__label--today" x="${tx.toFixed(1)}" y="${Y - 12}" text-anchor="${anchor}">Hoy</text>` +
    `<text class="win-strip__label" x="${PAD}" y="${H - 2}">más rápido</text>` +
    `<text class="win-strip__label" x="${W - PAD}" y="${H - 2}" text-anchor="end">más lento</text>` +
    `</svg><p class="win-strip__cap">${times.length === 1 ? 'Frente a tu partida anterior' : `Entre tus últimas ${times.length} partidas`} sin pistas</p>`;
}
