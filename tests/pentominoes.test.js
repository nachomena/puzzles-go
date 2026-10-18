import { test } from 'node:test';
import assert from 'node:assert/strict';
import { W, PIECES, ORIENTATIONS, orient, cellsOf } from '../js/games/pentominoes/engine/pieces.js';
import { countSolutions, solve } from '../js/games/pentominoes/engine/solver.js';
import { BLOCKS, challenge, nextChallenge, findRow } from '../js/games/pentominoes/engine/sets.js';
import { fits, isSolved, check, hintFrom, occupancy } from '../js/games/pentominoes/rules.js';
import meta, { challengeKey, solvedIn, rowName, levelOf } from '../js/games/pentominoes/meta.js';
import game from '../js/games/pentominoes/index.js';

const all = [...PIECES.keys()];
const byName = s => [...s].map(c => PIECES.findIndex(p => p.name === c));

test('pieces: 12 distinct pentominoes with 63 orientations in total', () => {
  assert.equal(PIECES.length, 12);
  assert.ok(PIECES.every(p => p.cells.length === 5));
  assert.equal(ORIENTATIONS.flat().length, 63);
  assert.equal(ORIENTATIONS[byName('X')[0]].length, 1);
  assert.equal(ORIENTATIONS[byName('I')[0]].length, 2);
  // flipping and turning back leaves the same mirrored shape
  const F = byName('F')[0], a = orient(F, 0, 1).cells, b = orient(F, 1, 3).cells;
  assert.deepEqual(b, a.map(([x, y]) => [orient(F, 0, 1).w - 1 - x, y]).sort((p, q) => p[1] - q[1] || p[0] - q[0]));
});

test('solver: 5 × 12 with the 12 pieces has 1010 solutions (4040 with their symmetries)', () => {
  assert.equal(countSolutions(all), 4040);
  assert.equal(countSolutions(byName('LYT')), 4);   // a single 5 × 3, with its 4 symmetries
  assert.equal(countSolutions(byName('XIL')), 0);
});

test('solver: respects the pieces already placed', () => {
  const pieces = challenge('slam', 'A', 5).pieces, sol = solve(pieces);
  const fixed = sol.slice(0, 2);
  const again = solve(pieces, fixed);
  assert.ok(again);
  for (const f of fixed) assert.deepEqual(again.find(s => s.piece === f.piece).pose, f.pose);
  const grid = new Array(W * 5).fill(0);
  for (const { piece, pose } of again) for (const c of cellsOf(piece, pose, 5)) grid[c]++;
  assert.ok(grid.every(n => n === 1));
});

test('series: 512 puzzles and all have a solution', () => {
  let total = 0;
  for (const L of meta.levelOrder){
    let n = 0;
    for (const b of meta.levels[L].parts.flatMap(part => BLOCKS[part])) for (const row of b.rows){
      assert.equal(row.pieces.length, b.to);
      assert.equal(new Set(row.pieces).size, b.to, `${L} ${row.label} has no repeated pieces`);
      for (let k = b.from; k <= b.to; k++){
        assert.ok(solve(row.pieces.slice(0, k)), `${L} ${row.label} ${k} pieces`);
        n++;
      }
    }
    assert.equal(n, meta.levels[L].total, L);
    total += n;
  }
  assert.equal(total, 512);
});

test('challenges: the next one adds a piece in the row and then moves on to the next row', () => {
  const a3 = challenge('small', 'A', 3), a4 = nextChallenge('small', 'A', 3);
  assert.deepEqual(a4.pieces.slice(0, 3), a3.pieces);
  assert.equal(a4.n, 4);
  const b = nextChallenge('small', 'A', 8);
  assert.equal(b.label, 'B'); assert.equal(b.n, 3);
  // from the first block of the series to the second (which starts at challenge 6)
  const o = nextChallenge('slam', 'N', 9);
  assert.equal(o.label, 'O'); assert.equal(o.n, 6);
  assert.equal(nextChallenge('challenge', '40', 10), null);
  assert.equal(challenge('small', 'A', 9), null);
  assert.equal(findRow('small', 'Z'), null);
});

