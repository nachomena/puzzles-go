import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, PIECE_TYPES, shape, FACES, CELLS } from '../js/games/smart-dices/engine/pieces.js';
import { solve, diceValues } from '../js/games/smart-dices/engine/solver.js';
import { arrangements, matching } from '../js/games/smart-dices/engine/arrangements.js';
import { generate, LEVEL_RULES } from '../js/games/smart-dices/engine/generator.js';
import { evaluate, isSolved, findHint, fits } from '../js/games/smart-dices/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('las 12 piezas cubren justo el tablero y tienen 12 puntos', () => {
  assert.equal(PIECES.length, 12);
  const area = PIECES.reduce((n, t) => n + PIECE_TYPES[t].cells.length, 0);
  const dots = PIECES.reduce((n, t) => n + PIECE_TYPES[t].dots.length, 0);
  assert.equal(area, CELLS);
  assert.equal(dots, 12);
  assert.equal(PIECES.filter(t => !PIECE_TYPES[t].dots.length).length, 4, '4 piezas lisas');
});

test('girar 4 veces deja la pieza igual y los puntos siguen dentro', () => {
  PIECE_TYPES.forEach((_, type) => {
    assert.deepEqual(shape(type, 4 % 4), shape(type, 0));
    for (let rot = 0; rot < 4; rot++){
      const s = shape(type, rot), inside = new Set(s.cells.map(p => p.join()));
      s.dots.forEach(d => assert.ok(inside.has(d.join())));
    }
  });
});

test('caras válidas: del 1 al 6 en todas sus orientaciones', () => {
  assert.deepEqual([...new Set(FACES.values())].sort(), [1, 2, 3, 4, 5, 6]);
  assert.equal(FACES.size, 9);
});

test('la lista precalculada coincide con el solucionador', () => {
  const { list } = arrangements();
  assert.equal(list.length, 6288);
  for (const a of list.slice(0, 50)){
    assert.deepEqual(diceValues(a.pieces), a.dice);
    assert.ok(a.dice.every(v => v >= 1));
    assert.equal(a.dice.reduce((x, y) => x + y), 12, 'los dados suman siempre 12');
  }
});

for (const level of [1, 2, 3, 4, 5]){
  test(`generate(${level}) respeta las pistas del nivel y tiene solución única`, () => {
    const p = runToEnd(generate(level));
    assert.ok(p);
    const rules = LEVEL_RULES[level];
    const arrows = [...p.arrows.rows, ...p.arrows.cols].filter(x => x != null).length;
    assert.ok(arrows >= rules.arrows[0] && arrows <= rules.arrows[1], 'flechas');
    assert.ok(p.fixed.length >= rules.pieces[0] && p.fixed.length <= rules.pieces[1], 'piezas');
    const fixed = p.fixed.map(i => p.solution[i]);
    assert.equal(matching(fixed, p.arrows).length, 1);
    assert.equal(solve({ fixed, arrows: p.arrows }, { limit: 2 }).count, 1, 'el solucionador lo confirma');
  });
}

test('reglas: resolver, errores y pista', () => {
  const p = runToEnd(generate(1));
  const solved = p.solution.map(({ rot, r, c }) => ({ rot, r, c }));
  assert.ok(isSolved(solved, p.arrows));
  assert.ok(evaluate(solved, p.arrows).dice.every(d => d.full && d.value));

  const partial = solved.map((pos, i) => p.fixed.includes(i) ? pos : null);
  assert.ok(!isSolved(partial, p.arrows));
  const hint = findHint(partial, p.solution, p.fixed);
  assert.ok(hint && !p.fixed.includes(hint.piece));
  assert.ok(fits(partial, hint.piece, hint.pos), 'la pista cabe');
  assert.equal(findHint(solved, p.solution, p.fixed), null, 'resuelto: no hay pista');
});
