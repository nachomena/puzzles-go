import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK } from '../js/games/star-battle/config.js';
import { analyze, applyAutoX, nextMark, findHint, hasPlayerInput } from '../js/games/star-battle/rules.js';

const { EMPTY: E, X, STAR: S, AUTO_X: A, TRY: T } = MARK;

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
  assert.equal(hasPlayerInput([A, E]), false);
  assert.equal(hasPlayerInput([X, E]), true);
  assert.equal(hasPlayerInput([T, E]), true);
});

test('la estrella de prueba cuenta como estrella: X automáticas, errores y victoria', () => {
  const m = [E, E, E, E, T, E, E, E, X];
  applyAutoX(m, 3, true);
  assert.deepEqual(m, [A, A, A, A, T, A, A, A, X]);
  const p = { N: 2, K: 1, regions: [0, 0, 1, 1] };
  assert.deepEqual([...analyze([T, E, E, S], p).bad], [1, 0, 0, 1]);
  assert.equal(analyze([E, T, E, E], { N: 2, K: 1, regions: [0, 1, 0, 1] }).solved, false);
  // tocarla con la herramienta normal la deja como estrella
  assert.equal(nextMark(T), S);
  // la pista la trata como estrella mal puesta si no va
  assert.deepEqual(findHint([E, T, E, E], [0, 3]), { type: 'wrong-star', cell: 1 });
});
