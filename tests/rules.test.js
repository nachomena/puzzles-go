import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK } from '../js/config.js';
import { analyze, applyAutoX, nextMark, findHint, hasPlayerInput } from '../js/game/rules.js';
import { History } from '../js/game/history.js';
import { Store, createSession } from '../js/game/store.js';

const { EMPTY: E, X, STAR: S, AUTO_X: A } = MARK;

test('nextMark: vacía → X → estrella → vacía (la X automática cuenta como X)', () => {
  assert.equal(nextMark(E), X);
  assert.equal(nextMark(X), S);
  assert.equal(nextMark(S), E);
  assert.equal(nextMark(A), S);
});

test('applyAutoX rodea las estrellas y se puede desactivar', () => {
  const m = [E, E, E, E, S, E, E, E, X];
  applyAutoX(m, 3, true);
  assert.deepEqual(m, [A, A, A, A, S, A, A, A, X]);
  applyAutoX(m, 3, false);
  assert.deepEqual(m, [E, E, E, E, S, E, E, E, X]);
});

test('analyze detecta estrellas que se tocan y el tablero resuelto', () => {
  const p = { N: 2, K: 1, regions: [0, 0, 1, 1] };
  const touching = analyze([S, E, E, S], p);
  assert.ok(touching.anyBad);
  assert.deepEqual([...touching.bad], [1, 0, 0, 1]);
  assert.equal(touching.solved, false);
});

test('findHint prioriza corregir errores', () => {
  const solution = [0, 3];
  assert.deepEqual(findHint([E, S, E, E], solution), { type: 'wrong-star', cell: 1 });
  assert.deepEqual(findHint([X, E, E, E], solution), { type: 'missing-star', cell: 0 });
  assert.equal(findHint([S, E, E, S], solution), null);
  assert.equal(findHint([S, E, E, E], solution).cell, 3);
});

test('hasPlayerInput ignora las X automáticas', () => {
  assert.equal(hasPlayerInput([A, E], [0, 0]), false);
  assert.equal(hasPlayerInput([A, E], [0, 1]), true);
  assert.equal(hasPlayerInput([X, E], [0, 0]), true);
});

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
  const mem = new Map();
  const storage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const a = new Store(storage, 'test');
  const good = { N: 10, K: 2, level: 1, regions: [], solution: [] };
  a.addPuzzle('easy', good);
  a.addPuzzle('easy', { ...good, level: 3 });   // nivel equivocado
  a.state.cur = createSession('easy', good);
  a.state.tool = 'brush';
  assert.deepEqual(a.recordWin('easy', 90, 0), { record: true, best: 90 });
  assert.deepEqual(a.recordWin('easy', 60, 2), { record: false, best: 90 }, 'con pistas no hay récord');

  const b = new Store(storage, 'test');
  b.load();
  assert.equal(b.bufferSize('easy'), 1);
  assert.equal(b.state.tool, 'brush');
  assert.equal(b.state.cur.marks.length, 100);
  assert.equal(b.statsFor('easy').solved, 2);
});

test('Store: sobrevive a datos corruptos o sin almacenamiento', () => {
  const s = new Store({ getItem: () => '{not json', setItem(){} });
  s.load();
  assert.equal(s.state.cur, null);
  const none = new Store(null);
  none.load(); none.save();
});
