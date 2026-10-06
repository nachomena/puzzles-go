import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordWin, average, currentStreak, emptyStreak, versusAverage, winDetail, statsRows, dayKey } from '../js/core/stats.js';

test('estadísticas: récord sin pistas, media y partidas antiguas sin suma', () => {
  const stats = { easy: { solved: 3, best: 100 } }, streak = emptyStreak();   // datos de antes: sin suma
  assert.equal(average(stats.easy), null);
  let r = recordWin(stats, streak, 'easy', 80, 0, '2026-10-01');
  assert.deepEqual(r, { record: true, best: 80, prevBest: 100, prevAvg: null });
  r = recordWin(stats, streak, 'easy', 120, 0, '2026-10-01');
  assert.deepEqual(r, { record: false, best: 80, prevBest: 80, prevAvg: 80 });
  assert.equal(stats.easy.solved, 5);
  assert.equal(average(stats.easy), 100);
  r = recordWin(stats, streak, 'easy', 50, 1, '2026-10-01');
  assert.equal(r.record, false, 'con pistas no hay récord');
});

test('estadísticas: racha de días seguidos', () => {
  const stats = {}, streak = emptyStreak();
  recordWin(stats, streak, 'a', 10, 0, '2026-09-30');
  recordWin(stats, streak, 'a', 10, 0, '2026-09-30');      // mismo día: no suma
  recordWin(stats, streak, 'a', 10, 0, '2026-10-01');      // cambio de mes
  assert.deepEqual(streak, { last: '2026-10-01', count: 2, best: 2 });
  assert.equal(currentStreak(streak, '2026-10-02'), 2, 'ayer cuenta');
  assert.equal(currentStreak(streak, '2026-10-03'), 0, 'se rompió');
  recordWin(stats, streak, 'a', 10, 0, '2026-10-05');
  assert.deepEqual(streak, { last: '2026-10-05', count: 1, best: 2 });
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');
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
