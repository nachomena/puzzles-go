import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, CELLS, SECTORS, RIB_PATTERN, ribsAt, cellsOf, crossesRib, bonds, poses, cell } from '../js/games/smart-circle/engine/pieces.js';
import { solveAll } from '../js/games/smart-circle/engine/solver.js';
import { baseSolutions, allSolutions, ownerOf } from '../js/games/smart-circle/engine/solutions.js';
import { generate, matching, LEVEL_RULES } from '../js/games/smart-circle/engine/generator.js';
import { fits, isSolved, findMistake, findHint, blockedBy, ribsWork } from '../js/games/smart-circle/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('piezas: 10 piezas conexas que suman los 48 agujeros; 5 nervios', () => {
  assert.equal(PIECES.length, 10);
  assert.equal(PIECES.reduce((n, p) => n + p.balls.length, 0), CELLS);
  PIECES.forEach((p, i) => assert.equal(bonds(i).length >= p.balls.length - 1, true, `pieza ${p.id} conexa`));
  assert.equal(RIB_PATTERN.length, 5);
  assert.deepEqual(ribsAt(3), [3, 6, 8, 12, 0]);
  // un nervio solo separa el anillo de fuera
  assert.ok(crossesRib([cell(2, 0), cell(2, 1)], [0]));
  assert.ok(!crossesRib([cell(1, 0), cell(1, 1)], [0]));
});

test('soluciones precalculadas: 274, todas válidas y distintas, y coinciden con el solucionador', () => {
  const base = baseSolutions();
  assert.equal(base.length, 274);
  const keys = new Set();
  for (const sol of base){
    const owner = ownerOf(sol);
    assert.ok(owner.every(p => p >= 0), 'llena todo');
    assert.ok(sol.every((pose, p) => !crossesRib(cellsOf(p, pose), ribsAt(0))), 'no cruza nervios');
    keys.add(owner.join());
  }
  assert.equal(keys.size, 274);
  assert.equal(solveAll(ribsAt(0)), 274);
  assert.equal(allSolutions().length, 274 * SECTORS);
});

test('generador: cada nivel da un reto con colocación única y las pistas del nivel', () => {
  for (const L of [1, 2, 3, 4, 5]){
    for (let n = 0; n < 4; n++){
      const p = runToEnd(generate(L)), rules = LEVEL_RULES[L];
      assert.ok(p, `nivel ${L}`);
      assert.ok(p.fixed.length >= rules.fixed[0] && p.fixed.length <= rules.fixed[1]);
      const ref = allSolutions().find(a => a.o === p.o && a.poses.every((q, i) => q.m === p.solution[i].m && q.s === p.solution[i].s));
      assert.ok(ref, 'la solución existe');
      const clues = { o: p.ribsFixed ? p.o : undefined, marks: p.marks, fixed: p.fixed };
      assert.equal(new Set(matching(clues, ref).map(a => a.key)).size, 1, 'única');
      if (L <= 3){ assert.equal(p.o, 0); assert.equal(p.marks.length, 5); }
      if (L === 5) assert.equal(p.marks.length, 0);
    }
  }
});

test('reglas: encajar, nervios, resuelto, error y pista', () => {
  const sol = baseSolutions()[0], place = PIECES.map(() => null);
  assert.ok(!isSolved(place, sol));
  place[0] = sol[0];
  assert.ok(fits(place, 1, sol[1], 0));
  assert.ok(!fits(place, 1, sol[0], 0), 'no pisa otra pieza');
  // una pieza con dos bolas grandes vecinas no puede cruzar un nervio
  const C = PIECES.findIndex(p => p.id === 'C');
  const across = poses(C).find(pose => crossesRib(cellsOf(C, pose), ribsAt(0)));
  assert.ok(!fits(PIECES.map(() => null), C, across, 0));
  assert.deepEqual(blockedBy([...PIECES.map(() => null)].map((_, p) => p === C ? across : null), 0), [C]);
  const full = sol.map(p => ({ ...p }));
  assert.ok(isSolved(full, sol));
  const wrong = full.slice(); wrong[1] = { m: -sol[1].m, s: (sol[1].s + 3) % 16 };
  assert.deepEqual(findMistake(wrong, sol, [0]), { piece: 1 });
  assert.equal(findMistake(full, sol, []), null);
  assert.ok(ribsWork(0, sol, []));
  const h = findHint(place, sol, { ro: 0, o: 0, marks: [] });
  assert.ok(h.piece >= 1 && h.pose);
  // si los nervios están mal girados, la pista los coloca primero
  const bad = [...Array(16).keys()].find(ro => !ribsWork(ro, sol, []));
  assert.deepEqual(findHint(place, sol, { ro: bad, o: 0, marks: [] }), { ro: 0 });
});
