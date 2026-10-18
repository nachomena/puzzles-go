import { test } from 'node:test';
import assert from 'node:assert/strict';
import es from '../js/i18n/es.js';
import en from '../js/i18n/en.js';
import { t, lang } from '../js/i18n/index.js';

/** Todas las claves de un diccionario: "games.sudoku.help" → valor. */
const flatten = (d, pre = '') => Object.entries(d).flatMap(([k, v]) =>
  v && typeof v === 'object' && !Array.isArray(v) ? flatten(v, `${pre}${k}.`) : [[pre + k, v]]);
const holes = s => (s.match(/\{\w+\}/g) || []).sort();

test('español e inglés tienen las mismas claves, del mismo tipo y con los mismos huecos', () => {
  const a = new Map(flatten(es)), b = new Map(flatten(en));
  assert.deepEqual([...a.keys()].filter(k => !b.has(k)), [], 'faltan en en.js');
  assert.deepEqual([...b.keys()].filter(k => !a.has(k)), [], 'sobran en en.js');
  for (const [k, v] of a){
    const w = b.get(k);
    assert.equal(typeof w, typeof v, k);
    if (typeof v === 'string') assert.deepEqual(holes(w), holes(v), k);
    if (Array.isArray(v)) assert.equal(w.length, v.length, k);
  }
});

test('t(): huecos, plurales y clave que falta', () => {
  assert.equal(lang, 'es');   // fuera del navegador
  assert.equal(t('common.record', { time: '1:20' }), 'Récord 1:20');
  assert.equal(t('progress.games', { n: 1 }), '1 partida');
  assert.equal(t('progress.games', { n: 3 }), '3 partidas');
  assert.equal(t('levels.expert'), 'Experto');
  assert.equal(t('no.existe'), 'no.existe');
});

test('los textos de la ayuda en inglés también se rellenan', () => {
  const help = en.games.sudoku.help.replace(/\{(\w+)\}/g, (m, k) => k === 'pencil' ? '<svg></svg>' : m);
  assert.ok(!/\{\w+\}/.test(help));
  assert.equal(en.games['rush-hour'].moves({ n: 1, min: 8 }), '1 move · minimum 8');
});
