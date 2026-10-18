import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neighbours, drive, satisfies, countSolutions } from '../js/games/gears/engine/board.js';
import { generate, build, encode, decode, LEVEL_RULES } from '../js/games/gears/engine/generator.js';
import BANK from '../js/games/gears/engine/bank-data.js';
import { evaluate, isSolved, findMistake, findHint } from '../js/games/gears/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('neighbours: hexagons in offset rows (odd ones to the right)', () => {
  const nb = neighbours(3, 3);
  assert.deepEqual([...nb[4]].sort((a, b) => a - b), [1, 2, 3, 5, 7, 8]);   // centre, odd row
  assert.deepEqual([...nb[0]].sort((a, b) => a - b), [1, 3]);
  assert.ok(nb.every((list, i) => list.every(j => nb[j].includes(i))), 'symmetric');
});

test('turning: alternating directions and a jam with a cycle', () => {
  // 3 × 2: 0 and 1 on top, 3 below touches both → triangle
  const tri = [1, 1, 0, 1, 0, 0], chain = [1, 1, 1, 0, 0, 1];
  assert.equal(drive(3, 2, tri, 0).jam, true);
  const d = drive(3, 2, chain, 0);
  assert.equal(d.jam, false);
  assert.deepEqual([0, 1, 2, 5].map(i => d.spin[i]), [0, 1, 0, 1]);
});

/** Brute-force solutions (every combination of gears), to compare. */
function brute(p){
  const n = p.w * p.h, free = [...Array(n).keys()].filter(i => i !== p.crank && i !== p.lock && !p.fixed.includes(i) && p.clues[i] === undefined);
  let count = 0;
  for (let mask = 0; mask < 1 << free.length; mask++){
    const g = new Array(n).fill(0);
    for (const i of [p.crank, p.lock, ...p.fixed]) g[i] = 1;
    free.forEach((c, k) => { if (mask >> k & 1) g[c] = 1; });
    if (satisfies(p, g)) count++;
  }
  return count;
}

test('solver: counts the same as brute force on small puzzles', () => {
  // 4 × 3 with the crank on 4 and the lock on 7; the lock's direction, that of the straight chain 4-5-6-7
  const chain = new Array(12).fill(0);
  chain[4] = chain[5] = chain[6] = chain[7] = 1;
  const base = { w: 4, h: 3, crank: 4, lock: 7, fixed: [], clues: {}, spin: Array.from(drive(4, 3, chain, 4).spin) };
  assert.equal(countSolutions(base, 1000, 1e7), brute(base));
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 30; k++){
    const clues = {};
    for (const i of [0, 1, 2, 3, 8, 9, 10, 11]) if (rnd() < .35) clues[i] = Math.floor(rnd() * 3);
    const p = { ...base, clues, fixed: rnd() < .5 ? [5] : [] };
    assert.equal(countSolutions(p, 1000, 1e7), brute(p), JSON.stringify(p));
  }
});

for (const L of [1, 2, 3]){
  test(`generator level ${L}: size, clues and single solution`, () => {
    const p = runToEnd(build(L)), { w, h } = LEVEL_RULES[L];
    assert.equal(p.w, w); assert.equal(p.h, h);
    assert.equal(p.crank % w, 0, 'crank on the left');
    assert.equal(p.lock % w, w - 1, 'lock on the right');
    assert.ok(satisfies(p, p.solution), 'the solution satisfies the rules');
    assert.ok(p.fixed.length >= LEVEL_RULES[L].keepFixed || p.fixed.length === p.solution.filter(Boolean).length - 2);
    assert.equal(countSolutions(p, 2, 1e7), 1);
  });
}

test('bank: text round trip, and the other version is the same puzzle', () => {
  for (const L of [1, 2]){
    const p = runToEnd(build(L));
    assert.deepEqual(decode(encode(p), L), p);
    const t = decode(encode(p), L, { turn: true });
    assert.equal(t.crank % t.w, 0); assert.equal(t.lock % t.w, t.w - 1);
    assert.equal(t.fixed.length, p.fixed.length);
    assert.equal(Object.keys(t.clues).length, Object.keys(p.clues).length);
    assert.ok(satisfies(t, t.solution));
    assert.equal(countSolutions(t, 2, 1e7), 1);
    assert.deepEqual(decode(encode(t), L, { turn: true }).solution, p.solution);
  }
});

test('bank: every puzzle of every level is valid in both versions', () => {
  for (const L of [1, 3, 4]){
    const list = BANK[L], { w, h } = LEVEL_RULES[L];
    assert.ok(list?.length >= 100, `level ${L}: ${list?.length} puzzles`);
    assert.equal(new Set(list).size, list.length, 'no repeats');
    for (const text of list){
      assert.equal(text.length, w * h);
      for (const turn of [false, true]){
        const p = decode(text, L, { turn });
        assert.equal(p.crank % w, 0); assert.equal(p.lock % w, w - 1);
        assert.ok(satisfies(p, p.solution), text);
      }
    }
  }
  // the unique solution is proven again: for the small ones, all of them in both versions; for the big ones,
  // a few as computed (turned, the solver walks the panel in another order and takes longer)
  for (const L of [1]) for (const text of BANK[L]) for (const turn of [false, true]) assert.equal(countSolutions(decode(text, L, { turn }), 2, 1e7), 1, text);
  for (const L of [3, 4]) for (const text of BANK[L].slice(0, 5)) assert.equal(countSolutions(decode(text, L), 2, 3e7), 1, text);
});

test('generate takes the puzzles from the bank', () => {
  for (const L of [1, 4]){
    const p = runToEnd(generate(L));
    assert.ok(BANK[L].includes(encode(p)) || BANK[L].includes(encode(decode(encode(p), L, { turn: true }))));
  }
});

test('rules: solving, mistake and hint', () => {
  const p = runToEnd(generate(1)), n = p.w * p.h;
  const marks = new Array(n).fill(0);
  assert.equal(isSolved(p, marks), false);
  // using the hint again and again reaches the solution
  for (let k = 0; k < n && !isSolved(p, marks); k++){
    const i = findHint(p, marks);
    assert.ok(i >= 0);
    marks[i] = 1;
  }
  assert.ok(isSolved(p, marks));
  assert.equal(findMistake(p, marks), -1);
  // one gear too many: error
  const extra = marks.findIndex((m, i) => !p.solution[i] && p.clues[i] === undefined);
  if (extra >= 0){
    marks[extra] = 1;
    assert.equal(findMistake(p, marks), extra);
    assert.equal(isSolved(p, marks), false);
  }
  const e = evaluate(p, marks);
  assert.ok(e.on.has(p.crank));
});
