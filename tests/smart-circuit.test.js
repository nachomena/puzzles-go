import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIECES, CELLS } from '../js/games/smart-circuit/engine/pieces.js';
import { solve, orient, faceCount } from '../js/games/smart-circuit/engine/solver.js';
import { arrangements, matching, lookKey } from '../js/games/smart-circuit/engine/arrangements.js';
import { generate, LEVEL_RULES } from '../js/games/smart-circuit/engine/generator.js';
import { isSolved, findMistake, findHint, fits, brokenEnds, cellsOf } from '../js/games/smart-circuit/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('las 10 piezas cubren el tablero y tienen 8 caras con punto', () => {
  assert.equal(PIECES.length, 10);
  assert.equal(PIECES.reduce((n, p) => n + p.faces[0].cells.length, 0), CELLS);
  assert.equal(PIECES.flatMap(p => p.faces).filter(f => f.dots.length).length, 8);
  assert.equal(PIECES.filter(p => p.blank).length, 4, 'dominós y rectas de 3 con cara lisa');
});

test('orient: girar 4 veces vuelve a la misma pieza; las caras lisas no tienen camino', () => {
  PIECES.forEach((_, piece) => {
    for (let face = 0; face < faceCount(piece); face++){
      const a = orient(piece, face, 0), b = orient(piece, face, 0);
      assert.deepEqual(a.cells, b.cells);
      if (face === 2) assert.ok(a.masks.every(m => m === 0) && a.dots.size === 0);
    }
  });
});

test('la lista precalculada: 358 colocaciones, todas válidas y distintas', () => {
  const list = arrangements();
  assert.equal(list.length, 358);
  assert.equal(new Set(list.map(a => [...a.keys].sort().join('|'))).size, 358);
  for (const a of list.slice(0, 20)){
    assert.ok([2, 4, 6].includes(a.dots.length));
    // el solucionador confirma que con su camino y sus puntos es válida
    assert.equal(solve({ dots: a.dots, masks: a.mask }, { limit: 1 }).count, 1);
  }
});

for (const level of [1, 2, 3, 4, 5]){
  test(`generate(${level}) da un reto de solución única con las pistas del nivel`, () => {
    const p = runToEnd(generate(level)), rules = LEVEL_RULES[level];
    assert.ok(p);
    assert.equal(p.show.masks, rules.masks);
    assert.equal(p.show.regions, rules.regions);
    assert.ok(p.fixed.length >= rules.fixed[0] && p.fixed.length <= rules.fixed[1]);
    const ref = arrangements().find(a => p.solution.every(s => a.keys.has(lookKey(s))));
    const fixed = p.fixed.map(i => p.solution[i]);
    assert.equal(matching({ dots: p.dots, masks: p.show.masks, regions: p.show.regions, fixed }, ref).length, 1);
    if (level === 5) assert.equal(solve({ dots: p.dots }, { limit: 2 }).count, 1, 'el solucionador lo confirma');
  });
}

test('reglas: resuelto, errores, pista y salidas cortadas', () => {
  const p = runToEnd(generate(5));
  const toPos = s => { const o = orient(s.piece, s.face, s.rot); return { face: s.face, rot: s.rot, x: s.cell % 8 - o.cells[0][0], y: ((s.cell / 8) | 0) - o.cells[0][1] }; };
  const solved = p.solution.map(toPos);
  assert.ok(isSolved(solved, p.solution));
  assert.deepEqual(brokenEnds(solved), [], 'en la solución ningún camino se corta');
  const partial = solved.map(() => null);
  const hint = findHint(partial, p.solution);
  assert.ok(hint && fits(partial, hint.piece, hint.pos));
  // una pieza movida a otro sitio se señala como error
  const one = partial.slice();
  for (let y = 0; y < 4 && !one[0]; y++) for (let x = 0; x < 8 && !one[0]; x++){
    const pos = { ...solved[0], x, y };
    if ((x !== solved[0].x || y !== solved[0].y) && cellsOf(0, pos)) one[0] = pos;
  }
  assert.deepEqual(findMistake(one, p.solution, []), { piece: 0 });
});
