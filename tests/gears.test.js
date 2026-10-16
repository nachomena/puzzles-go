import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neighbours, drive, satisfies, countSolutions } from '../js/games/gears/engine/board.js';
import { generate, build, encode, decode, LEVEL_RULES } from '../js/games/gears/engine/generator.js';
import BANK from '../js/games/gears/engine/bank-data.js';
import { evaluate, isSolved, findMistake, findHint } from '../js/games/gears/rules.js';
import { runToEnd } from '../js/lib/iter.js';

test('vecinos: hexágonos de filas desplazadas (las impares a la derecha)', () => {
  const nb = neighbours(3, 3);
  assert.deepEqual([...nb[4]].sort((a, b) => a - b), [1, 2, 3, 5, 7, 8]);   // centro, fila impar
  assert.deepEqual([...nb[0]].sort((a, b) => a - b), [1, 3]);
  assert.ok(nb.every((list, i) => list.every(j => nb[j].includes(i))), 'simétricos');
});

test('girar: sentidos alternos y atasco con un círculo', () => {
  // 3 × 2: 0 y 1 arriba, 3 abajo toca a los dos → triángulo
  const tri = [1, 1, 0, 1, 0, 0], chain = [1, 1, 1, 0, 0, 1];
  assert.equal(drive(3, 2, tri, 0).jam, true);
  const d = drive(3, 2, chain, 0);
  assert.equal(d.jam, false);
  assert.deepEqual([0, 1, 2, 5].map(i => d.spin[i]), [0, 1, 0, 1]);
});

/** Soluciones por fuerza bruta (todas las combinaciones de engranajes), para comparar. */
function brute(p){
  const n = p.w * p.h, free = [...Array(n).keys()].filter(i => i !== p.crank && i !== p.lock && !p.fixed.includes(i) && p.clues[i] === undefined);
  let count = 0;
  for (let mask = 0; mask < 1 << free.length; mask++){
    const g = new Array(n).fill(0);
    for (const i of [p.crank, p.lock, ...p.fixed]) g[i] = 1;
    free.forEach((c, k) => { if (mask >> k & 1) g[c] = 1; });
    if (satisfies(p, g)) count++;
  }
  return count;
}

test('solucionador: cuenta igual que la fuerza bruta en retos pequeños', () => {
  // 4 × 3 con la manivela en 4 y el cerrojo en 7; el sentido del cerrojo, el de la cadena recta 4-5-6-7
  const chain = new Array(12).fill(0);
  chain[4] = chain[5] = chain[6] = chain[7] = 1;
  const base = { w: 4, h: 3, crank: 4, lock: 7, fixed: [], clues: {}, spin: Array.from(drive(4, 3, chain, 4).spin) };
  assert.equal(countSolutions(base, 1000, 1e7), brute(base));
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 30; k++){
    const clues = {};
    for (const i of [0, 1, 2, 3, 8, 9, 10, 11]) if (rnd() < .35) clues[i] = Math.floor(rnd() * 3);
    const p = { ...base, clues, fixed: rnd() < .5 ? [5] : [] };
    assert.equal(countSolutions(p, 1000, 1e7), brute(p), JSON.stringify(p));
  }
});

for (const L of [1, 2, 3]){
  test(`generador nivel ${L}: tamaño, pistas y solución única`, () => {
    const p = runToEnd(build(L)), { w, h } = LEVEL_RULES[L];
    assert.equal(p.w, w); assert.equal(p.h, h);
    assert.equal(p.crank % w, 0, 'manivela a la izquierda');
    assert.equal(p.lock % w, w - 1, 'cerrojo a la derecha');
    assert.ok(satisfies(p, p.solution), 'la solución cumple');
    assert.ok(p.fixed.length >= LEVEL_RULES[L].keepFixed || p.fixed.length === p.solution.filter(Boolean).length - 2);
    assert.equal(countSolutions(p, 2, 1e7), 1);
  });
}

test('banco: texto de ida y vuelta, y la otra versión es el mismo reto', () => {
  for (const L of [1, 2]){
    const p = runToEnd(build(L));
    assert.deepEqual(decode(encode(p), L), p);
    const t = decode(encode(p), L, { turn: true });
    assert.equal(t.crank % t.w, 0); assert.equal(t.lock % t.w, t.w - 1);
    assert.equal(t.fixed.length, p.fixed.length);
    assert.equal(Object.keys(t.clues).length, Object.keys(p.clues).length);
    assert.ok(satisfies(t, t.solution));
    assert.equal(countSolutions(t, 2, 1e7), 1);
    assert.deepEqual(decode(encode(t), L, { turn: true }).solution, p.solution);
  }
});

test('banco: todos los retos de todos los niveles valen en sus dos versiones', () => {
  for (const L of [1, 2, 3, 4]){
    const list = BANK[L], { w, h } = LEVEL_RULES[L];
    assert.ok(list?.length >= 100, `nivel ${L}: ${list?.length} retos`);
    assert.equal(new Set(list).size, list.length, 'sin repetidos');
    for (const text of list){
      assert.equal(text.length, w * h);
      for (const turn of [false, true]){
        const p = decode(text, L, { turn });
        assert.equal(p.crank % w, 0); assert.equal(p.lock % w, w - 1);
        assert.ok(satisfies(p, p.solution), text);
      }
    }
  }
  // la solución única se vuelve a demostrar: en los pequeños, todos y en las dos versiones; en los grandes,
  // unos pocos tal como se calcularon (girados, el solucionador recorre el panel en otro orden y tarda más)
  for (const L of [1, 2]) for (const text of BANK[L]) for (const turn of [false, true]) assert.equal(countSolutions(decode(text, L, { turn }), 2, 1e7), 1, text);
  for (const L of [3, 4]) for (const text of BANK[L].slice(0, 5)) assert.equal(countSolutions(decode(text, L), 2, 3e7), 1, text);
});

test('generate saca los retos del banco', () => {
  for (const L of [1, 4]){
    const p = runToEnd(generate(L));
    assert.ok(BANK[L].includes(encode(p)) || BANK[L].includes(encode(decode(encode(p), L, { turn: true }))));
  }
});

test('reglas: resolver, error y pista', () => {
  const p = runToEnd(generate(1)), n = p.w * p.h;
  const marks = new Array(n).fill(0);
  assert.equal(isSolved(p, marks), false);
  // con la pista una y otra vez se llega a la solución
  for (let k = 0; k < n && !isSolved(p, marks); k++){
    const i = findHint(p, marks);
    assert.ok(i >= 0);
    marks[i] = 1;
  }
  assert.ok(isSolved(p, marks));
  assert.equal(findMistake(p, marks), -1);
  // un engranaje de más: error
  const extra = marks.findIndex((m, i) => !p.solution[i] && p.clues[i] === undefined);
  if (extra >= 0){
    marks[extra] = 1;
    assert.equal(findMistake(p, marks), extra);
    assert.equal(isSolved(p, marks), false);
  }
  const e = evaluate(p, marks);
  assert.ok(e.on.has(p.crank));
});
