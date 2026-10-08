/* Tablero de Akari: negras (con su número), blancas iluminadas en amarillo tenue, bombillas y marcas. */
import { GridBoard } from '../../ui/grid-board.js';
import { isBlack } from './engine/light.js';

export class AkariBoard extends GridBoard {
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
        this.paint(i, `b${v}${bad ? '!' : ''}`, 'cell ak-black' + (bad ? ' is-bad' : ''), v <= 4 ? `<b>${v}</b>` : '');
        continue;
      }
      const m = marks[i], bad = clash && clash[i] && m === 1;
      const cls = 'cell' + (light[i] ? ' is-lit' : '') + (bad ? ' is-bad' : '');
      const html = m === 1 ? '<i class="ak-bulb"></i>' : m === 2 ? '<i class="ak-mark"></i>' : '';
      this.paint(i, `${m}|${light[i]}|${bad ? 1 : 0}`, cls, html);
    }
  }
}
