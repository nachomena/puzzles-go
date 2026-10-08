import { test } from 'node:test';
import assert from 'node:assert/strict';
import { W, PIECES, ORIENTATIONS, orient, cellsOf } from '../js/games/katamino/engine/pieces.js';
import { countSolutions, solve } from '../js/games/katamino/engine/solver.js';
import { BLOCKS, penta, nextPenta, findRow } from '../js/games/katamino/engine/sets.js';
import { fits, isSolved, check, hintFrom, occupancy } from '../js/games/katamino/rules.js';
import meta, { pentaKey, solvedIn, rowName } from '../js/games/katamino/meta.js';
import game from '../js/games/katamino/index.js';

const all = [...PIECES.keys()];
const byName = s => [...s].map(c => PIECES.findIndex(p => p.name === c));

test('piezas: 12 pentominós distintos con 63 orientaciones en total', () => {
  assert.equal(PIECES.length, 12);
  assert.ok(PIECES.every(p => p.cells.length === 5));
  assert.equal(ORIENTATIONS.flat().length, 63);
  assert.equal(ORIENTATIONS[byName('X')[0]].length, 1);
  assert.equal(ORIENTATIONS[byName('I')[0]].length, 2);
  // voltear y girar al revés deja la misma forma en espejo
  const F = byName('F')[0], a = orient(F, 0, 1).cells, b = orient(F, 1, 3).cells;
  assert.deepEqual(b, a.map(([x, y]) => [orient(F, 0, 1).w - 1 - x, y]).sort((p, q) => p[1] - q[1] || p[0] - q[0]));
});

test('solucionador: 5 × 12 con las 12 piezas tiene 1010 soluciones (4040 con sus simetrías)', () => {
  assert.equal(countSolutions(all), 4040);
  assert.equal(countSolutions(byName('LYT')), 4);   // un único 5 × 3, con sus 4 simetrías
  assert.equal(countSolutions(byName('XIL')), 0);
});

test('solucionador: respeta las piezas ya puestas', () => {
  const pieces = penta('slam', 'A', 5).pieces, sol = solve(pieces);
  const fixed = sol.slice(0, 2);
  const again = solve(pieces, fixed);
  assert.ok(again);
  for (const f of fixed) assert.deepEqual(again.find(s => s.piece === f.piece).pose, f.pose);
  const grid = new Array(W * 5).fill(0);
  for (const { piece, pose } of again) for (const c of cellsOf(piece, pose, 5)) grid[c]++;
  assert.ok(grid.every(n => n === 1));
});

test('desafíos: 512 PENTAS y todos tienen solución', () => {
  let total = 0;
  for (const L of meta.levelOrder){
    let n = 0;
    for (const b of BLOCKS[L]) for (const row of b.rows){
      assert.equal(row.pieces.length, b.to);
      assert.equal(new Set(row.pieces).size, b.to, `${L} ${row.label} sin piezas repetidas`);
      for (let k = b.from; k <= b.to; k++){
        assert.ok(solve(row.pieces.slice(0, k)), `${L} ${row.label} PENTA ${k}`);
        n++;
      }
    }
    assert.equal(n, meta.levels[L].total, L);
    total += n;
  }
  assert.equal(total, 512);
});

test('desafíos: el siguiente PENTA suma una pieza en la fila y luego pasa a la fila siguiente', () => {
  const a3 = penta('small', 'A', 3), a4 = nextPenta('small', 'A', 3);
  assert.deepEqual(a4.pieces.slice(0, 3), a3.pieces);
  assert.equal(a4.n, 4);
  assert.equal(a4.sameRow, true);
  const b = nextPenta('small', 'A', 8);
  assert.equal(b.label, 'B'); assert.equal(b.n, 3); assert.equal(b.sameRow, false);
  // del primer bloque del Slam al segundo (que empieza en el PENTA 6)
  const o = nextPenta('slam', 'N', 9);
  assert.equal(o.label, 'O'); assert.equal(o.n, 6);
  assert.equal(nextPenta('challenge', '40', 10), null);
  assert.equal(penta('small', 'A', 9), null);
  assert.equal(findRow('small', 'Z'), null);
});

test('reglas: encajar, resolver y pistas sin solución única', () => {
  const p = penta('small', 'A', 3), n = p.n, sol = solve(p.pieces);
  const place = PIECES.map(() => null);
  for (const { piece, pose } of sol.slice(0, 1)) place[piece] = pose;
  const [a, b] = [sol[1], sol[2]];
  assert.ok(fits(place, a.piece, a.pose, n));
  assert.equal(fits(place, a.piece, { ...a.pose, x: 9 }, n), false);
  // con lo puesto bien: hay solución y la pista cubre la primera casilla libre
  const res = check(place, p.pieces);
  assert.ok(res.solution);
  const hint = hintFrom(place, p.pieces, res.solution);
  assert.ok(cellsOf(hint.piece, hint.pose, n).includes(occupancy(place, n).indexOf(-1)));
  place[a.piece] = a.pose; place[b.piece] = b.pose;
  assert.ok(isSolved(place, p.pieces));
});

test('reglas: con una pieza mal puesta, la pista la señala', () => {
  const p = penta('grand', 'A', 6), n = p.n, place = PIECES.map(() => null);
  // la primera pieza de la fila en una esquina en la que no hay solución, si existe
  for (const o of ORIENTATIONS[p.pieces[0]]){
    for (let y = 0; y <= n - o.h; y++) for (let x = 0; x <= W - o.w; x++){
      const pose = { m: o.m, r: o.r, x, y };
      if (!solve(p.pieces, [{ piece: p.pieces[0], pose }])){
        place[p.pieces[0]] = pose;
        assert.deepEqual(check(place, p.pieces), { mistake: p.pieces[0] });
        return;
      }
    }
  }
  assert.fail('no se encontró ninguna postura sin solución');
});

test('menú: progreso por desafío, nombres y partida guardada', () => {
  const stats = { [pentaKey('small', 'A', 3)]: { solved: 1 }, [pentaKey('small', 'B', 4)]: { solved: 2 }, [pentaKey('slam', 'A', 5)]: { solved: 1 } };
  assert.equal(solvedIn('small', stats), 2);
  assert.equal(meta.levelMeta('small', stats), '2 de 42 resueltos');
  assert.equal(rowName('12'), 'N°12');
  assert.equal(rowName('B'), 'B');
  const s = { L: 'grand', p: penta('grand', 'B', 7), place: PIECES.map(() => null), tm: [], tr: [], time: 3, done: false, hints: 0 };
  assert.equal(game.statsKey(s), 'grand:B:7');
  assert.equal(meta.sessionLabel(s), 'Gran Slam B · PENTA 7');
  assert.ok(game.restoreSession(structuredClone(s)));
  const bad = structuredClone(s);
  bad.place[s.p.pieces[0]] = { m: 0, r: 0, x: 4, y: 0 };   // se sale por la derecha
  assert.equal(game.restoreSession(bad), null);
  assert.equal(game.restoreSession({ ...structuredClone(s), p: { label: 'Z', n: 7 } }), null);
  assert.deepEqual(game.picker.puzzle('grand', { row: 'B', n: '7' }), s.p);
  assert.ok(game.picker.same(s, penta('grand', 'B', 7)));
});
