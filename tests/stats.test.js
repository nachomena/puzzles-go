import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordWin, average, versusAverage, winDetail, statsRows, levelSummary } from '../js/core/stats.js';

test('stats: record without hints, average and old games without a sum', () => {
  const stats = { easy: { solved: 3, best: 100 } };   // old data: no sum
  assert.equal(average(stats.easy), null);
  let r = recordWin(stats, 'easy', 80, 0);
  assert.deepEqual(r, { record: true, best: 80, prevBest: 100, prevAvg: null });
  r = recordWin(stats, 'easy', 120, 0);
  assert.deepEqual(r, { record: false, best: 80, prevBest: 80, prevAvg: 80 });
  assert.equal(stats.easy.solved, 5);
  assert.equal(average(stats.easy), 100);
  r = recordWin(stats, 'easy', 50, 1);
  assert.equal(r.record, false, 'with hints there is no record');
});

test('stats: win texts', () => {
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

test('stats: rows per level or the ones the game declares', () => {
  const meta = { levelOrder: ['e', 'h'], levels: { e: { name: 'Fácil' }, h: { name: 'Difícil' } } };
  assert.deepEqual(statsRows(meta), [{ key: 'e', name: 'Fácil' }, { key: 'h', name: 'Difícil' }]);
  assert.deepEqual(statsRows({ ...meta, statsRows: [{ key: 'x', name: 'X' }] }), [{ key: 'x', name: 'X' }]);
});

test('game list: record of the games without a level menu', async () => {
  const { bestLine } = await import('../js/ui/hub-view.js');
  const one = { levelOrder: ['x'], levels: { x: { name: 'X' } } };
  assert.equal(bestLine(one, {}), '');
  assert.equal(bestLine(one, { x: { best: 80 } }), 'Récord 1:20');
  const boards = { ...one, statsRows: [{ key: 'english', name: 'Inglés' }, { key: 'european', name: 'Europeo' }] };
  assert.equal(bestLine(boards, { english: { best: 42 } }), 'Récord · Inglés 0:42');
  assert.equal(bestLine(boards, { english: { best: 42 }, european: { best: 190 } }), 'Récord · Inglés 0:42 · Europeo 3:10');
});

test('under the level: the record or, if there are only wins with hints, how many and their average', () => {
  const stats = {};
  assert.equal(levelSummary(stats.easy), '');
  recordWin(stats, 'easy', 100, 2);
  assert.equal(levelSummary(stats.easy), '1 resuelto con pistas · 1:40');
  recordWin(stats, 'easy', 80, 0);
  assert.equal(levelSummary(stats.easy), 'Récord 1:20');
});

test('moves: the game with the fewest is kept, without hints', () => {
  const stats = {};
  recordWin(stats, 'easy', 60, 0, { moves: 20 });
  recordWin(stats, 'easy', 50, 0, { moves: 25 });
  recordWin(stats, 'easy', 50, 1, { moves: 12 });
  assert.equal(stats.easy.bestMoves, 20);
  recordWin(stats, 'easy', 70, 0, { moves: 18 });
  assert.equal(stats.easy.bestMoves, 18);
});
