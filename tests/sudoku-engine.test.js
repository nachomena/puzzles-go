import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, logic, grade, countSolutions, isComplete } from '../js/games/sudoku/engine/index.js';
import { runToEnd } from '../js/lib/iter.js';

const parse = s => [...s.replace(/\s/g, '')].map(c => c === '.' ? 0 : Number(c));

// Tablero conocido que se resuelve solo con singles
const EASY = parse(`
  53..7.... 6..195... .98....6. 8...6...3 4..8.3..1 7...2...6 .6....28. ...419..5 ....8..79`);

test('logic resuelve un tablero fácil conocido con singles', () => {
  const r = logic(EASY, 1);
  assert.ok(r.solved);
  assert.ok(isComplete(r.grid));
  assert.equal(grade(EASY), 1);
  assert.equal(countSolutions(EASY), 1);
});

test('las técnicas nunca contradicen la solución real', () => {
  for (let k = 0; k < 5; k++){
    const p = runToEnd(generate(2));
    for (const level of [1, 2, 3]){
      const r = logic(p.givens, level);
      if (r.grid) r.grid.forEach((v, i) => { if (v) assert.equal(v, p.solution[i]); });
    }
  }
});

const TECH_BY_LEVEL = {
  1: ['naked-single', 'hidden-single'],
  3: ['x-wing', 'swordfish']
};

for (const [target, name] of [[1, 'fácil'], [2, 'medio'], [3, 'difícil']]){
  test(`generate(${target}) crea un sudoku ${name} de solución única y del nivel exacto`, () => {
    const p = runToEnd(generate(target));
    assert.ok(p, 'se genera un tablero');
    assert.equal(p.level, target);
    assert.equal(p.givens.length, 81);
    assert.ok(isComplete(p.solution));
    p.givens.forEach((v, i) => { if (v) assert.equal(v, p.solution[i]); });
    assert.equal(countSolutions(p.givens), 1, 'solución única');
    assert.equal(grade(p.givens), target, 'el calificador confirma el nivel');
    const used = logic(p.givens, target).used;
    if (target === 3) assert.ok(TECH_BY_LEVEL[3].some(t => used.has(t)), 'el difícil usa X-Wing o Swordfish');
    if (target === 1) assert.ok([...used].every(t => TECH_BY_LEVEL[1].includes(t)));
  });
}
