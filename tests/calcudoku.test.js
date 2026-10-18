import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latin, evaluate, partition, countSolutions } from '../js/games/calcudoku/engine/cages.js';
import { generate, LEVEL_RULES } from '../js/games/calcudoku/engine/generator.js';
import { peers, conflicts, cageLabel, findHint } from '../js/games/calcudoku/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('latin square: 1 to n with no repeats per row or column', () => {
  for (const n of [4, 5, 6, 7]){
    const g = latin(n);
    for (let k = 0; k < n; k++){
      assert.equal(new Set(g.slice(k * n, k * n + n)).size, n);
      assert.equal(new Set([...Array(n).keys()].map(r => g[r * n + k])).size, n);
    }
  }
});

test('operations: −, ÷ only with two cells and from larger to smaller', () => {
  assert.equal(evaluate('+', [1, 2, 3]), 6);
  assert.equal(evaluate('*', [2, 3, 4]), 24);
  assert.equal(evaluate('-', [2, 5]), 3);
  assert.equal(evaluate('/', [2, 6]), 3);
  assert.equal(evaluate('/', [4, 6]), null);
  assert.equal(evaluate('-', [1, 2, 3]), null);
  assert.equal(evaluate('', [4]), 4);
  assert.equal(cageLabel({ op: '*', target: 12 }), '12×');
  assert.equal(cageLabel({ op: '', target: 3 }), '3');
});

test('cages: cover the board without overlapping and are connected', () => {
  const { cages } = partition(6, [2, 3, 4]);
  const seen = new Set(cages.flat());
  assert.equal(seen.size, 36);
  assert.equal(cages.flat().length, 36);
});

test('generator: every level gives a single-solution puzzle', () => {
  for (const L of [1, 2, 3, 4, 5]){
    const p = runToEnd(generate(L)), { n, ops } = LEVEL_RULES[L];
    assert.ok(p && p.n === n, `level ${L}`);
    assert.equal(countSolutions(n, p.cages), 1);
    for (const c of p.cages){
      assert.ok(c.op === '' || ops.includes(c.op));
      assert.equal(evaluate(c.op, c.cells.map(i => p.solution[i])), c.target);
    }
  }
});

test("rules: repeats, a full cage that doesn't add up, and hint", () => {
  const p = runToEnd(generate(1)), n = p.n, values = new Array(n * n).fill(0);
  assert.equal(peers(4, 5).length, 6);
  values[0] = 1; values[1] = 1;
  const bad = conflicts(n, p.cages, values);
  assert.equal(bad[0] + bad[1], 2);
  const h = findHint(n, p.cages, p.solution.map(() => 0), p.solution);
  assert.ok(h && h.digit === p.solution[h.cell]);
  assert.equal(conflicts(n, p.cages, p.solution).some(Boolean), false);
});
