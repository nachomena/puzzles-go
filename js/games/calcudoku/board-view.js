/* Calcudoku board: the cages with a thick border (GridBoard with one region per cage), the operation
   in the first cell of each, and the numbers and notes as in Sudoku. */
import { GridBoard } from '../../ui/grid-board.js';
import { notesHtml } from '../../ui/templates.js';
import { cageLabel } from './rules.js';
import { cageTints } from '../../ui/cage-tint.js';

export class CalcudokuBoard extends GridBoard {
  /** @param {{ tint?: boolean }} [opts]  tint: each cage in its own soft colour */
  build(n, cages, { tint = false } = {}){
    const owner = new Array(n * n).fill(0), label = new Array(n * n).fill('');
    cages.forEach((cage, k) => { cage.cells.forEach(i => { owner[i] = k; }); label[Math.min(...cage.cells)] = cageLabel(cage); });
    this.n = n;
    this.labels = label;
    const colours = tint ? cageTints(owner, n) : null;
    super.build(n, owner, colours ? (el, i) => { el.style.setProperty('--cage', colours[owner[i]]); } : null);
    this.root.classList.toggle('is-tinted', tint);
    this.root.style.setProperty('--n', n);
  }

  /** @param {{ values, notes, sel, bad, same }} v  (as in Sudoku; peers = same row or column) */
  render({ values, notes, sel, bad, same }){
    const n = this.n;
    const sees = (a, b) => ((a / n) | 0) === ((b / n) | 0) || a % n === b % n;
    for (let i = 0; i < n * n; i++){
      const d = values[i];
      const flags = (d ? ' is-entry' : '') + (bad && bad[i] ? ' is-bad' : '') +
        (i === sel ? ' is-selected' : sel >= 0 && sees(i, sel) ? ' is-peer' : '') + (same && d === same ? ' is-same' : '');
      const noteSame = !d && same && notes[i] & (1 << (same - 1)) ? same : 0;
      const note = notes[i] ? notesHtml(notes[i], n, noteSame, 'cc-notes') : '';
      const html = (this.labels[i] ? `<b class="cc-label">${this.labels[i]}</b>` : '') + (d ? `<span class="sd-digit">${d}</span>` : note);
      this.paint(i, `${d}|${notes[i]}|${flags}|${noteSame}`, 'cell' + flags, html);
    }
  }
}
