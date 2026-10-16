import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geometry, loopOf, cluesOf, isSingleLoop } from '../js/games/slitherlink/engine/grid.js';
import { logic, nextDeduction } from '../js/games/slitherlink/engine/logic-solver.js';
import { generate, region, LEVEL_RULES } from '../js/games/slitherlink/engine/generator.js';
import { lineCounts, crowded, isSolved, findMistake, findHint } from '../js/games/slitherlink/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('geometría: cada casilla tiene 4 lados, cada lado 2 puntos y 2 casillas (o fuera)', () => {
  const g = geometry(5);
  assert.equal(g.E, 60);
  assert.equal(g.V, 36);
  assert.ok(g.cellEdges.every(es => es.length === 4 && new Set(es).size === 4));
  assert.ok(g.edgeVerts.every(vs => vs.length === 2));
  // las esquinas tienen 2 lados; los puntos de dentro, 4
  assert.equal(g.vertEdges[0].length, 2);
  assert.equal(g.vertEdges[7].length, 4);
});

test('zona al azar: su borde es siempre un único lazo', () => {
  for (let k = 0; k < 40; k++){
    const n = 4 + (k % 6), inside = region(n, Math.round(n * n * .5));
    assert.ok(isSingleLoop(n, loopOf(n, inside)));
  }
});

test('las técnicas nunca contradicen la solución', () => {
  for (let k = 0; k < 20; k++){
    const n = 7, sol = loopOf(n, region(n, 25)), clues = cluesOf(n, sol).map(c => Math.random() < .5 ? c : -1);
    const r = logic(n, clues, 3);
    assert.ok(!r.contra);
    r.edges.forEach((v, e) => { if (v) assert.equal(v === 1, sol[e] === 1); });
  }
});

for (const L of [1, 2, 3, 4]){
  test(`generador: nivel ${L} con solución única y del nivel exacto`, () => {
    const p = runToEnd(generate(L)), { n, logic: level } = LEVEL_RULES[L];
    assert.ok(p && p.n === n && isSingleLoop(n, p.solution));
    const r = logic(n, p.clues, level);
    assert.ok(r.solved);
    r.edges.forEach((v, e) => assert.equal(v === 1, p.solution[e] === 1));
    if (level > 1) assert.equal(logic(n, p.clues, level - 1).solved, false);
  });
}

test('reglas: cuentas, puntos con más de dos líneas, error y pista', () => {
  const p = runToEnd(generate(1)), g = geometry(p.n), e = new Array(g.E).fill(0);
  const wrong = p.solution.findIndex(v => v !== 1);
  e[wrong] = 1;
  assert.equal(findMistake(e, p.solution), wrong);
  e[wrong] = 0;
  const h = findHint(p, e);
  assert.ok(h && (h.value === 1) === (p.solution[h.edge] === 1));
  assert.ok(nextDeduction(p.n, p.clues, 1, e));
  assert.equal(isSolved(p.solution, p.solution), true);
  assert.deepEqual(lineCounts(p.n, p.solution).filter((c, i) => p.clues[i] >= 0), p.clues.filter(c => c >= 0));
  assert.equal(crowded(p.n, p.solution).some(Boolean), false);
});
