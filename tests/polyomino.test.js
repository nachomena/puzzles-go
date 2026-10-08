import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orientCells, orientationsOf, createPacker } from '../js/lib/polyomino.js';

test('orientaciones: la cruz tiene 1, la I de 5 tiene 2, la F tiene 8', () => {
  assert.equal(orientationsOf([[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]).length, 1);
  assert.equal(orientationsOf([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]).length, 2);
  assert.equal(orientationsOf([[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]]).length, 8);
  assert.deepEqual(orientCells([[0, 0], [1, 0]], 0, 1), { cells: [[0, 0], [0, 1]], w: 1, h: 2 });
});

test('buscador: llenar un 2 × 3 con dos L de 3 (por filas y por columnas da lo mismo)', () => {
  const L = [[0, 0], [0, 1], [1, 1]];
  for (const order of ['rows', 'columns']){
    const pk = createPacker({ W: 3, H: 2, shapes: [L, L], order });
    assert.equal(pk.countSolutions([0, 1]), 4, order);
    const sol = pk.solve([0, 1]), seen = new Set();
    for (const { piece, pose } of sol) for (const c of pk.cellsOf(piece, pose)) seen.add(c.join());
    assert.equal(seen.size, 6);
  }
});

test('buscador: casillas bloqueadas, piezas fijas que se pisan y orden al azar', () => {
  const I2 = [[0, 0], [1, 0]];
  const pk = createPacker({ W: 2, H: 3, shapes: [I2, I2, I2] });
  // 2 × 2 con dos dominós: horizontales o verticales, y cada uno en dos sitios
  assert.equal(pk.countSolutions([0, 1], { blocked: [[0, 2], [1, 2]] }), 4);
  const fixed = [{ piece: 0, pose: { m: 0, r: 0, x: 0, y: 0 } }, { piece: 1, pose: { m: 0, r: 0, x: 0, y: 0 } }];
  assert.equal(pk.countSolutions([0, 1, 2], { fixed }), 0);
  let calls = 0;
  assert.ok(pk.solve([0, 1, 2], { random: () => (calls++ % 7) / 7 }));
});
