/* Tablero de KenKen: las jaulas con borde grueso (GridBoard con una región por jaula), la operación
   en la primera casilla de cada una, y los números y notas como en el Sudoku. */
import { GridBoard } from '../../ui/grid-board.js';
import { cageLabel } from './rules.js';

export class KenKenBoard extends GridBoard {
  build(n, cages){
    const owner = new Array(n * n).fill(0), label = new Array(n * n).fill('');
    cages.forEach((cage, k) => { cage.cells.forEach(i => { owner[i] = k; }); label[Math.min(...cage.cells)] = cageLabel(cage); });
    this.n = n;
    this.labels = label;
    super.build(n, owner);
    this.root.style.setProperty('--n', n);
  }

  /** @param {{ values, notes, sel, bad, same }} v  (como el Sudoku; peers = misma fila o columna) */
  render({ values, notes, sel, bad, same }){
    const n = this.n, digits = [...Array(n).keys()].map(k => k + 1);
    const sees = (a, b) => ((a / n) | 0) === ((b / n) | 0) || a % n === b % n;
    for (let i = 0; i < n * n; i++){
      const d = values[i];
      const flags = (d ? ' is-entry' : '') + (bad && bad[i] ? ' is-bad' : '') +
        (i === sel ? ' is-selected' : sel >= 0 && sees(i, sel) ? ' is-peer' : '') + (same && d === same ? ' is-same' : '');
      const note = notes[i] ? `<span class="sd-notes kk-notes">${digits.map(k => `<i>${notes[i] & (1 << (k - 1)) ? k : ''}</i>`).join('')}</span>` : '';
      const html = (this.labels[i] ? `<b class="kk-label">${this.labels[i]}</b>` : '') + (d ? `<span class="sd-digit">${d}</span>` : note);
      this.paint(i, `${d}|${notes[i]}|${flags}`, 'cell' + flags, html);
    }
  }
}
