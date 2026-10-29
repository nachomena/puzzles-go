import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, CELLS, SECTORS, RIB_PATTERN, ribsAt, cellsOf, crossesRib, bonds, poses, cell } from '../js/games/circle/engine/pieces.js';
import { solveAll } from '../js/games/circle/engine/solver.js';
import { baseSolutions, allSolutions, ownerOf } from '../js/games/circle/engine/solutions.js';
import { generate, matching, LEVEL_RULES } from '../js/games/circle/engine/generator.js';
import { fits, isSolved, findMistake, findHint, blockedBy, ribsWork } from '../js/games/circle/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('pieces: 10 connected pieces that fill the 42 holes; 4 ribs', () => {
  assert.equal(PIECES.length, 10);
  assert.equal(PIECES.reduce((n, p) => n + p.balls.length, 0), CELLS);
  PIECES.forEach((p, i) => assert.equal(bonds(i).length >= p.balls.length - 1, true, `piece ${p.id} connected`));
  assert.equal(RIB_PATTERN.length, 4);
  assert.deepEqual(ribsAt(5), [5, 8, 11, 1]);
  // a rib only splits the outer ring
  assert.ok(crossesRib([cell(2, 0), cell(2, 1)], [0]));
  assert.ok(!crossesRib([cell(1, 0), cell(1, 1)], [0]));
});

test('precomputed solutions: 322, all valid and distinct, and they match the solver', () => {
  const base = baseSolutions();
  assert.equal(base.length, 322);
  const keys = new Set();
  for (const sol of base){
    const owner = ownerOf(sol);
    assert.ok(owner.every(p => p >= 0), 'fills everything');
    assert.ok(sol.every((pose, p) => !crossesRib(cellsOf(p, pose), ribsAt(0))), 'crosses no rib');
    keys.add(owner.join());
  }
  assert.equal(keys.size, 322);
  assert.equal(solveAll(ribsAt(0)), 322);
  assert.equal(allSolutions().length, 322 * SECTORS);
});

test("generator: every level gives a puzzle with a unique placement and the level's clues", () => {
  for (const L of [1, 2, 3, 4, 5]){
    for (let n = 0; n < 4; n++){
      const p = runToEnd(generate(L)), rules = LEVEL_RULES[L];
      assert.ok(p, `level ${L}`);
      assert.ok(p.fixed.length >= rules.fixed[0] && p.fixed.length <= rules.fixed[1]);
      const ref = allSolutions().find(a => a.o === p.o && a.poses.every((q, i) => q.m === p.solution[i].m && q.s === p.solution[i].s));
      assert.ok(ref, 'the solution exists');
      const clues = { o: p.ribsFixed ? p.o : undefined, marks: p.marks, fixed: p.fixed };
      assert.equal(new Set(matching(clues, ref).map(a => a.key)).size, 1, 'unique');
      if (L <= 3){ assert.equal(p.o, 0); assert.equal(p.marks.length, RIB_PATTERN.length); }
      if (L === 5) assert.equal(p.marks.length, 0);
    }
  }
});

test('rules: fitting, ribs, solved, mistake and hint', () => {
  const sol = baseSolutions()[0], place = PIECES.map(() => null);
  assert.ok(!isSolved(place, sol));
  place[0] = sol[0];
  assert.ok(fits(place, 1, sol[1], 0));
  assert.ok(!fits(place, 1, sol[0], 0), "doesn't overlap another piece");
  // a piece with two neighbouring big balls can't cross a rib
  const C = PIECES.findIndex(p => p.id === 'B');
  const across = poses(C).find(pose => crossesRib(cellsOf(C, pose), ribsAt(0)));
  assert.ok(!fits(PIECES.map(() => null), C, across, 0));
  assert.deepEqual(blockedBy([...PIECES.map(() => null)].map((_, p) => p === C ? across : null), 0), [C]);
  const full = sol.map(p => ({ ...p }));
  assert.ok(isSolved(full, sol));
  const wrong = full.slice(); wrong[1] = { m: -sol[1].m, s: (sol[1].s + 3) % SECTORS };
  assert.deepEqual(findMistake(wrong, sol, [0]), { piece: 1 });
  assert.equal(findMistake(full, sol, []), null);
  assert.ok(ribsWork(0, sol, []));
  const h = findHint(place, sol, { ro: 0, o: 0, marks: [] });
  assert.ok(h.piece >= 1 && h.pose);
  // if the ribs are turned wrong, the hint places them first
  const bad = [...Array(SECTORS).keys()].find(ro => !ribsWork(ro, sol, []));
  assert.deepEqual(findHint(place, sol, { ro: bad, o: 0, marks: [] }), { ro: 0 });
});
