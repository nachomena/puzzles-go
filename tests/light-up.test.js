import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WHITE, BLACK, sight, lit, countSolutions } from '../js/games/light-up/engine/light.js';
import { generate, LEVEL_RULES } from '../js/games/light-up/engine/generator.js';
import { evaluate, isSolved, findMistake, findHint } from '../js/games/light-up/rules.js';
import { runToEnd } from '../js/lib/iter.js';

const W = WHITE, B = BLACK;

test('light: a bulb sees its row and column up to a black cell', () => {
  // 3 × 3 with the black cell in the centre
  const cells = [W, W, W, W, B, W, W, W, W];
  assert.deepEqual(sight(3, cells, 0).sort(), [1, 2, 3, 6]);
  const on = lit(3, cells, [1, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.equal([...on].filter(Boolean).length, 8);
});

/** Brute-force solutions (every combination of bulbs), to compare. */
function brute(n, cells){
  const white = cells.map((v, i) => v === W ? i : -1).filter(i => i >= 0);
  let count = 0;
  for (let mask = 0; mask < 1 << white.length; mask++){
    const marks = new Array(n * n).fill(0);
    white.forEach((c, k) => { if (mask >> k & 1) marks[c] = 1; });
    if (isSolved(n, cells, marks)) count++;
  }
  return count;
}

test('solver: counts the same as brute force on small boards', () => {
  assert.equal(countSolutions(3, [W, W, W, W, B, W, W, W, W], { limit: 100 }), brute(3, [W, W, W, W, B, W, W, W, W]));
  assert.equal(countSolutions(3, [W, W, W, W, 4, W, W, W, W], { limit: 100 }), 1);   // a bulb on each side of the 4
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 40; k++){
    const n = 4, cells = Array.from({ length: n * n }, () => rnd() < .25 ? (rnd() < .5 ? B : Math.floor(rnd() * 3)) : W);
    assert.equal(countSolutions(n, cells, { limit: 1000 }), brute(n, cells), JSON.stringify(cells));
  }
});

test('generator: every level gives a single-solution puzzle', () => {
  for (const L of [1, 2, 3, 4]){
    const p = runToEnd(generate(L));
    assert.ok(p && p.n === LEVEL_RULES[L].n, `level ${L}`);
    assert.equal(countSolutions(p.n, p.cells), 1);
    assert.ok(isSolved(p.n, p.cells, p.solution));
  }
});

test('rules: clashes, numbers exceeded, mistake and hint', () => {
  const p = runToEnd(generate(1)), n = p.n, marks = new Array(n * n).fill(0);
  const bulb = p.solution.findIndex(Boolean);
  assert.equal(findHint(marks, p.solution), bulb);
  const wrong = p.solution.findIndex((v, i) => !v && p.cells[i] === W);
  marks[wrong] = 1;
  assert.equal(findMistake(marks, p.solution), wrong);
  // two bulbs in the same row with no black cell between them clash
  const cells = [W, W, W, B, B, B, B, B, B], r = evaluate(3, cells, [1, 0, 1, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual([...r.clash].slice(0, 3), [1, 0, 1]);
  assert.equal(isSolved(n, p.cells, p.solution.map(v => v ? 1 : 0)), true);
});

test('numbers that can no longer be met: too many, or no room for the missing ones', () => {
  //  W W W      the 1 (centre) only has one white neighbour: the top one (1)
  //  B 1 B
  //  B B B
  const cells = [W, W, W, B, 1, B, B, B, B], m = (...on) => { const a = new Array(9).fill(0); on.forEach(([i, v]) => a[i] = v); return a; };
  assert.equal(evaluate(3, cells, m()).over[4], 0, 'with nothing, it still can');
  assert.equal(evaluate(3, cells, m([1, 1])).over[4], 0, 'with its bulb, it is met');
  assert.equal(evaluate(3, cells, m([0, 1])).over[4], 1, 'a bulb in the corner lights the only neighbour: it no longer can');
  assert.equal(evaluate(3, cells, m([1, 2])).over[4], 1, 'the only neighbour marked with a dot: it no longer can');
  // the solution marks nothing
  const p = runToEnd(generate(1));
  assert.ok(!evaluate(p.n, p.cells, p.solution.map(v => v ? 1 : 0)).over.some(Boolean));
});
