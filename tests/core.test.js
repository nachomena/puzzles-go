import { test } from 'node:test';
import assert from 'node:assert/strict';
import { History } from '../js/core/history.js';
import { Store } from '../js/core/store.js';
import { defineGame } from '../js/core/game-definition.js';
import { someCombination, bitIndices, popcount } from '../js/lib/bits.js';

const memoryStorage = () => {
  const mem = new Map();
  return { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
};

/** Minimal test game: only what Store uses. */
const fakeGame = {
  storageKey: 'test',
  levels: { easy: { name: 'Fácil', target: 1 }, hard: { name: 'Difícil', target: 2 } },
  levelOrder: ['easy', 'hard'],
  tools: ['a', 'b'],
  defaultSettings: { timer: true },
  isValidPuzzle: (p, L) => p.level === fakeGame.levels[L].target,
  restoreSession: s => Array.isArray(s.marks) ? s : null
};

test('History: undo, redo and limit', () => {
  const h = new History(2);
  h.record('a'); h.record('b'); h.record('c');
  assert.equal(h.undo('d'), 'c');
  assert.equal(h.undo('c'), 'b');
  assert.equal(h.undo('b'), null, 'the limit drops the oldest');
  assert.equal(h.redo('b'), 'c');
  h.record('x');
  assert.equal(h.canRedo, false, 'a new change clears redo');
});

test('Store: saves, loads and filters invalid data', () => {
  const storage = memoryStorage();
  const a = new Store(storage, fakeGame);
  assert.equal(a.state.tool, 'a', 'the first tool is the default one');
  a.addPuzzle('easy', { level: 1 });
  a.addPuzzle('easy', { level: 2 });   // wrong level
  a.state.cur = { L: 'easy', p: {}, marks: [0], time: 30, done: false };
  a.state.tool = 'b';
  assert.deepEqual(a.recordWin('easy', 90, 0), { record: true, best: 90, prevBest: null, prevAvg: null });
  assert.deepEqual(a.recordWin('easy', 60, 2), { record: false, best: 90, prevBest: 90, prevAvg: 90 }, 'with hints there is no record');

  const b = new Store(storage, fakeGame);
  b.load();
  assert.equal(b.bufferSize('easy'), 1);
  assert.equal(b.state.tool, 'b');
  assert.ok(b.hasOpenSession);
  assert.equal(b.totalSolved(), 2);
  assert.deepEqual(b.state.log.map(e => [e.k, e.t, e.h]), [['easy', 90, 0], ['easy', 60, 2]], 'every win goes into the log');
  b.clearStats();
  assert.equal(b.state.log.length, 0);
});

test("Store: a game under 5 s isn't offered to continue and its board goes back to the supply", () => {
  const storage = memoryStorage();
  const a = new Store(storage, fakeGame);
  a.state.cur = { L: 'easy', p: { level: 1 }, marks: [0], time: 3, done: false };
  a.save();
  assert.equal(a.hasOpenSession, false);
  assert.equal(Store.peek(storage, fakeGame.storageKey).cur, null);
  a.dropFreshSession({ keepPuzzle: true });
  assert.equal(a.state.cur, null);
  assert.deepEqual(a.takePuzzle('easy'), { level: 1 });
  // with 5 s or more it stays, and isn't discarded
  a.state.cur = { L: 'easy', p: { level: 1 }, marks: [0], time: 5, done: false };
  assert.ok(a.hasOpenSession);
  a.dropFreshSession({ keepPuzzle: true });
  assert.ok(a.state.cur);
  // and if something is already placed, even if it took less
  a.state.cur = { L: 'easy', p: { level: 1 }, marks: [1], time: 2, input: true, done: false };
  assert.ok(a.hasOpenSession);
});

test('Store: survives corrupt data or no storage', () => {
  const s = new Store({ getItem: () => '{not json', setItem(){} }, fakeGame);
  s.load();
  assert.equal(s.state.cur, null);
  const none = new Store(null, fakeGame);
  none.load(); none.save();
});

test('defineGame requires the full contract', () => {
  assert.throws(() => defineGame({ id: 'x' }), /missing/);
});

test('bits: combinations without creating arrays, and set bits', () => {
  const seen = [];
  someCombination([1, 2, 3, 4], 2, c => { seen.push(c.join('')); return false; });
  assert.deepEqual(seen, ['12', '13', '14', '23', '24', '34']);
  assert.equal(someCombination([1, 2, 3], 2, c => c[1] === 3), true, 'stops when it returns true');
  assert.deepEqual(bitIndices(0b10110), [1, 2, 4]);
  assert.equal(popcount(0x1ff), 9);
});

import { hintWait } from '../js/core/hint-cooldown.js';

test('hintWait: the first hint is free and then you wait for playing time', () => {
  assert.equal(hintWait({ time: 0 }, 600), 0);
  assert.equal(hintWait({ time: 100, hintAt: 90 }, 600), 590);
  assert.equal(hintWait({ time: 700, hintAt: 90 }, 600), 0);
});
