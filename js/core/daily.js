/* Daily challenge: one board a day for the whole app. The game changes every day and doesn't repeat
   until every game has had its turn (the order is shuffled from the date, so it is the same on every
   phone); the level is Hard on weekdays and Expert at the weekend. Solved days are kept for the streak.
   No DOM. */

const KEY = 'puzzlesgo.daily';
/** Solved days kept (more than a year, for the streak). */
const KEEP = 400;
const DAY_MS = 86400000;

/** The local day as 'YYYY-MM-DD'. */
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Days since 1970-01-01 for a 'YYYY-MM-DD' key (with no time zone, so it doesn't jump with summer time). */
const dayNumber = key => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / DAY_MS); };
const keyOf = n => new Date(n * DAY_MS).toISOString().slice(0, 10);

/** Seeded pseudo-random numbers (mulberry32). */
function random(seed){
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Games that take part: with Hard and Expert levels, generated on the spot (not picked from a table). */
export const dailyGames = metas => metas.filter(m => m.daily !== false && m.levels.hard && m.levels.expert).map(m => m.id);

/**
 * The challenge of a day: { day, id, L }. The games go in turns of `ids.length` days, each turn in its own
 * shuffled order.
 */
export function dailyFor(day, ids){
  const n = dayNumber(day), turn = Math.floor(n / ids.length), rand = random(turn * 7919 + 17);
  const order = ids.slice();
  for (let i = order.length - 1; i > 0; i--){ const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const weekday = new Date(n * DAY_MS).getUTCDay();
  return { day, id: order[n - turn * ids.length], L: weekday === 0 || weekday === 6 ? 'expert' : 'hard' };
}

/** Days in a row solved up to `today` (if today isn't solved yet, the streak up to yesterday still counts). */
export function streakOf(days, today){
  let n = dayNumber(today);
  if (!days.has(keyOf(n))) n--;
  let count = 0;
  while (days.has(keyOf(n))){ count++; n--; }
  return count;
}

/** Solved challenges, saved apart from the games: { 'YYYY-MM-DD': { id, L, time } }. */
export class DailyLog {
  /** @param {Storage|null} storage */
  constructor(storage){
    this.storage = storage;
    this.done = {};
    try {
      const s = JSON.parse(storage?.getItem(KEY) || 'null');
      if (s && typeof s.done === 'object') this.done = s.done;
    } catch (e){ /* corrupt data: start from scratch */ }
  }

  isDone(day){ return !!this.done[day]; }
  streak(today){ return streakOf(new Set(Object.keys(this.done)), today); }

  /** Records a solved challenge (the first time only) and returns the streak up to that day. */
  record(day, { id, L, time }){
    if (!this.done[day]){
      this.done[day] = { id, L, time };
      const keys = Object.keys(this.done).sort();
      for (const k of keys.slice(0, Math.max(0, keys.length - KEEP))) delete this.done[k];
      try { this.storage?.setItem(KEY, JSON.stringify({ done: this.done })); } catch (e){ /* no space or blocked */ }
    }
    return this.streak(day);
  }
}
