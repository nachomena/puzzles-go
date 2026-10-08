import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edgesOf, solve, connected } from '../js/games/hashi/engine/graph.js';
import { generate, LEVEL_RULES } from '../js/games/hashi/engine/generator.js';
import { counts, blockedBy, isSolved, findMistake, findHint } from '../js/games/hashi/rules.js';
import { runToEnd } from '../js/lib/iter.js';

// Dos islas de 2 unidas por dos puentes; una cruz para los cruces
const pair = { w: 3, h: 1, islands: [{ x: 0, y: 0, n: 2 }, { x: 2, y: 0, n: 2 }] };
const cross = { w: 3, h: 3, islands: [{ x: 1, y: 0, n: 1 }, { x: 0, y: 1, n: 1 }, { x: 2, y: 1, n: 1 }, { x: 1, y: 2, n: 1 }] };

test('tramos: islas que se ven en línea y cruces', () => {
  assert.equal(edgesOf(pair).length, 1);
  const e = edgesOf(cross);
  assert.equal(e.length, 2);
  assert.deepEqual(e[0].cross, [1]);
  assert.equal(blockedBy(e, [1, 0], 1), 0);
});

test('solucionador: única en el par; la cruz no tiene solución (no pueden unirse las cuatro)', () => {
  const r = solve(pair);
  assert.equal(r.count, 1);
  assert.deepEqual(r.solution, [2]);
  assert.equal(solve(cross).count, 0);
});

test('generador: cada nivel da un reto de solución única que cumple las reglas', () => {
  for (const L of [1, 3, 5]){
    const p = runToEnd(generate(L)), { w, islands: [min, max] } = LEVEL_RULES[L];
    assert.ok(p && p.w === w && p.islands.length >= min && p.islands.length <= max, `nivel ${L}`);
    const edges = edgesOf(p);
    assert.equal(solve(p).count, 1);
    assert.ok(isSolved(p.islands, edges, p.solution));
    assert.ok(connected(p.islands, edges, p.solution));
    assert.ok(p.islands.every(s => s.n >= 1 && s.n <= 8));
  }
});

test('reglas: cuentas, sobra, falta y resuelto', () => {
  const p = runToEnd(generate(2)), edges = edgesOf(p), sol = p.solution, val = sol.map(() => 0);
  assert.equal(isSolved(p.islands, edges, val), false);
  const k = findHint(val, sol);
  assert.ok(k >= 0 && sol[k] > 0);
  val[k] = 2;
  if (sol[k] < 2) assert.equal(findMistake(val, sol), k);
  assert.equal(counts(p.islands, edges, sol).join(), p.islands.map(s => s.n).join());
});
