import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL_ORDER, OLD_LEVELS } from '../js/core/levels.js';
import { mergeStats, migrateData, migrateLevels } from '../js/core/level-migration.js';
import { LEVELS_VERSION } from '../js/core/store.js';
import { CATALOG } from '../js/games/catalog.js';

test('todos los juegos con dificultades usan Fácil, Difícil y Experto', () => {
  for (const { meta } of CATALOG){
    if (['katamino', 'peg-solitaire'].includes(meta.id)) continue;
    assert.deepEqual([...meta.levelOrder], [...LEVEL_ORDER], meta.id);
    assert.deepEqual(LEVEL_ORDER.map(L => meta.levels[L].name), ['Fácil', 'Difícil', 'Experto'], meta.id);
    const t = LEVEL_ORDER.map(L => meta.levels[L].target);
    assert.ok(t[0] < t[1] && t[1] < t[2], `${meta.id}: niveles del generador de menos a más`);
  }
});

test('juntar estadísticas: se suman las partidas y queda el mejor récord', () => {
  assert.deepEqual(mergeStats({ solved: 2, best: 90, sum: 200, timed: 2 }, { solved: 1, best: null, sum: 50, timed: 1, bestMoves: 12 }),
    { solved: 3, best: 90, sum: 250, timed: 3, bestMoves: 12 });
  assert.equal(mergeStats({ solved: 1, best: 80 }, { solved: 1, best: 60 }).best, 60);
});

test('migrar: niveles de cinco, de cuatro y del Sudoku', () => {
  const five = migrateData({
    stats: { starter: { solved: 1, best: 30 }, junior: { solved: 2, best: 50 }, expert: { solved: 1, best: 120 }, wizard: { solved: 1, best: 300 } },
    log: [{ k: 'expert', t: 120 }, { k: 'wizard', t: 300 }], cur: { L: 'master', p: {} }, buffers: { junior: [{}] }
  }, OLD_LEVELS.five);
  assert.deepEqual(Object.keys(five.stats).sort(), ['easy', 'expert', 'hard']);
  assert.equal(five.stats.easy.solved, 3); assert.equal(five.stats.easy.best, 30);
  assert.equal(five.stats.hard.best, 120);   // el Medio de antes (id `expert`)
  assert.equal(five.stats.expert.best, 300);
  assert.deepEqual(five.log.map(e => e.k), ['hard', 'expert']);
  assert.equal(five.cur.L, 'hard');
  assert.deepEqual(five.buffers, {});
  assert.equal(five.levels, LEVELS_VERSION);
  const sudoku = migrateData({ stats: { medium: { solved: 1, best: 200 }, hard: { solved: 1, best: 400 } } }, OLD_LEVELS.three);
  assert.equal(sudoku.stats.hard.best, 200); assert.equal(sudoku.stats.expert.best, 400);
});

test('migrar una sola vez', () => {
  const data = new Map([['k', JSON.stringify({ stats: { expert: { solved: 1, best: 100 } } })]]);
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  const meta = { storageKey: 'k', oldLevels: OLD_LEVELS.five };
  migrateLevels(storage, [meta]);
  migrateLevels(storage, [meta]);   // ya migrado: `expert` es ahora el Experto y no se toca
  assert.deepEqual(Object.keys(JSON.parse(data.get('k')).stats), ['hard']);
});
