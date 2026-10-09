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

/** Juego mínimo de prueba: solo lo que usa Store. */
const fakeGame = {
  storageKey: 'test',
  levels: { easy: { name: 'Fácil', target: 1 }, hard: { name: 'Difícil', target: 2 } },
  levelOrder: ['easy', 'hard'],
  tools: ['a', 'b'],
  defaultSettings: { timer: true },
  isValidPuzzle: (p, L) => p.level === fakeGame.levels[L].target,
  restoreSession: s => Array.isArray(s.marks) ? s : null
};

test('History: deshacer, rehacer y límite', () => {
  const h = new History(2);
  h.record('a'); h.record('b'); h.record('c');
  assert.equal(h.undo('d'), 'c');
  assert.equal(h.undo('c'), 'b');
  assert.equal(h.undo('b'), null, 'el límite descarta lo más antiguo');
  assert.equal(h.redo('b'), 'c');
  h.record('x');
  assert.equal(h.canRedo, false, 'un cambio nuevo invalida el rehacer');
});

test('Store: guarda, carga y filtra datos inválidos', () => {
  const storage = memoryStorage();
  const a = new Store(storage, fakeGame);
  assert.equal(a.state.tool, 'a', 'la primera herramienta es la de por defecto');
  a.addPuzzle('easy', { level: 1 });
  a.addPuzzle('easy', { level: 2 });   // nivel equivocado
  a.state.cur = { L: 'easy', p: {}, marks: [0], time: 30, done: false };
  a.state.tool = 'b';
  assert.deepEqual(a.recordWin('easy', 90, 0), { record: true, best: 90, prevBest: null, prevAvg: null });
  assert.deepEqual(a.recordWin('easy', 60, 2), { record: false, best: 90, prevBest: 90, prevAvg: 90 }, 'con pistas no hay récord');

  const b = new Store(storage, fakeGame);
  b.load();
  assert.equal(b.bufferSize('easy'), 1);
  assert.equal(b.state.tool, 'b');
  assert.ok(b.hasOpenSession);
  assert.equal(b.totalSolved(), 2);
});

test('Store: una partida de menos de 5 s no se ofrece para continuar y su tablero vuelve a la reserva', () => {
  const storage = memoryStorage();
  const a = new Store(storage, fakeGame);
  a.state.cur = { L: 'easy', p: { level: 1 }, marks: [0], time: 3, done: false };
  a.save();
  assert.equal(a.hasOpenSession, false);
  assert.equal(Store.peek(storage, fakeGame.storageKey).cur, null);
  a.dropFreshSession({ keepPuzzle: true });
  assert.equal(a.state.cur, null);
  assert.deepEqual(a.takePuzzle('easy'), { level: 1 });
  // con 5 s o más sí queda, y no se descarta
  a.state.cur = { L: 'easy', p: { level: 1 }, marks: [0], time: 5, done: false };
  assert.ok(a.hasOpenSession);
  a.dropFreshSession({ keepPuzzle: true });
  assert.ok(a.state.cur);
  // y si ya tiene algo puesto, aunque lleve menos
  a.state.cur = { L: 'easy', p: { level: 1 }, marks: [1], time: 2, input: true, done: false };
  assert.ok(a.hasOpenSession);
});

test('Store: sobrevive a datos corruptos o sin almacenamiento', () => {
  const s = new Store({ getItem: () => '{not json', setItem(){} }, fakeGame);
  s.load();
  assert.equal(s.state.cur, null);
  const none = new Store(null, fakeGame);
  none.load(); none.save();
});

test('defineGame exige el contrato completo', () => {
  assert.throws(() => defineGame({ id: 'x' }), /faltan/);
});

test('bits: combinaciones sin crear arrays y bits encendidos', () => {
  const seen = [];
  someCombination([1, 2, 3, 4], 2, c => { seen.push(c.join('')); return false; });
  assert.deepEqual(seen, ['12', '13', '14', '23', '24', '34']);
  assert.equal(someCombination([1, 2, 3], 2, c => c[1] === 3), true, 'se detiene al devolver true');
  assert.deepEqual(bitIndices(0b10110), [1, 2, 4]);
  assert.equal(popcount(0x1ff), 9);
});

import { hintWait } from '../js/core/hint-cooldown.js';

test('hintWait: la primera pista está libre y luego hay que esperar el tiempo de juego', () => {
  assert.equal(hintWait({ time: 0 }, 600), 0);
  assert.equal(hintWait({ time: 100, hintAt: 90 }, 600), 590);
  assert.equal(hintWait({ time: 700, hintAt: 90 }, 600), 0);
});
