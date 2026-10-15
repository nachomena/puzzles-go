import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomSolution } from '../js/games/sudoku/engine/exact-solver.js';
import { partition, coversBoard, sumGroups, UNIT_REGIONS, BAND_REGIONS } from '../js/games/killer-sudoku/engine/cages.js';
import { prepare, logic, nextDeduction } from '../js/games/killer-sudoku/engine/logic-solver.js';
import { generate, LEVEL_RULES } from '../js/games/killer-sudoku/engine/generator.js';
import { conflicts, findHint, peersOf } from '../js/games/killer-sudoku/rules.js';
import { runToEnd } from '../js/lib/iter.js';

const total = (cells, grid) => cells.reduce((t, i) => t + grid[i], 0);

test('jaulas: cubren el tablero, sin repetir número dentro y con su suma', () => {
  for (let k = 0; k < 20; k++){
    const sol = randomSolution(), cages = partition(sol, [2, 3, 4, 5]);
    if (!cages) continue;
    assert.ok(coversBoard(cages));
    for (const { cells, sum } of cages){
      assert.ok(cells.length >= 2);
      assert.equal(new Set(cells.map(i => sol[i])).size, cells.length);
      assert.equal(total(cells, sol), sum);
    }
  }
});

test('regla del 45: cada grupo suma lo que dice', () => {
  for (let k = 0; k < 20; k++){
    const sol = randomSolution(), cages = partition(sol, [2, 3, 4, 5]);
    if (!cages) continue;
    for (const g of [...sumGroups(cages, UNIT_REGIONS, 4), ...sumGroups(cages, BAND_REGIONS, 5)]) assert.equal(total(g.cells, sol), g.sum);
  }
});

test('las técnicas nunca contradicen la solución real', () => {
  for (let k = 0; k < 20; k++){
    const sol = randomSolution(), cages = partition(sol, [2, 3, 4, 5, 6]);
    if (!cages) continue;
    const r = logic(new Array(81).fill(0), prepare(cages), 4);
    assert.ok(!r.contra);
    r.grid.forEach((v, i) => { if (v) assert.equal(v, sol[i]); });
  }
});

for (const L of [1, 2, 3, 4]){
  test(`generador: nivel ${L} con solución única, del nivel exacto y casi sin números puestos`, () => {
    const p = runToEnd(generate(L)), prepared = prepare(p.cages);
    assert.ok(p && p.level === L);
    assert.ok(coversBoard(p.cages));
    assert.ok(Math.max(...p.cages.map(c => c.cells.length)) <= Math.max(...LEVEL_RULES[L].sizes) + 1);
    p.givens.forEach((v, i) => { if (v) assert.equal(v, p.solution[i]); });
    assert.ok(p.givens.filter(Boolean).length <= 12);
    const r = logic(p.givens, prepared, L);
    assert.ok(r.solved);
    assert.deepEqual(r.grid, p.solution);
    if (L > 1) assert.equal(logic(p.givens, prepared, L - 1).solved, false);
  });
}

test('reglas: repetidos en la jaula, sumas pasadas y pista', () => {
  const p = runToEnd(generate(1)), cage = p.cages.find(c => c.cells.filter(i => !p.givens[i]).length >= 2);
  const values = p.givens.slice();
  // dos números iguales dentro de una jaula
  const [a, b] = cage.cells.filter(i => !p.givens[i]);
  if (a !== undefined && b !== undefined){
    values[a] = values[b] = 1;
    const bad = conflicts(p.cages, values);
    assert.equal(bad[a] + bad[b], 2);
  }
  assert.equal(conflicts(p.cages, p.solution).some(Boolean), false);
  // la pista da siempre el número de la solución
  const h = findHint(p.cages, p.level, p.givens, p.solution);
  assert.ok(h && h.digit === p.solution[h.cell] && !p.givens[h.cell]);
  assert.ok(nextDeduction(p.givens, prepare(p.cages), 1));
  // la jaula cuenta como vecina para limpiar notas
  const peers = peersOf(p.cages);
  assert.ok(peers[cage.cells[0]].includes(cage.cells[1]));
});
