import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FitSpots, spotsMarkup } from '../js/ui/fit-spots.js';

test('where it fits: the first tap looks at the spot, the second returns it to place', () => {
  const same = (a, b) => a.x === b.x;
  const f = new FitSpots(same);
  f.update([{ x: 1 }, { x: 2 }]);
  assert.equal(f.tap(0), null);
  assert.equal(f.chosenIndex, 0);
  assert.equal(f.tap(1), null, 'another spot: that one is looked at');
  assert.equal(f.chosenIndex, 1);
  assert.deepEqual(f.tap(1), { x: 2 }, 'second tap on the same one: place');
  assert.equal(f.chosen, null);
  f.tap(0); f.update([{ x: 2 }]);
  assert.equal(f.chosen, null, 'if the spot being looked at is gone, it is forgotten');
  assert.equal(f.tap(5), null, 'tap out of range');
  assert.match(spotsMarkup([{ x: 0, y: 0 }, { x: 1, y: 1 }], 1, .1), /data-spot="1"[^>]*r="0\.1500"/);
});
