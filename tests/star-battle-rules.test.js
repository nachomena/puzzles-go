import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK } from '../js/games/star-battle/config.js';
import { analyze, applyAutoX, nextMark, findHint, hasPlayerInput } from '../js/games/star-battle/rules.js';

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
