import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK } from '../js/games/star-battle/config.js';
import { analyze, applyAutoX, nextMark, findHint, hasPlayerInput } from '../js/games/star-battle/rules.js';

const { EMPTY: E, X, STAR: S, AUTO_X: A, TRY: T } = MARK;

test('nextMark: empty → X → star → empty (the automatic X counts as X)', () => {
  assert.equal(nextMark(E), X);
  assert.equal(nextMark(X), S);
  assert.equal(nextMark(S), E);
  assert.equal(nextMark(A), S);
});

test('applyAutoX surrounds the stars and can be turned off', () => {
  const m = [E, E, E, E, S, E, E, E, X];
  applyAutoX(m, 3, true);
  assert.deepEqual(m, [A, A, A, A, S, A, A, A, X]);
  applyAutoX(m, 3, false);
  assert.deepEqual(m, [E, E, E, E, S, E, E, E, X]);
});

test('analyze detects touching stars and the solved board', () => {
  const p = { N: 2, K: 1, regions: [0, 0, 1, 1] };
  const touching = analyze([S, E, E, S], p);
  assert.ok(touching.anyBad);
  assert.deepEqual([...touching.bad], [1, 0, 0, 1]);
  assert.equal(touching.solved, false);
});

test('findHint fixes errors first', () => {
  const solution = [0, 3];
  assert.deepEqual(findHint([E, S, E, E], solution), { type: 'wrong-star', cell: 1 });
  assert.deepEqual(findHint([X, E, E, E], solution), { type: 'missing-star', cell: 0 });
  assert.equal(findHint([S, E, E, S], solution), null);
  assert.equal(findHint([S, E, E, E], solution).cell, 3);
});

test('hasPlayerInput ignores the automatic X marks', () => {
  assert.equal(hasPlayerInput([A, E]), false);
  assert.equal(hasPlayerInput([X, E]), true);
  assert.equal(hasPlayerInput([T, E]), true);
});

test('the test star counts as a star: automatic X marks, errors and win', () => {
  const m = [E, E, E, E, T, E, E, E, X];
  applyAutoX(m, 3, true);
  assert.deepEqual(m, [A, A, A, A, T, A, A, A, X]);
  const p = { N: 2, K: 1, regions: [0, 0, 1, 1] };
  assert.deepEqual([...analyze([T, E, E, S], p).bad], [1, 0, 0, 1]);
  assert.equal(analyze([E, T, E, E], { N: 2, K: 1, regions: [0, 1, 0, 1] }).solved, false);
  // tapping it with the normal tool turns it into a star
  assert.equal(nextMark(T), S);
  // the hint treats it as a misplaced star if it doesn't belong
  assert.deepEqual(findHint([E, T, E, E], [0, 3]), { type: 'wrong-star', cell: 1 });
});
