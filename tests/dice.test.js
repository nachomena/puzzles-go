import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, PIECE_TYPES, shape, FACES, CELLS } from '../js/games/dice/engine/pieces.js';
import { solve, diceValues } from '../js/games/dice/engine/solver.js';
import { arrangements, matching } from '../js/games/dice/engine/arrangements.js';
import { generate, LEVEL_RULES } from '../js/games/dice/engine/generator.js';
import { evaluate, isSolved, findHint, findMistake, fits } from '../js/games/dice/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('the 12 pieces exactly cover the board and have 12 dots', () => {
  assert.equal(PIECES.length, 12);
  const area = PIECES.reduce((n, t) => n + PIECE_TYPES[t].cells.length, 0);
  const dots = PIECES.reduce((n, t) => n + PIECE_TYPES[t].dots.length, 0);
  assert.equal(area, CELLS);
  assert.equal(dots, 12);
  assert.equal(PIECES.filter(t => !PIECE_TYPES[t].dots.length).length, 4, '4 blank pieces');
});

test('turning 4 times leaves the piece the same and the dots stay inside', () => {
  PIECE_TYPES.forEach((_, type) => {
    assert.deepEqual(shape(type, 4 % 4), shape(type, 0));
    for (let rot = 0; rot < 4; rot++){
      const s = shape(type, rot), inside = new Set(s.cells.map(p => p.join()));
      s.dots.forEach(d => assert.ok(inside.has(d.join())));
    }
  });
});

test('valid faces: 1 to 6 in every orientation', () => {
  assert.deepEqual([...new Set(FACES.values())].sort(), [1, 2, 3, 4, 5, 6]);
  assert.equal(FACES.size, 9);
});

test('the precomputed list matches the solver', () => {
  const { list } = arrangements();
  assert.equal(list.length, 6288);
  for (const a of list.slice(0, 50)){
    assert.deepEqual(diceValues(a.pieces), a.dice);
    assert.ok(a.dice.every(v => v >= 1));
    assert.equal(a.dice.reduce((x, y) => x + y), 12, 'the dice always add up to 12');
  }
});

for (const level of [1, 2, 3, 4, 5]){
  test(`generate(${level}) follows the level's clues and has a single solution`, () => {
    const p = runToEnd(generate(level));
    assert.ok(p);
    const rules = LEVEL_RULES[level];
    const arrows = [...p.arrows.rows, ...p.arrows.cols].filter(x => x != null).length;
    assert.ok(arrows >= rules.arrows[0] && arrows <= rules.arrows[1], 'arrows');
    assert.ok(p.fixed.length >= rules.pieces[0] && p.fixed.length <= rules.pieces[1], 'pieces');
    const fixed = p.fixed.map(i => p.solution[i]);
    assert.equal(matching(fixed, p.arrows).length, 1);
    assert.equal(solve({ fixed, arrows: p.arrows }, { limit: 2 }).count, 1, 'the solver confirms it');
  });
}

test('rules: solving, errors and hint', () => {
  const p = runToEnd(generate(1));
  const solved = p.solution.map(({ rot, r, c }) => ({ rot, r, c }));
  assert.ok(isSolved(solved, p.arrows));
  assert.ok(evaluate(solved, p.arrows).dice.every(d => d.full && d.value));

  const partial = solved.map((pos, i) => p.fixed.includes(i) ? pos : null);
  assert.ok(!isSolved(partial, p.arrows));
  const hint = findHint(partial, p.solution, p.fixed);
  assert.ok(hint && !p.fixed.includes(hint.piece));
  assert.ok(fits(partial, hint.piece, hint.pos), 'the hint fits');
  assert.equal(findHint(solved, p.solution, p.fixed), null, 'solved: no hint');
});


test('findMistake flags a misplaced piece before giving a hint', () => {
  const p = runToEnd(generate(1));
  const solved = p.solution.map(({ rot, r, c }) => ({ rot, r, c }));
  assert.equal(findMistake(solved, p.solution, p.fixed), null, 'all good: no mistake');
  // Only the fixed pieces are kept, plus one movable piece shifted to a spot that isn't its own
  const place = solved.map((pos, i) => p.fixed.includes(i) ? pos : null);
  const piece = p.solution.find(s => !p.fixed.includes(s.piece)).piece;
  // (with any turn: with the solution's one sometimes no free gap is left)
  for (let rot = 0; rot < 4 && !place[piece]; rot++)
  for (let r = 0; r < 6 && !place[piece]; r++) for (let c = 0; c < 6 && !place[piece]; c++){
    const pos = { rot: (p.solution[piece].rot + rot) % 4, r, c };
    const isSolutionSpot = p.solution.some(s => s.type === p.solution[piece].type && s.r === r && s.c === c);
    if (!isSolutionSpot && fits(place, piece, pos)) place[piece] = pos;
  }
  assert.ok(place[piece], 'there is room to misplace it');
  assert.deepEqual(findMistake(place, p.solution, p.fixed), { piece });
});
