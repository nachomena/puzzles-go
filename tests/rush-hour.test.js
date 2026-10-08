import { test } from 'node:test';
import assert from 'node:assert/strict';
import { N, EXIT_ROW, occupancy, range, isSolved, solve, distances } from '../js/games/rush-hour/engine/board.js';
import { generateLive, fromBank, LEVEL_RULES } from '../js/games/rush-hour/engine/generator.js';
import { BANK } from '../js/games/rush-hour/engine/bank-data.js';
import { runToEnd } from '../js/lib/iter.js';

const red = { len: 2, dir: 'h', line: EXIT_ROW };

test('tablero: casillas, hasta dónde llega cada vehículo y salida', () => {
  const cars = [red, { len: 3, dir: 'v', line: 4 }];
  const pos = [0, 1];   // camión en la columna 4, filas 1–3: tapa la salida
  assert.equal([...occupancy(cars, pos)].filter(v => v >= 0).length, 5);
  assert.deepEqual(range(cars, pos, 0), { min: 0, max: 2 });
  assert.deepEqual(range(cars, pos, 1), { min: 0, max: 3 });
  assert.equal(isSolved(cars, [4, 0]), true);
  assert.equal(isSolved(cars, pos), false);
});

test('solucionador: camino más corto y distancias coherentes', () => {
  // el camión (columna 4, filas 1–3) tapa la salida; para bajarlo hay que apartar el coche de abajo
  const cars = [red, { len: 3, dir: 'v', line: 4 }, { len: 2, dir: 'h', line: 5 }];
  const pos = [0, 1, 3];
  const path = solve(cars, pos);
  assert.ok(path && path.length === 3, JSON.stringify(path));
  const d = distances(cars, pos);
  assert.equal(d.max >= 3, true);
  const at3 = d.pick(3);
  assert.equal(solve(cars, at3).length, 3);
});

test('generador: cada nivel da un reto con el mínimo de movimientos que pide', () => {
  for (const L of [1, 2, 3]){
    const p = runToEnd(generateLive(L)), [lo, hi] = LEVEL_RULES[L].moves;
    assert.ok(p && p.min >= lo && p.min <= hi, `nivel ${L}`);
    assert.equal(solve(p.cars, p.pos).length, p.min);
    assert.equal(p.cars[0].line, EXIT_ROW);
    assert.ok(!p.cars.slice(1).some(c => c.dir === 'h' && c.line === EXIT_ROW));
  }
});

test('retos ya calculados: los difíciles tienen los movimientos de su nivel', () => {
  for (const L of [4, 5]){
    if (!BANK[L].length) continue;
    const [lo, hi] = LEVEL_RULES[L].moves;
    for (const s of BANK[L].slice(0, 3)){
      assert.match(s, /^([23][hv][0-5][0-4])+$/);
    }
    const p = fromBank(L);
    assert.ok(p.min >= lo && p.min <= hi, `nivel ${L}: ${p.min}`);
    assert.ok(p.pos.every((v, i) => v + p.cars[i].len <= N));
  }
});
