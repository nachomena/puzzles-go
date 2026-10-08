import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neighbours, adjacent, randomPath, countPaths } from '../js/games/zip/engine/path.js';
import { generate, LEVEL_RULES } from '../js/games/zip/engine/generator.js';
import { labels, canExtend, isSolved, firstMistake } from '../js/games/zip/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('camino al azar: recorre todo el tablero de casilla vecina en casilla vecina', () => {
  for (const n of [4, 5, 6, 7]){
    const p = randomPath(n);
    assert.ok(p, `n = ${n}`);
    assert.equal(new Set(p).size, n * n);
    p.forEach((c, k) => { if (k) assert.ok(adjacent(n, p[k - 1], c)); });
  }
  assert.deepEqual(neighbours(3, 4).sort(), [1, 3, 5, 7]);
});

test('contar caminos: en 2 × 2 desde una esquina hasta la de al lado hay uno', () => {
  assert.equal(countPaths(2, [0, 1]), 1);      // 0 → 2 → 3 → 1
  assert.equal(countPaths(2, [0, 3]), 0);      // a la esquina opuesta no se llega pasando por todo
  assert.equal(countPaths(3, [0, 8], { limit: 10 }), 2);
});

test('generador: cada nivel da un reto de solución única', () => {
  for (const L of [1, 2, 3]){
    const p = runToEnd(generate(L)), { n, nums: [min, max] } = LEVEL_RULES[L];
    assert.ok(p && p.n === n && p.nums.length >= min && p.nums.length <= max, `nivel ${L}`);
    assert.equal(countPaths(n, p.nums), 1);
    assert.equal(p.solution[0], p.nums[0]);
    assert.equal(p.solution[p.solution.length - 1], p.nums[p.nums.length - 1]);
  }
});

test('reglas: alargar el camino, números en orden, error y resuelto', () => {
  const p = runToEnd(generate(1)), n = p.n, lab = labels(n, p.nums), sol = p.solution;
  const path = [sol[0]];
  assert.ok(canExtend(n, path, lab, sol[1]));
  assert.equal(canExtend(n, path, lab, sol[0]), false);
  // un número que no toca todavía no se puede pisar
  const later = p.nums[2], before = sol.indexOf(later) - 1;
  assert.equal(canExtend(n, sol.slice(0, before), lab, later), adjacent(n, sol[before - 1], later) && false);
  assert.equal(firstMistake(sol.slice(0, 5), sol), -1);
  assert.equal(isSolved(n, p.nums, sol), true);
  assert.equal(isSolved(n, p.nums, sol.slice(0, -1)), false);
});
