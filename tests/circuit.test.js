import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, CELLS, W, H } from '../js/games/circuit/engine/pieces.js';
import { solve, orient, faceCount } from '../js/games/circuit/engine/solver.js';
import { arrangements, matching, lookKey } from '../js/games/circuit/engine/arrangements.js';
import { generate, LEVEL_RULES } from '../js/games/circuit/engine/generator.js';
import { isSolved, findMistake, findHint, fits, brokenEnds, cellsOf } from '../js/games/circuit/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('the 10 pieces cover the board and have 10 sides with a dot', () => {
  assert.equal(PIECES.length, 10);
  assert.equal(PIECES.reduce((n, p) => n + p.faces[0].cells.length, 0), CELLS);
  assert.equal(PIECES.flatMap(p => p.faces).filter(f => f.dots.length).length, 10);
  assert.equal(PIECES.filter(p => p.blank).length, 4, 'dominoes and the straight three with a blank side');
});

test('orient: turning 4 times gives back the same piece; blank sides have no path', () => {
  PIECES.forEach((_, piece) => {
    for (let face = 0; face < faceCount(piece); face++){
      const a = orient(piece, face, 0), b = orient(piece, face, 0);
      assert.deepEqual(a.cells, b.cells);
      if (face === 2) assert.ok(a.masks.every(m => m === 0) && a.dots.size === 0);
    }
  });
});

test('the precomputed list: 732 placements, all valid and distinct', () => {
  const list = arrangements();
  assert.equal(list.length, 732);
  assert.equal(new Set(list.map(a => [...a.keys].sort().join('|'))).size, 732);
  for (const a of list.slice(0, 20)){
    assert.ok([2, 4, 6, 8].includes(a.dots.length));
    // the solver confirms it is valid with its path and dots
    assert.equal(solve({ dots: a.dots, masks: a.mask }, { limit: 1 }).count, 1);
  }
});

for (const level of [1, 2, 3, 4, 5]){
  test(`generate(${level}) gives a single-solution puzzle with the level's clues`, () => {
    const p = runToEnd(generate(level)), rules = LEVEL_RULES[level];
    assert.ok(p);
    assert.equal(p.show.masks, rules.masks);
    assert.equal(p.show.regions, rules.regions);
    assert.ok(p.fixed.length >= rules.fixed[0] && p.fixed.length <= rules.fixed[1]);
    const ref = arrangements().find(a => p.solution.every(s => a.keys.has(lookKey(s))));
    const fixed = p.fixed.map(i => p.solution[i]);
    assert.equal(matching({ dots: p.dots, masks: p.show.masks, regions: p.show.regions, fixed }, ref).length, 1);
    if (level === 5) assert.equal(solve({ dots: p.dots }, { limit: 2 }).count, 1, 'the solver confirms it');
  });
}

test('rules: solved, errors, hint and cut-off exits', () => {
  const p = runToEnd(generate(5));
  const toPos = s => { const o = orient(s.piece, s.face, s.rot); return { face: s.face, rot: s.rot, x: s.cell % W - o.cells[0][0], y: ((s.cell / W) | 0) - o.cells[0][1] }; };
  const solved = p.solution.map(toPos);
  assert.ok(isSolved(solved, p.solution));
  assert.deepEqual(brokenEnds(solved), [], 'no path is cut off in the solution');
  const partial = solved.map(() => null);
  const hint = findHint(partial, p.solution);
  assert.ok(hint && fits(partial, hint.piece, hint.pos));
  // a piece moved somewhere else is flagged as an error
  const one = partial.slice();
  for (let y = 0; y < H && !one[0]; y++) for (let x = 0; x < W && !one[0]; x++){
    const pos = { ...solved[0], x, y };
    if ((x !== solved[0].x || y !== solved[0].y) && cellsOf(0, pos)) one[0] = pos;
  }
  assert.deepEqual(findMistake(one, p.solution, []), { piece: 0 });
});

test('a symmetric piece turned 180° (it looks the same) also counts as solved', () => {
  const sig = o => JSON.stringify([o.cells, o.masks, [...o.dots].sort()]);
  let checked = 0;
  for (const a of arrangements().slice(0, 60)){
    const toPos = s => { const o = orient(s.piece, s.face, s.rot); return { face: s.face, rot: s.rot, x: s.cell % W - o.cells[0][0], y: ((s.cell / W) | 0) - o.cells[0][1] }; };
    const place = [];
    for (const s of a.pieces) place[s.piece] = toPos(s);
    for (const s of a.pieces){
      const same = [0, 1, 2, 3].filter(r => r !== s.rot && sig(orient(s.piece, s.face, r)) === sig(orient(s.piece, s.face, s.rot)));
      for (const rot of same){
        const alt = place.slice();
        alt[s.piece] = { ...place[s.piece], rot };
        assert.ok(isSolved(alt, a.pieces));
        checked++;
      }
    }
  }
  assert.ok(checked > 0);
});
