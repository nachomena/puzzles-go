import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cageTints } from '../js/ui/cage-tint.js';
import { generate as killer } from '../js/games/killer-sudoku/engine/generator.js';
import { generate as calcudoku } from '../js/games/calcudoku/engine/generator.js';
import { runToEnd } from '../js/lib/iter.js';

/** True if two cages that touch (side by side) have the same colour. */
function clash(owner, n, colours){
  for (let i = 0; i < n * n; i++){
    if (i % n < n - 1 && owner[i] !== owner[i + 1] && colours[owner[i]] === colours[owner[i + 1]]) return true;
    if (i + n < n * n && owner[i] !== owner[i + n] && colours[owner[i]] === colours[owner[i + n]]) return true;
  }
  return false;
}
const ownerOf = (cages, n) => { const o = new Array(n * n).fill(0); cages.forEach((c, k) => c.cells.forEach(i => { o[i] = k; })); return o; };

test('cageTints: one colour per cage, none shared by cages that touch', () => {
  // 4 × 4 board in four 2 × 2 quarters: each touches two others
  const owner = [0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 2, 2, 3, 3];
  const colours = cageTints(owner, 4);
  assert.equal(colours.length, 4);
  assert.ok(!clash(owner, 4, colours));
  assert.ok(colours.every(c => /^hsl\(\d+ 16% 26%\)$/.test(c)));
});

test('cageTints: the real boards of Killer Sudoku and Calcudoku never repeat a colour between neighbouring cages', () => {
  for (let k = 0; k < 8; k++){
    const p = runToEnd(killer(1 + (k % 3)));
    assert.ok(p, 'killer');
    assert.ok(!clash(ownerOf(p.cages, 9), 9, cageTints(ownerOf(p.cages, 9), 9)));
    const q = runToEnd(calcudoku(1 + (k % 3)));
    assert.ok(q, 'calcudoku');
    assert.ok(!clash(ownerOf(q.cages, q.n), q.n, cageTints(ownerOf(q.cages, q.n), q.n)));
  }
});
