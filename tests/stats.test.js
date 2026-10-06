import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordWin, average, versusAverage, winDetail, statsRows } from '../js/core/stats.js';

test('estadísticas: récord sin pistas, media y partidas antiguas sin suma', () => {
  const stats = { easy: { solved: 3, best: 100 } };   // datos de antes: sin suma
  assert.equal(average(stats.easy), null);
  let r = recordWin(stats, 'easy', 80, 0);
  assert.deepEqual(r, { record: true, best: 80, prevBest: 100, prevAvg: null });
  r = recordWin(stats, 'easy', 120, 0);
  assert.deepEqual(r, { record: false, best: 80, prevBest: 80, prevAvg: 80 });
  assert.equal(stats.easy.solved, 5);
  assert.equal(average(stats.easy), 100);
  r = recordWin(stats, 'easy', 50, 1);
  assert.equal(r.record, false, 'con pistas no hay récord');
});

test('estadísticas: textos de la victoria', () => {
  assert.equal(versusAverage(100, null), '');
  assert.equal(versusAverage(88, 100), '12 s más rápido que tu media.');
  assert.equal(versusAverage(165, 100), '1:05 min más lento que tu media.');
  assert.equal(versusAverage(100, 100), 'Igual que tu media.');
  assert.equal(winDetail({ record: true, best: 80, prevBest: 92, prevAvg: 100 }, { time: 80, hints: 0, name: 'Fácil' }),
    'Nuevo récord en Fácil (antes 1:32). 20 s más rápido que tu media.');
  assert.equal(winDetail({ record: true, best: 80, prevBest: null, prevAvg: null }, { time: 80, hints: 0, name: 'Fácil' }), 'Nuevo récord en Fácil.');
  assert.equal(winDetail({ record: false, best: 80, prevBest: 80, prevAvg: 90 }, { time: 95, hints: 2, name: 'Fácil' }),
    'Con 2 pistas. Récord: 1:20. 5 s más lento que tu media.');
});

test('estadísticas: filas por nivel o las que declare el juego', () => {
  const meta = { levelOrder: ['e', 'h'], levels: { e: { name: 'Fácil' }, h: { name: 'Difícil' } } };
  assert.deepEqual(statsRows(meta), [{ key: 'e', name: 'Fácil' }, { key: 'h', name: 'Difícil' }]);
  assert.deepEqual(statsRows({ ...meta, statsRows: [{ key: 'x', name: 'X' }] }), [{ key: 'x', name: 'X' }]);
});

test('lista de juegos: récord de los juegos sin menú de niveles', async () => {
  const { bestLine } = await import('../js/ui/hub-view.js');
  const one = { levelOrder: ['x'], levels: { x: { name: 'X' } } };
  assert.equal(bestLine(one, {}), '');
  assert.equal(bestLine(one, { x: { best: 80 } }), 'Récord 1:20');
  const boards = { ...one, statsRows: [{ key: 'english', name: 'Inglés' }, { key: 'european', name: 'Europeo' }] };
  assert.equal(bestLine(boards, { english: { best: 42 } }), 'Récord · Inglés 0:42');
  assert.equal(bestLine(boards, { english: { best: 42 }, european: { best: 190 } }), 'Récord · Inglés 0:42 · Europeo 3:10');
});
