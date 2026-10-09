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
