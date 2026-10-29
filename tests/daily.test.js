import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, dailyFor, dailyGames, streakOf, DailyLog } from '../js/core/daily.js';
import { Membership } from '../js/core/membership.js';
import { CATALOG } from '../js/games/catalog.js';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
const addDays = (key, n) => { const d = new Date(key + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const IDS = dailyGames(CATALOG.map(c => c.meta));

test('the games that take part: every one with Hard and Expert except the table and single-level ones', () => {
  assert.ok(!IDS.includes('pentominoes') && !IDS.includes('peg-solitaire'));
  assert.equal(IDS.length, CATALOG.length - 2);
});

test('dayKey: the local day as YYYY-MM-DD', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('dailyFor: every game once per turn, the same on every call; Hard on weekdays and Expert at the weekend', () => {
  const start = '2026-11-02';   // any day: the turns are counted from 1970
  const seen = new Map();
  for (let k = 0; k < IDS.length * 3; k++){
    const day = addDays(start, k), d = dailyFor(day, IDS);
    assert.deepEqual(dailyFor(day, IDS), d, 'deterministic');
    assert.ok(IDS.includes(d.id));
    const weekday = new Date(day + 'T12:00:00Z').getUTCDay();
    assert.equal(d.L, weekday === 0 || weekday === 6 ? 'expert' : 'hard');
    seen.set(d.id, (seen.get(d.id) || 0) + 1);
  }
  // three whole turns may not line up with the start day, but no game goes more than 4 times or fewer than 2
  assert.equal(seen.size, IDS.length);
  for (const n of seen.values()) assert.ok(n >= 2 && n <= 4);
});

test('streak: days in a row up to today, or up to yesterday if today is still to do', () => {
  const days = new Set(['2026-10-26', '2026-10-27', '2026-10-28']);
  assert.equal(streakOf(days, '2026-10-28'), 3);
  assert.equal(streakOf(days, '2026-10-29'), 3, 'today not done yet: yesterday\'s streak still counts');
  assert.equal(streakOf(days, '2026-10-30'), 0, 'a day missed');
  assert.equal(streakOf(new Set(), '2026-10-30'), 0);
});

test('DailyLog: records once, is saved and gives the streak', () => {
  const storage = memory(), log = new DailyLog(storage);
  assert.equal(log.record('2026-10-27', { id: 'sudoku', L: 'hard', time: 300 }), 1);
  assert.equal(log.record('2026-10-28', { id: 'loop', L: 'hard', time: 200 }), 2);
  assert.equal(log.record('2026-10-28', { id: 'loop', L: 'hard', time: 100 }), 2);
  const again = new DailyLog(storage);
  assert.ok(again.isDone('2026-10-28') && !again.isDone('2026-10-29'));
  assert.equal(again.done['2026-10-28'].time, 200, 'the first time is kept');
  assert.equal(again.streak('2026-10-29'), 2);
});

test('Membership: free locks every level but the first; Pro, none; single-level games are free', () => {
  const storage = memory(), m = new Membership(storage);
  const sudoku = CATALOG.find(c => c.meta.id === 'sudoku').meta, peg = CATALOG.find(c => c.meta.id === 'peg-solitaire').meta;
  assert.deepEqual(sudoku.levelOrder.map(L => m.locks(sudoku, L)), [false, true, true]);
  assert.ok(!m.locks(peg, peg.levelOrder[0]));
  m.set(true);
  assert.ok(new Membership(storage).pro, 'saved');
  assert.deepEqual(sudoku.levelOrder.map(L => m.locks(sudoku, L)), [false, false, false]);
});
