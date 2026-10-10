import { test } from 'node:test';
import assert from 'node:assert/strict';
import { logWin, winStrip, isEntry, LOG_CAP } from '../js/core/progress.js';
import { winStripSvg } from '../js/ui/win-strip.js';

test('registro: apunta cada partida y descarta las más antiguas al pasar del tope', () => {
  const log = [];
  logWin(log, { key: 'easy', time: 90, hints: 0, at: 1 });
  logWin(log, { key: 'easy', time: 80, hints: 1, moves: 12, at: 2 });
  assert.deepEqual(log, [{ k: 'easy', t: 90, h: 0, at: 1 }, { k: 'easy', t: 80, h: 1, at: 2, m: 12 }]);
  assert.ok(log.every(isEntry));
  for (let i = 0; i < LOG_CAP + 5; i++) logWin(log, { key: 'hard', time: i, hints: 0, at: 10 + i });
  assert.equal(log.length, LOG_CAP);
  assert.equal(log[0].t, 5);
});

test('tira de la victoria: la última entre las anteriores del mismo nivel y sin pistas', () => {
  const log = [];
  assert.equal(winStrip(log), null);
  logWin(log, { key: 'easy', time: 100, hints: 0, at: 1 });
  assert.equal(winStrip(log), null, 'la primera partida no tiene con qué compararse');
  logWin(log, { key: 'hard', time: 500, hints: 0, at: 2 });   // otro nivel: no cuenta
  logWin(log, { key: 'easy', time: 60, hints: 2, at: 3 });    // con pistas: no cuenta
  logWin(log, { key: 'easy', time: 80, hints: 0, at: 4 });
  logWin(log, { key: 'easy', time: 70, hints: 1, at: 5 });
  assert.deepEqual(winStrip(log), { times: [100, 80], today: 70, hints: 1, avg: 90 });
  const svg = winStripSvg(winStrip(log));
  assert.match(svg, /^<svg/);
  assert.equal((svg.match(/win-strip__dot/g) || []).length, 2);
  assert.match(svg, /is-hints/);
  assert.equal(winStripSvg(null), '');
});

test('progreso: periodos, tendencia, media móvil y reparto', async () => {
  const { inRange, trend, movingAverage, timeStep, histogram, bestTime, meanTime } = await import('../js/core/progress.js');
  const D = 864e5, now = 100 * D;
  // antes: 3 partidas de ~100 s hace 40 días; ahora: 3 de ~80 s
  const e = [[45, 100], [42, 104], [38, 96], [20, 82], [10, 78], [2, 80]].map(([ago, t]) => ({ k: 'a', t, h: 0, at: now - ago * D }));
  assert.deepEqual(trend(e, now), { kind: 'faster', pct: 20 });
  assert.deepEqual(trend(e.slice(0, 4), now), { kind: 'few', pct: 0 });
  assert.equal(inRange(e, 'months3', now).length, 6);
  assert.equal(inRange([...Array(30)].map((_, i) => ({ t: i, at: i })), 'last20').length, 20);
  assert.deepEqual(movingAverage(e.slice(0, 3), 2).map(p => p.t), [100, 102, 100]);
  assert.equal(bestTime([...e, { k: 'a', t: 10, h: 1, at: now }]), 78, 'con pistas no cuenta');
  assert.equal(meanTime([]), null);
  assert.equal(timeStep(70, 110), 10);
  assert.equal(timeStep(100, 1000), 300);
  assert.deepEqual(histogram([61, 65, 130, 70], 60), { start: 60, step: 60, counts: [3, 1] });
});

test('filas del progreso: por nivel, o agrupadas como diga el juego', async () => {
  const { progressRows } = await import('../js/core/progress.js');
  const meta = { levels: { easy: { name: 'Fácil' }, hard: { name: 'Difícil' } }, levelOrder: ['easy', 'hard'] };
  const log = [{ k: 'easy', t: 50, h: 0, at: 1 }, { k: 'easy', t: 40, h: 1, at: 2 }];
  const rows = progressRows(meta, { easy: { solved: 5, best: 45 } }, log);
  assert.deepEqual(rows.map(r => [r.key, r.name, r.entries.length, r.best, r.solved]), [['easy', 'Fácil', 2, 45, 5], ['hard', 'Difícil', 0, null, 0]]);
  const kat = (await import('../js/games/katamino/meta.js')).default;
  const k = progressRows(kat, {}, [{ k: 'grand:B:7', t: 90, h: 0, at: 1 }, { k: 'small:A:5', t: 30, h: 0, at: 2 }, { k: 'slam:C:7', t: 70, h: 0, at: 3 }]);
  assert.deepEqual(k.map(r => [r.name, r.entries.length, r.best]), [['PENTA 5', 1, 30], ['PENTA 7', 2, 70]]);
});
