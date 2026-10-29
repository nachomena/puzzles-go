/* Killer Sudoku board: like Sudoku's (boxes with a thick border, numbers, notes and highlights) and, on
   top, the cages with a dotted border set slightly inwards and their sum in the corner. */
import { GridBoard } from '../../ui/grid-board.js';
import { notesHtml } from '../../ui/templates.js';
import { SIZE, CELLS, boxOf } from '../sudoku/engine/grid.js';
import { sees } from './engine/cages.js';

const REGIONS = Array.from({ length: CELLS }, (_, i) => boxOf(i));

const INSET = .06;   // how far the dotted line goes into the cell (in cells)
const ROUND = .37;   // radius of the dotted line in the board's corners, which are rounded (in cells)

/**
 * Path of the cage borders, set `inset` inwards from each one. For each cell side that faces out of its
 * cage a parallel line is drawn; its ends are lengthened or shortened so they join well at the corners
 * (outwards, inwards or following the next cell). In the board's four corners the two lines are
 * shortened by `round` and joined by an arc, like the board.
 */
export function cageOutline(cages, n = SIZE, inset = INSET, round = ROUND){
  const owner = new Int16Array(n * n).fill(-1);
  cages.forEach((c, k) => c.cells.forEach(i => { owner[i] = k; }));
  const at = (r, c) => r >= 0 && c >= 0 && r < n && c < n ? owner[r * n + c] : -1;
  const f = v => +v.toFixed(3);
  const segs = [];
  for (let i = 0; i < n * n; i++){
    const r = (i / n) | 0, c = i % n, k = owner[i];
    // sides: outward normal (dr, dc) and tangent (tr, tc)
    for (const [dr, dc, tr, tc] of [[-1, 0, 0, 1], [1, 0, 0, 1], [0, -1, 1, 0], [0, 1, 1, 0]]){
      if (at(r + dr, c + dc) === k) continue;
      const end = e => {
        const side = at(r + e * tr, c + e * tc) === k;
        if (!side) return e * (.5 - inset);                                     // outer corner
        if (at(r + e * tr + dr, c + e * tc + dc) === k) return e * (.5 + inset);  // inner corner
        return e * .5;                                                          // continues into the next cell
      };
      const cx = c + .5 + dc * (.5 - inset), cy = r + .5 + dr * (.5 - inset);
      const a = end(-1), b = end(1);
      segs.push([cx + tc * a, cy + tr * a, cx + tc * b, cy + tr * b]);
    }
  }
  // board corners: the vertex (inset, inset) and its mirrors
  let arcs = '';
  const near = (x, y) => Math.abs(x - y) < 1e-9;
  for (const [x, y] of [[inset, inset], [n - inset, inset], [inset, n - inset], [n - inset, n - inset]]){
    const sx = x < n / 2 ? 1 : -1, sy = y < n / 2 ? 1 : -1;
    for (const s of segs) for (const j of [0, 2]) if (near(s[j], x) && near(s[j + 1], y)){
      if (near(s[1], s[3])) s[j] += sx * round; else s[j + 1] += sy * round;   // horizontal or vertical
    }
    arcs += `M${f(x)} ${f(y + sy * round)}A${round} ${round} 0 0 ${sx * sy > 0 ? 1 : 0} ${f(x + sx * round)} ${f(y)}`;
  }
  return segs.map(([x1, y1, x2, y2]) => `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`).join('') + arcs;
}

export class KillerBoard extends GridBoard {
  build(cages){
    super.build(SIZE, REGIONS);
    this.labels = new Array(CELLS).fill('');
    for (const { cells, sum } of cages) this.labels[cells[0]] = String(sum);   // top-left cell
    this.linesEl.insertAdjacentHTML('afterbegin', `<path class="ks-cage" d="${cageOutline(cages)}"/>`);
  }

  /** @param {{ values, notes, givens, sel, bad, same }} v  (as in Sudoku) */
  render({ values, notes, givens, sel, bad, same }){
    for (let i = 0; i < CELLS; i++){
      const d = values[i], given = !!givens[i];
      const flags =
        (given ? ' is-given' : d ? ' is-entry' : '') +
        (bad && bad[i] ? ' is-bad' : '') +
        (i === sel ? ' is-selected' : sel >= 0 && sees(i, sel) ? ' is-peer' : '') +
        (same && d === same ? ' is-same' : '');
      const noteSame = !d && same && notes[i] & (1 << (same - 1)) ? same : 0;
      const note = notes[i] ? notesHtml(notes[i], SIZE, noteSame, 'ks-notes') : '';
      const html = (this.labels[i] ? `<b class="ks-sum">${this.labels[i]}</b>` : '') + (d ? `<span class="sd-digit">${d}</span>` : note);
      this.paint(i, `${d}|${notes[i]}|${flags}|${noteSame}`, 'cell' + flags, html);
    }
  }
}
