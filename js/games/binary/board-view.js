/* Binary board: dark empty cells and tiles of two colours; the given ones carry a dot. */
import { GridBoard } from '../../ui/grid-board.js';

export class BinaryBoard extends GridBoard {
  build(n, givens){
    this.givens = givens;
    super.build(n, new Array(n * n).fill(0));
    this.root.style.setProperty('--n', n);
  }

  /** @param {{ g: number[], bad: Uint8Array|null }} v */
  render({ g, bad }){
    for (let i = 0; i < g.length; i++){
      const v = g[i], given = !!this.givens[i], wrong = !!(bad && bad[i]);
      const html = v ? `<i class="bn-tile bn-${v}${given ? ' is-given' : ''}"></i>` : '';
      this.paint(i, `${v}|${wrong ? 1 : 0}`, 'cell' + (given ? ' is-given' : '') + (wrong ? ' is-bad' : ''), html);
    }
  }
}
