import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conflicts, isSolved, digitCounts, clearNoteAround, findHint } from '../js/games/sudoku/rules.js';
import { PEERS, bit } from '../js/games/sudoku/engine/grid.js';

const empty = () => new Array(81).fill(0);

test('conflicts marca los repetidos en fila, columna y caja', () => {
  const v = empty();
  v[0] = 5; v[8] = 5;      // misma fila
  v[40] = 3; v[76] = 3;    // misma columna (4)
  v[60] = 7; v[80] = 7;    // misma caja
  v[30] = 5;               // sin conflicto
  const bad = conflicts(v);
  assert.deepEqual([...bad.keys()].filter(i => bad[i]), [0, 8, 40, 60, 76, 80]);
});

test('digitCounts e isSolved', () => {
  const v = empty(); v[0] = 1; v[1] = 1; v[2] = 9;
  const c = digitCounts(v);
  assert.equal(c[1], 2); assert.equal(c[9], 1); assert.equal(c[5], 0);
  assert.ok(isSolved([1, 2], [1, 2]));
  assert.ok(!isSolved([1, 0], [1, 2]));
});

test('clearNoteAround quita la nota solo en las casillas que se ven', () => {
  const notes = new Array(81).fill(bit(4) | bit(7));
  clearNoteAround(notes, 40, 4);
  for (const p of PEERS[40]) assert.equal(notes[p], bit(7));
  assert.equal(notes[0], bit(4) | bit(7), 'una casilla que no ve a 40 no cambia');
});

test('findHint señala primero el número equivocado', () => {
  const solution = [...Array(81)].map((_, i) => (i % 9) + 1);
  const values = empty(); values[3] = 9;
  assert.deepEqual(findHint(values, solution), { type: 'wrong', cell: 3 });
  const full = solution.slice();
  assert.equal(findHint(full, solution), null);
  full[10] = 0;
  const h = findHint(full, solution);
  assert.equal(h.type, 'place'); assert.equal(h.cell, 10); assert.equal(h.digit, solution[10]);
});

import { findMistake } from '../js/games/sudoku/rules.js';
test('findMistake de Sudoku: el primer número equivocado', () => {
  const solution = [...Array(81)].map((_, i) => (i % 9) + 1);
  const values = new Array(81).fill(0); values[5] = solution[5]; values[7] = 1;
  assert.deepEqual(findMistake(values, solution), { type: 'wrong', cell: 7 });
  values[7] = 0;
  assert.equal(findMistake(values, solution), null);
});
