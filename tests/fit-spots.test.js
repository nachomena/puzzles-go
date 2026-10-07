import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FitSpots, spotsMarkup } from '../js/ui/fit-spots.js';

test('dónde cabe: el primer toque mira el sitio, el segundo lo devuelve para colocar', () => {
  const same = (a, b) => a.x === b.x;
  const f = new FitSpots(same);
  f.update([{ x: 1 }, { x: 2 }]);
  assert.equal(f.tap(0), null);
  assert.equal(f.chosenIndex, 0);
  assert.equal(f.tap(1), null, 'otro sitio: se mira ese');
  assert.equal(f.chosenIndex, 1);
  assert.deepEqual(f.tap(1), { x: 2 }, 'segundo toque en el mismo: colocar');
  assert.equal(f.chosen, null);
  f.tap(0); f.update([{ x: 2 }]);
  assert.equal(f.chosen, null, 'si el sitio mirado ya no está, se olvida');
  assert.equal(f.tap(5), null, 'toque fuera de rango');
  assert.match(spotsMarkup([{ x: 0, y: 0 }, { x: 1, y: 1 }], 1, .1), /data-spot="1"[^>]*r="0\.1500"/);
});
