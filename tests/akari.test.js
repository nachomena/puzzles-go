import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WHITE, BLACK, sight, lit, countSolutions } from '../js/games/akari/engine/light.js';
import { generate, LEVEL_RULES } from '../js/games/akari/engine/generator.js';
import { evaluate, isSolved, findMistake, findHint } from '../js/games/akari/rules.js';
import { runToEnd } from '../js/lib/iter.js';

const W = WHITE, B = BLACK;

test('luz: una bombilla ve su fila y columna hasta una negra', () => {
  // 3 × 3 con la negra en el centro
  const cells = [W, W, W, W, B, W, W, W, W];
  assert.deepEqual(sight(3, cells, 0).sort(), [1, 2, 3, 6]);
  const on = lit(3, cells, [1, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.equal([...on].filter(Boolean).length, 8);
});

/** Soluciones por fuerza bruta (todas las combinaciones de bombillas), para comparar. */
function brute(n, cells){
  const white = cells.map((v, i) => v === W ? i : -1).filter(i => i >= 0);
  let count = 0;
  for (let mask = 0; mask < 1 << white.length; mask++){
    const marks = new Array(n * n).fill(0);
    white.forEach((c, k) => { if (mask >> k & 1) marks[c] = 1; });
    if (isSolved(n, cells, marks)) count++;
  }
  return count;
}

test('solucionador: cuenta igual que la fuerza bruta en tableros pequeños', () => {
  assert.equal(countSolutions(3, [W, W, W, W, B, W, W, W, W], { limit: 100 }), brute(3, [W, W, W, W, B, W, W, W, W]));
  assert.equal(countSolutions(3, [W, W, W, W, 4, W, W, W, W], { limit: 100 }), 1);   // una bombilla a cada lado del 4
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 40; k++){
    const n = 4, cells = Array.from({ length: n * n }, () => rnd() < .25 ? (rnd() < .5 ? B : Math.floor(rnd() * 3)) : W);
    assert.equal(countSolutions(n, cells, { limit: 1000 }), brute(n, cells), JSON.stringify(cells));
  }
});

test('generador: cada nivel da un reto de solución única', () => {
  for (const L of [1, 2, 3, 4]){
    const p = runToEnd(generate(L));
    assert.ok(p && p.n === LEVEL_RULES[L].n, `nivel ${L}`);
    assert.equal(countSolutions(p.n, p.cells), 1);
    assert.ok(isSolved(p.n, p.cells, p.solution));
  }
});

test('reglas: choques, números de más, error y pista', () => {
  const p = runToEnd(generate(1)), n = p.n, marks = new Array(n * n).fill(0);
  const bulb = p.solution.findIndex(Boolean);
  assert.equal(findHint(marks, p.solution), bulb);
  const wrong = p.solution.findIndex((v, i) => !v && p.cells[i] === W);
  marks[wrong] = 1;
  assert.equal(findMistake(marks, p.solution), wrong);
  // dos bombillas en la misma fila sin negra en medio chocan
  const cells = [W, W, W, B, B, B, B, B, B], r = evaluate(3, cells, [1, 0, 1, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual([...r.clash].slice(0, 3), [1, 0, 1]);
  assert.equal(isSolved(n, p.cells, p.solution.map(v => v ? 1 : 0)), true);
});
