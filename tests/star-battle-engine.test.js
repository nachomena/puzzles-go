import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, solve, logic, grade } from '../js/games/star-battle/engine/index.js';
import { rowMasks, rowsToCells } from '../js/games/star-battle/engine/bits.js';
import { popcount } from '../js/lib/bits.js';
import { runToEnd } from '../js/lib/iter.js';
import { BOARD } from '../js/games/star-battle/config.js';

const { size: N, stars: K } = BOARD;

test('rowMasks: K stars per row and never adjacent', () => {
  const masks = rowMasks(N, K);
  assert.ok(masks.length > 0);
  for (const m of masks){
    assert.equal(popcount(m), K);
    assert.equal(m & (m << 1), 0);
  }
});

test('rowsToCells turns masks into indices', () => {
  assert.deepEqual(rowsToCells(4, [0b0101, 0b1000]), [0, 2, 7]);
});

for (const target of [1, 2]){
  test(`generate(${target}) returns a valid single-solution board`, () => {
    const p = runToEnd(generate(target));
    assert.ok(p, 'a board is generated');
    assert.equal(p.N, N); assert.equal(p.K, K);
    assert.equal(p.regions.length, N * N);
    assert.equal(p.solution.length, N * K);

    const res = solve(N, K, p.regions, 2, 1e7);
    assert.equal(res.count, 1, 'single solution');
    assert.deepEqual(rowsToCells(N, res.sols[0]), [...p.solution].sort((a, b) => a - b));

    assert.equal(grade(N, K, p.regions), p.level, 'the level matches the grading');
    assert.ok(logic(N, K, p.regions, p.level).solved);
  });
}
