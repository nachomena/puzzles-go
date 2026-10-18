/* Kakuro board: black cells with the sums (the run on the right at the top, the one below at the
   bottom, split by a diagonal) and white ones with the numbers and notes, as in Sudoku. */
import { GridBoard } from '../../ui/grid-board.js';
import { notesHtml } from '../../ui/templates.js';

export class KakuroBoard extends GridBoard {
  build(p){
    const { n, white, runs } = p;
    super.build(n, new Array(n * n).fill(0));
    this.n = n;
    this.white = white;
    // sums of each black cell: the run that starts to its right and the one that starts below it
    this.clue = Array.from({ length: n * n }, () => ({ a: 0, d: 0 }));
    for (const r of runs) this.clue[r.clue][r.dir === 'h' ? 'a' : 'd'] = r.sum;
    this.runOf = Array.from({ length: n * n }, () => []);
    for (const r of runs) for (const i of r.cells) this.runOf[i].push(r.cells);
    this.root.style.setProperty('--n', n);
    for (let i = 0; i < n * n; i++){
      if (white[i]) continue;
      const { a, d } = this.clue[i];
      this.paint(i, 'black', 'cell kr-black' + (a || d ? ' kr-clue' : ''),
        (a ? `<b class="kr-a">${a}</b>` : '') + (d ? `<b class="kr-d">${d}</b>` : ''));
    }
  }

  /** @param {{ values, notes, sel, bad, same }} v  (as in Sudoku; peers = the cell's two runs) */
  render({ values, notes, sel, bad, same }){
    const peers = sel >= 0 && this.white[sel] ? new Set(this.runOf[sel].flat()) : null;
    for (let i = 0; i < this.n * this.n; i++){
      if (!this.white[i]) continue;
      const d = values[i] > 0 ? values[i] : 0;
      const flags = (d ? ' is-entry' : '') + (bad && bad[i] ? ' is-bad' : '') +
        (i === sel ? ' is-selected' : peers?.has(i) ? ' is-peer' : '') + (same && d === same ? ' is-same' : '');
      const noteSame = !d && same && notes[i] & (1 << (same - 1)) ? same : 0;
      const html = d ? `<span class="sd-digit">${d}</span>` : notes[i] ? notesHtml(notes[i], 9, noteSame, 'kr-notes') : '';
      this.paint(i, `${d}|${notes[i]}|${flags}|${noteSame}`, 'cell' + flags, html);
    }
  }
}
