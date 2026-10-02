import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOARDS, CENTER, holes, startBalls, movesFrom, jumpOver, anyMove, countBalls } from '../js/games/peg-solitaire/engine/rules.js';
import { generate } from '../js/games/peg-solitaire/engine/generator.js';
import { runToEnd } from '../js/lib/iter.js';

test('tableros: inglés 33 agujeros y europeo 37, con un hueco al empezar', () => {
  assert.equal(holes('english').length, 33);
  assert.equal(holes('european').length, 37);
  assert.equal(countBalls(startBalls('english')), 32);
  assert.equal(countBalls(startBalls('european')), 36);
  assert.equal(startBalls('english')[CENTER], -1);
  assert.equal(startBalls('european')[BOARDS.european.start], -1);
  // el europeo tiene además las esquinas interiores
  for (const i of [8, 12, 36, 40]) assert.ok(holes('european').includes(i) && !holes('english').includes(i));
});

test('saltos: solo sobre una bola vecina hasta un agujero vacío', () => {
  const balls = startBalls('english');
  const all = balls.flatMap((b, i) => b >= 0 ? movesFrom('english', balls, i).map(m => [i, m.to]) : []);
  assert.deepEqual(all.sort((a, b) => a[0] - b[0]), [[10, 24], [22, 24], [26, 24], [38, 24]]);
  assert.deepEqual(jumpOver('english', balls, 10, 24), { over: 17, to: 24 });
  assert.equal(jumpOver('english', balls, 9, 24), null);       // no está en línea
  assert.equal(jumpOver('english', balls, 3, 17), null);       // destino ocupado
  assert.equal(movesFrom('english', balls, CENTER).length, 0); // agujero vacío
});

test('el inglés con el centro vacío se puede terminar con una bola', () => {
  // búsqueda en profundidad con memoria de posiciones sin salida (rápida para el inglés)
  const dead = new Set();
  const rec = balls => {
    if (countBalls(balls) === 1) return true;
    const key = balls.map(b => b >= 0 ? 1 : 0).join('');
    if (dead.has(key)) return false;
    for (let i = 0; i < balls.length; i++) for (const m of movesFrom('english', balls, i)){
      const next = balls.slice();
      next[m.to] = next[i]; next[i] = next[m.over] = -1;
      if (rec(next)) return true;
    }
    dead.add(key);
    return false;
  };
  assert.ok(rec(startBalls('english')));
  assert.ok(anyMove('european', startBalls('european')));
});

test('generador: un tablero por nivel', () => {
  assert.deepEqual(runToEnd(generate(1)), { level: 1 });
});