test('rules: fitting, solving and hints without a single solution', () => {
  const p = challenge('small', 'A', 3), n = p.n, sol = solve(p.pieces);
  const place = PIECES.map(() => null);
  for (const { piece, pose } of sol.slice(0, 1)) place[piece] = pose;
  const [a, b] = [sol[1], sol[2]];
  assert.ok(fits(place, a.piece, a.pose, n));
  assert.equal(fits(place, a.piece, { ...a.pose, x: 9 }, n), false);
  // with what's placed right: there is a solution and the hint covers the first free cell
  const res = check(place, p.pieces);
  assert.ok(res.solution);
  const hint = hintFrom(place, p.pieces, res.solution);
  assert.ok(cellsOf(hint.piece, hint.pose, n).includes(occupancy(place, n).indexOf(-1)));
  place[a.piece] = a.pose; place[b.piece] = b.pose;
  assert.ok(isSolved(place, p.pieces));
});

test('rules: with a misplaced piece, the hint flags it', () => {
  const p = challenge('grand', 'A', 6), n = p.n, place = PIECES.map(() => null);
  // the row's first piece in a corner with no solution, if there is one
  for (const o of ORIENTATIONS[p.pieces[0]]){
    for (let y = 0; y <= n - o.h; y++) for (let x = 0; x <= W - o.w; x++){
      const pose = { m: o.m, r: o.r, x, y };
      if (!solve(p.pieces, [{ piece: p.pieces[0], pose }])){
        place[p.pieces[0]] = pose;
        assert.deepEqual(check(place, p.pieces), { mistake: p.pieces[0] });
        return;
      }
    }
  }
  assert.fail('no pose without a solution was found');
});

test('menu: three levels with their series, names and saved game', () => {
  assert.deepEqual([...meta.levelOrder], ['easy', 'hard', 'expert']);
  assert.deepEqual(meta.levelOrder.map(L => [meta.levels[L].name, meta.levels[L].total]), [['Fácil', 160], ['Difícil', 192], ['Experto', 160]]);
  assert.equal(levelOf('super'), 'hard');
  const stats = { [challengeKey('small', 'A', 3)]: { solved: 1 }, [challengeKey('slam', 'B', 6)]: { solved: 2 }, [challengeKey('grand', 'A', 5)]: { solved: 1 } };
  assert.equal(solvedIn('easy', stats), 2);
  assert.equal(meta.levelMeta('easy', stats), '2 de 160 resueltos');
  assert.equal(rowName('challenge', '12'), 'N° 12');
  assert.equal(rowName('grand', 'B'), '1B');
  assert.equal(rowName('super', 'B'), '2B');
  const s = { L: 'hard', p: { ...challenge('grand', 'B', 7), part: 'grand' }, place: PIECES.map(() => null), tm: [], tr: [], time: 3, done: false, hints: 0 };
  assert.equal(game.statsKey(s), 'grand:B:7');   // the same key as before: progress is kept
  assert.equal(meta.sessionLabel(s), 'Difícil 1B · 7 piezas');
  assert.equal(meta.resumeLabel(s), 'Difícil 1B · 7');
  assert.ok(game.restoreSession(structuredClone(s)));
  const bad = structuredClone(s);
  bad.place[s.p.pieces[0]] = { m: 0, r: 0, x: 4, y: 0 };   // it goes off the right side
  assert.equal(game.restoreSession(bad), null);
  assert.equal(game.restoreSession({ ...structuredClone(s), p: { label: 'Z', n: 7, part: 'grand' } }), null);
  assert.equal(game.restoreSession({ ...structuredClone(s), p: { ...s.p, part: 'small' } }), null);   // a series from another level
  assert.deepEqual(game.picker.puzzle('hard', { part: 'grand', row: 'B', n: '7' }), s.p);
  assert.equal(game.picker.puzzle('easy', { part: 'grand', row: 'B', n: '7' }), null);
  assert.ok(game.picker.same(s, { ...challenge('grand', 'B', 7), part: 'grand' }));
  assert.ok(!game.picker.same(s, { ...challenge('super', 'B', 7), part: 'super' }));
});

test('saved game with the series as level (before the three levels): it moves to its level', () => {
  const old = { L: 'grand', p: challenge('grand', 'B', 7), place: PIECES.map(() => null), tm: [], tr: [], time: 3, done: false, hints: 0 };
  assert.equal(meta.resumeLabel(old), 'Difícil 1B · 7');   // the picker reads it without being passed it
  const s = game.restoreSession(meta.upgradeSession(structuredClone(old)));
  assert.equal(s.L, 'hard');
  assert.equal(s.p.part, 'grand');
  assert.equal(game.statsKey(s), 'grand:B:7');
});
