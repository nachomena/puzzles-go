import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, CELLS, POSTS, SYMMETRIES, cellsOf, bonds, allPlacements } from '../js/games/smart-hexagon/engine/pieces.js';
import { allSolutions } from '../js/games/smart-hexagon/engine/solutions.js';
import { TOTAL } from '../js/games/smart-hexagon/engine/solutions-data.js';
import { generate, matching, LEVEL_RULES } from '../js/games/smart-hexagon/engine/generator.js';
import { fits, isSolved, findMistake, findHint } from '../js/games/smart-hexagon/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('tablero y piezas: 19 clavijas, 72 puntos; las 12 piezas los llenan y son trazos unidos', () => {
  assert.equal(POSTS.length, 19);
  assert.equal(CELLS, 72);
  assert.equal(PIECES.length, 12);
  assert.equal(PIECES.reduce((n, p) => n + p.pts.length, 0), CELLS);
  PIECES.forEach((p, i) => assert.ok(bonds(i).length >= p.pts.length - 1, `pieza ${p.id} unida`));
  assert.equal(SYMMETRIES.length, 12);
  for (const perm of SYMMETRIES) assert.equal(new Set(perm).size, CELLS, 'cada simetría es una permutación');
});

test('soluciones: 8124, todas distintas y llenan el tablero sin solaparse', () => {
  const all = allSolutions();
  assert.equal(all.length, TOTAL);
  assert.equal(TOTAL, 8124);
  assert.equal(new Set(all.map(a => a.key)).size, TOTAL);
  for (const a of all.slice(0, 500)){
    const seen = new Uint8Array(CELLS);
    a.poses.forEach((pose, p) => { for (const c of cellsOf(p, pose)) seen[c]++; });
    assert.ok(seen.every(n => n === 1));
  }
  assert.ok(allPlacements().every(ps => ps.length > 0));
});

test('generador: cada nivel da un reto de solución única con las piezas del nivel', () => {
  for (const L of [1, 2, 3, 4, 5]) for (let n = 0; n < 4; n++){
    const p = runToEnd(generate(L)), [min, max] = LEVEL_RULES[L].fixed;
    assert.ok(p, `nivel ${L}`);
    assert.ok(p.fixed.length >= min && p.fixed.length <= max);
    const ref = allSolutions().find(a => a.poses.every((q, i) => cellsOf(i, q).join() === cellsOf(i, p.solution[i]).join()));
    assert.ok(ref);
    assert.equal(matching(p.fixed, ref).length, 1, 'única');
  }
});

test('reglas: encajar, resuelto, error y pista', () => {
  const sol = allSolutions()[0].poses, place = PIECES.map(() => null);
  place[0] = sol[0];
  assert.ok(fits(place, 1, sol[1]));
  assert.ok(!fits(place, 1, { m: 0, r: 0, tu: 40, tv: 0 }), 'fuera del tablero');
  const full = sol.map(p => ({ ...p }));
  assert.ok(isSolved(full, sol));
  assert.ok(!isSolved(place, sol));
  const other = allSolutions().find(a => cellsOf(1, a.poses[1]).join() !== cellsOf(1, sol[1]).join()).poses;
  const wrong = full.slice(); wrong[1] = other[1];
  assert.deepEqual(findMistake(wrong, sol, [0]), { piece: 1 });
  const h = findHint(place, sol);
  assert.ok(h.piece >= 1 && h.pose);
});
