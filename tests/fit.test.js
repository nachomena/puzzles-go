import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, ALL, CELLS, packer, cellsOf, poseFromCells } from '../js/games/fit/engine/pieces.js';
import { generate, LEVEL_RULES, isUnique } from '../js/games/fit/engine/generator.js';
import { fits, isSolved, findMistake, findHint, inPlace } from '../js/games/fit/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('pieces: 12, with 55 balls in total (the 11 × 5 board)', () => {
  assert.equal(PIECES.length, 12);
  assert.equal(PIECES.reduce((n, p) => n + p.cells.length, 0), CELLS);
  for (const piece of ALL){
    const pose = packer.orientations[piece][1] || packer.orientations[piece][0];
    const p = { m: pose.m, r: pose.r, x: 2, y: 1 };
    assert.deepEqual(poseFromCells(piece, packer.cellsOf(piece, p)) && cellsOf(piece, poseFromCells(piece, packer.cellsOf(piece, p))), cellsOf(piece, p));
  }
});

test("generator: every level gives a single-solution puzzle with the level's pieces", () => {
  for (const L of [1, 2, 3, 4, 5]) for (let k = 0; k < 3; k++){
    const p = runToEnd(generate(L)), [min, max] = LEVEL_RULES[L].fixed;
    assert.ok(p, `level ${L}`);
    assert.ok(p.fixed.length >= min && p.fixed.length <= max);
    assert.ok(isUnique(p.fixed.map(piece => ({ piece, pose: p.solution[piece] }))));
    const seen = new Set();
    p.solution.forEach((pose, piece) => cellsOf(piece, pose).forEach(c => seen.add(c)));
    assert.equal(seen.size, CELLS);
  }
});

test('rules: fitting, mistake, hint and solved', () => {
  const p = runToEnd(generate(3)), sol = p.solution;
  const place = ALL.map(piece => p.fixed.includes(piece) ? sol[piece] : null);
  const free = ALL.find(piece => !p.fixed.includes(piece));
  assert.ok(fits(place, free, sol[free]));
  const hint = findHint(place, sol);
  assert.ok(hint && inPlace(hint.piece, hint.pose, sol));
  // a misplaced piece: where it doesn't go (another position where it fits)
  const wrong = packer.orientations[free].map(o => ({ m: o.m, r: o.r, x: 0, y: 0 }))
    .flatMap(o => [...Array(11)].flatMap((_, x) => [...Array(5)].map((_, y) => ({ ...o, x, y }))))
    .find(pose => cellsOf(free, pose) && fits(place, free, pose) && !inPlace(free, pose, sol));
  place[free] = wrong;
  assert.deepEqual(findMistake(place, sol, p.fixed), { piece: free });
  assert.equal(isSolved(place), false);
  assert.ok(isSolved(sol));
});
