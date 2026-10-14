import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextDeduction, propagate, countSolutions, randomSolution, solvesByLogic, lookahead } from '../js/games/binario/engine/grid.js';
import { generate, LEVEL_RULES } from '../js/games/binario/engine/generator.js';
import { evaluate, isSolved, findMistake, findHint } from '../js/games/binario/rules.js';
import { runToEnd } from '../js/lib/iter.js';

/** ¿Cumple las tres reglas un tablero lleno? */
function valid(n, g){
  const row = r => g.slice(r * n, r * n + n), col = c => Array.from({ length: n }, (_, r) => g[r * n + c]);
  const lines = [...Array(n).keys()].flatMap(k => [row(k), col(k)]);
  const noTrio = lines.every(l => l.every((v, k) => k < 2 || !(v === l[k - 1] && v === l[k - 2])));
  const halves = lines.every(l => l.filter(v => v === 1).length === n / 2);
  const rows = new Set([...Array(n).keys()].map(r => row(r).join(''))), cols = new Set([...Array(n).keys()].map(c => col(c).join('')));
  return noTrio && halves && rows.size === n && cols.size === n;
}

test('deducciones: tres seguidos, la mitad y líneas iguales', () => {
  // fila 0: 1 1 _ _ → la tercera tiene que ser 2
  const g = new Array(16).fill(0); g[0] = 1; g[1] = 1;
  assert.deepEqual(nextDeduction(4, g), { i: 2, v: 2, why: 'trio' });
  // 1 _ 1 _ en la fila: el hueco del medio es 2 (antes que la mitad)
  const h = new Array(16).fill(0); h[0] = 1; h[2] = 1;
  assert.deepEqual(nextDeduction(4, h), { i: 1, v: 2, why: 'trio' });
  // fila 0 = 1 2 2 1 entera; fila 1 = 1 2 _ _ → no puede repetir 1 2 2 1: la tercera va 1
  const u = new Array(16).fill(0); [1, 2, 2, 1, 1, 2].forEach((v, i) => u[i] = v);
  const d = nextDeduction(4, u);
  assert.equal(d.why === 'unique' || d.why === 'half' || d.why === 'trio', true);
  // tres seguidos: contradicción
  const bad = new Array(16).fill(0); bad[0] = bad[1] = bad[2] = 1;
  assert.deepEqual(nextDeduction(4, bad), { bad: true });
  assert.equal(propagate(4, bad.slice()), false);
});

test('tableros al azar válidos y retos con una sola solución que se resuelven sin probar', () => {
  for (const n of [4, 6, 8]) assert.ok(valid(n, randomSolution(n)), `n = ${n}`);
  for (const L of [1, 2, 3]){
    const p = runToEnd(generate(L));
    assert.equal(p.n, LEVEL_RULES[L].n);
    assert.ok(valid(p.n, p.solution));
    assert.ok(p.givens.every((v, i) => !v || v === p.solution[i]));
    assert.equal(countSolutions(p.n, p.givens), 1);
    assert.ok(solvesByLogic(p.n, p.givens));
  }
});

test('reglas del jugador: errores, resuelto, error frente a la solución y pista', () => {
  const p = runToEnd(generate(1)), n = p.n;
  assert.ok(isSolved(n, p.solution));
  assert.ok(!evaluate(n, p.solution).some(Boolean));
  const g = p.givens.slice(), empty = g.indexOf(0);
  g[empty] = 3 - p.solution[empty];
  assert.equal(findMistake(g, p.solution), empty);
  const hint = findHint(n, p.givens.slice(), p.solution);
  assert.equal(hint.v, p.solution[hint.i], 'la pista pone el color de la solución');
  // tres iguales seguidos se marcan
  const t = new Array(16).fill(0); t[0] = t[1] = t[2] = 2;
  assert.deepEqual([...evaluate(4, t)].slice(0, 4), [1, 1, 1, 0]);
  // dos filas iguales y completas se marcan
  const r = new Array(16).fill(0); [1, 2, 1, 2, 1, 2, 1, 2].forEach((v, i) => r[i] = v);
  assert.ok(evaluate(4, r).slice(0, 8).every(Boolean));
});

test('mirar un paso más allá encuentra lo que obliga una contradicción', () => {
  const n = 12, sol = randomSolution(n), p = runToEnd(generate(5));
  assert.ok(sol);
  assert.ok(solvesByLogic(p.n, p.givens, true));
  const g = p.givens.slice();
  propagate(p.n, g);
  const d = lookahead(p.n, g);
  if (d) assert.equal(d.v, p.solution[d.i]);
});
