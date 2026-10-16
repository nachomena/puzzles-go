import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pattern, runsOf, fill, withSums } from '../js/games/kakuro/engine/board.js';
import { logic, combos, nextDeduction } from '../js/games/kakuro/engine/logic-solver.js';
import { generate, decode, encode } from '../js/games/kakuro/engine/generator.js';
import { LEVEL_RULES } from '../js/games/kakuro/engine/levels.js';
import BANK from '../js/games/kakuro/engine/bank-data.js';
import { conflicts, findHint, peersOf } from '../js/games/kakuro/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('combinaciones: 3 en dos es 1 + 2; 24 en tres es 7 + 8 + 9; 20 en dos no existe', () => {
  assert.deepEqual(combos(2, 3), [(1 << 1) | (1 << 2)]);
  assert.deepEqual(combos(3, 24), [(1 << 7) | (1 << 8) | (1 << 9)]);
  assert.deepEqual(combos(2, 20), []);
  assert.equal(combos(2, 10).length, 4);
});

test('forma y relleno: tramos de 2 o más, cada blanca en dos tramos y sin repetir número', () => {
  let ok = 0;
  for (let k = 0; k < 40 && ok < 10; k++){
    const white = pattern(10, .28, 8);
    if (!white) continue;
    ok++;
    const runs = runsOf(10, white), sol = fill(10, white, runs, .8);
    assert.ok(sol);
    const count = new Uint8Array(100);
    for (const r of runs){
      assert.ok(r.cells.length >= 2 && r.cells.length <= 8);
      assert.equal(white[r.clue], 0);
      assert.equal(new Set(r.cells.map(i => sol[i])).size, r.cells.length);
      for (const i of r.cells) count[i]++;
    }
    for (let i = 0; i < 100; i++) assert.equal(count[i], white[i] ? 2 : 0);
  }
  assert.ok(ok > 0);
});

for (const L of [1, 2, 3, 4]){
  test(`generador: nivel ${L} con solución única y del nivel exacto`, () => {
    const p = runToEnd(generate(L)), { n, logic: level } = LEVEL_RULES[L];
    assert.ok(p && p.level === L && p.n === n);
    const r = logic(n, p.white, p.runs, level);
    assert.ok(r.solved);
    p.white.forEach((w, i) => { if (w) assert.equal(r.grid[i], p.solution[i]); });
    if (level > 1) assert.equal(logic(n, p.white, p.runs, level - 1).solved, false);
  });
}

test('banco del Experto: las 4 versiones de cada reto siguen teniendo solución única', () => {
  assert.ok(BANK.length >= 100);
  for (const text of BANK.slice(0, 12)){
    for (const transpose of [false, true]) for (const complement of [false, true]){
      const p = decode(text, 4, { transpose, complement });
      assert.ok(logic(p.n, p.white, p.runs, 2).solved);
      assert.equal(logic(p.n, p.white, p.runs, 1).solved, false);
      if (!transpose && !complement) assert.equal(encode(p), text);
    }
  }
});

test('reglas: repetidos en un tramo, sumas que no cuadran y pista', () => {
  const p = runToEnd(generate(1)), values = p.white.map(w => w ? 0 : -1);
  const run = p.runs[0], [a, b] = run.cells;
  values[a] = values[b] = 1;
  const bad = conflicts(p.n, p.runs, values);
  assert.equal(bad[a] + bad[b], 2);
  assert.equal(conflicts(p.n, p.runs, p.solution.map((v, i) => p.white[i] ? v : -1)).some(Boolean), false);
  const empty = p.white.map(w => w ? 0 : -1), h = findHint(p, empty);
  assert.ok(h && p.white[h.cell] && h.digit === p.solution[h.cell]);
  assert.ok(nextDeduction(p.n, p.white, p.runs, 1, empty));
  assert.ok(peersOf(p.n, p.runs)[a].includes(b));
});
