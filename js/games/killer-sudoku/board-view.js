/* Tablero de Killer Sudoku: como el del Sudoku (cajas con borde grueso, números, notas y resaltados)
   y, encima, las jaulas con un borde punteado metido un poco hacia dentro y su suma en la esquina. */
import { GridBoard } from '../../ui/grid-board.js';
import { notesHtml } from '../../ui/templates.js';
import { SIZE, CELLS, boxOf } from '../sudoku/engine/grid.js';
import { sees } from './engine/cages.js';

const REGIONS = Array.from({ length: CELLS }, (_, i) => boxOf(i));

const INSET = .08;   // cuánto entra el punteado en la casilla (en casillas)

/**
 * Trazo del borde de las jaulas, metido `inset` hacia dentro de cada una. Para cada lado de casilla
 * que da fuera de su jaula se dibuja una línea paralela; sus extremos se alargan o acortan para que
 * se unan bien en las esquinas (hacia fuera, hacia dentro o siguiendo a la casilla de al lado).
 */
export function cageOutline(cages, n = SIZE, inset = INSET){
  const owner = new Int16Array(n * n).fill(-1);
  cages.forEach((c, k) => c.cells.forEach(i => { owner[i] = k; }));
  const at = (r, c) => r >= 0 && c >= 0 && r < n && c < n ? owner[r * n + c] : -1;
  const f = v => +v.toFixed(3);
  let d = '';
  for (let i = 0; i < n * n; i++){
    const r = (i / n) | 0, c = i % n, k = owner[i];
    // lados: normal hacia fuera (dr, dc) y tangente (tr, tc)
    for (const [dr, dc, tr, tc] of [[-1, 0, 0, 1], [1, 0, 0, 1], [0, -1, 1, 0], [0, 1, 1, 0]]){
      if (at(r + dr, c + dc) === k) continue;
      const end = e => {
        const side = at(r + e * tr, c + e * tc) === k;
        if (!side) return e * (.5 - inset);                                     // esquina hacia fuera
        if (at(r + e * tr + dr, c + e * tc + dc) === k) return e * (.5 + inset);  // esquina hacia dentro
        return e * .5;                                                          // sigue en la casilla de al lado
      };
      const cx = c + .5 + dc * (.5 - inset), cy = r + .5 + dr * (.5 - inset);
      const a = end(-1), b = end(1);
      d += `M${f(cx + tc * a)} ${f(cy + tr * a)}L${f(cx + tc * b)} ${f(cy + tr * b)}`;
    }
  }
  return d;
}

export class KillerBoard extends GridBoard {
  build(cages){
    super.build(SIZE, REGIONS);
    this.labels = new Array(CELLS).fill('');
    for (const { cells, sum } of cages) this.labels[cells[0]] = String(sum);   // casilla de arriba a la izquierda
    this.linesEl.insertAdjacentHTML('afterbegin', `<path class="ks-cage" d="${cageOutline(cages)}"/>`);
  }

  /** @param {{ values, notes, givens, sel, bad, same }} v  (como el Sudoku) */
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
