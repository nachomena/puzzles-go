/* Light Up board: black cells (with their number), white cells lit in soft yellow, bulbs and marks. */
import { GridBoard } from '../../ui/grid-board.js';
import { isBlack } from './engine/light.js';

export class LightUpBoard extends GridBoard {
  build(n, cells){
    this.n = n; this.cellsData = cells;
    super.build(n, new Array(n * n).fill(0));
    this.root.style.setProperty('--n', n);
  }

  /** @param {{ marks: number[], light: Uint8Array, clash: Uint8Array|null, over: Uint8Array|null }} v */
  render({ marks, light, clash, over }){
    const cells = this.cellsData;
    for (let i = 0; i < cells.length; i++){
      const v = cells[i];
      if (isBlack(v)){
        const bad = over && over[i];
        this.paint(i, `b${v}${bad ? '!' : ''}`, 'cell lu-black' + (bad ? ' is-bad' : ''), v <= 4 ? `<b>${v}</b>` : '');
        continue;
      }
      const m = marks[i], bad = clash && clash[i] && m === 1;
      const cls = 'cell' + (light[i] ? ' is-lit' : '') + (bad ? ' is-bad' : '');
      const html = m === 1 ? '<i class="lu-bulb"></i>' : m === 2 ? '<i class="lu-mark"></i>' : '';
      this.paint(i, `${m}|${light[i]}|${bad ? 1 : 0}`, cls, html);
    }
  }
}
