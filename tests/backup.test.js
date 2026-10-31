import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BackupError, applyBackup, backupKeys, backupName, exportBackup, parseBackup } from '../js/core/backup.js';
import { CATALOG } from '../js/games/catalog.js';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), keys: () => [...m.keys()] }; };
const KEYS = backupKeys(CATALOG.map(c => c.meta));
const SUDOKU = CATALOG.find(c => c.meta.id === 'sudoku').meta.storageKey;
const reason = fn => { try { fn(); } catch (e){ return e instanceof BackupError ? e.reason : 'other'; } return null; };

test('the keys to back up: every game and the daily challenge, never Pro, language or night mode', () => {
  assert.equal(KEYS.length, CATALOG.length + 1);
  assert.ok(KEYS.includes('puzzlesgo.daily') && KEYS.includes(SUDOKU));
  for (const k of ['puzzlesgo.pro', 'puzzlesgo.dev', 'puzzlesgo.lang', 'puzzlesgo.night']) assert.ok(!KEYS.includes(k));
});

test('export and import: the progress goes to another storage, without the boards kept ready or the game in progress', () => {
  const from = memory();
  const cur = { L: 'hard', p: { solution: [1, 2, 3] }, time: 40, done: false };
  from.setItem(SUDOKU, JSON.stringify({ stats: { easy: { best: 90 } }, log: [{ L: 'easy', t: 90 }], buffers: { easy: [{ p: 1 }] }, cur }));
  from.setItem('puzzlesgo.daily', JSON.stringify({ done: { '2026-10-29': { id: 'loop', L: 'hard', time: 200 } } }));
  from.setItem('puzzlesgo.pro', '1');
  from.setItem('puzzlesgo.night', '1');
  const text = exportBackup(from, KEYS, new Date('2026-10-30T10:00:00Z'));
  assert.equal(JSON.parse(text).date, '2026-10-30T10:00:00.000Z');
  assert.ok(!text.includes('solution'), 'the file does not give the solutions away');
  assert.equal(backupName(new Date('2026-10-30T10:00:00Z')), 'puzzles-go-2026-10-30.json');

  const to = memory();
  to.setItem(SUDOKU, JSON.stringify({ stats: { easy: { best: 500 } } }));   // what the new device had: replaced
  to.setItem('puzzlesgo.night', '0');
  assert.ok(applyBackup(to, parseBackup(text, KEYS)));
  const sudoku = JSON.parse(to.getItem(SUDOKU));
  assert.equal(sudoku.stats.easy.best, 90);
  assert.equal(sudoku.buffers, undefined);
  assert.equal(sudoku.cur, undefined);
  assert.equal(JSON.parse(to.getItem('puzzlesgo.daily')).done['2026-10-29'].id, 'loop');
  assert.equal(to.getItem('puzzlesgo.pro'), null, 'Pro does not travel');
  assert.equal(to.getItem('puzzlesgo.night'), '0', 'the device keeps its own settings');
});

test('a file from an earlier version with a game in progress: it is not restored', () => {
  const old = JSON.stringify({ app: 'puzzles-go', version: 1, data: { [SUDOKU]: { stats: { easy: { best: 5 } }, cur: { p: { solution: [1] } } } } });
  const to = memory();
  applyBackup(to, parseBackup(old, KEYS));
  assert.deepEqual(JSON.parse(to.getItem(SUDOKU)), { stats: { easy: { best: 5 } } });
});

test('a game missing from the file keeps what the device has', () => {
  const from = memory(), to = memory();
  from.setItem(SUDOKU, JSON.stringify({ stats: {} }));
  const other = CATALOG.find(c => c.meta.id === 'loop').meta.storageKey;
  to.setItem(other, JSON.stringify({ stats: { easy: { best: 7 } } }));
  applyBackup(to, parseBackup(exportBackup(from, KEYS), KEYS));
  assert.deepEqual(JSON.parse(to.getItem(other)), { stats: { easy: { best: 7 } } });
});

test('refused files: not ours, newer, or with nothing to restore', () => {
  assert.equal(reason(() => parseBackup('not json', KEYS)), 'format');
  assert.equal(reason(() => parseBackup('[1,2]', KEYS)), 'format');
  assert.equal(reason(() => parseBackup(JSON.stringify({ app: 'other', version: 1, data: {} }), KEYS)), 'format');
  assert.equal(reason(() => parseBackup(JSON.stringify({ app: 'puzzles-go', data: {} }), KEYS)), 'format');
  assert.equal(reason(() => parseBackup(JSON.stringify({ app: 'puzzles-go', version: 99, data: {} }), KEYS)), 'newer');
  assert.equal(reason(() => parseBackup(JSON.stringify({ app: 'puzzles-go', version: 1, data: {} }), KEYS)), 'empty');
  // keys that are not the app's, and values that are not objects, are ignored
  const odd = JSON.stringify({ app: 'puzzles-go', version: 1, data: { 'puzzlesgo.pro': { x: 1 }, [SUDOKU]: 'text' } });
  assert.equal(reason(() => parseBackup(odd, KEYS)), 'empty');
});

test('applyBackup: if the storage fills up, everything goes back as it was', () => {
  const to = memory();
  to.setItem(SUDOKU, '{"stats":{"old":1}}');
  const full = { ...to, setItem(k, v){ if (k === 'puzzlesgo.daily') throw new Error('quota'); to.setItem(k, v); } };
  assert.equal(applyBackup(full, [[SUDOKU, { stats: { new: 1 } }], ['puzzlesgo.daily', { done: {} }]]), false);
  assert.equal(to.getItem(SUDOKU), '{"stats":{"old":1}}');
  assert.equal(to.getItem('puzzlesgo.daily'), null);
});
