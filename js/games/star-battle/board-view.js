/* Tablero de Star Battle: estrellas, X, X automáticas y pintura del pincel. */
import { GridBoard } from '../../ui/grid-board.js';
import { svgIcon as icon } from '../../ui/templates.js';
import { MARK } from './config.js';

/** Clase e icono de cada marca. */
const MARK_VIEW = {
  [MARK.EMPTY]:  { cls: '',            svg: '' },
  [MARK.X]:      { cls: ' cell--x',    svg: icon('x') },
  [MARK.STAR]:   { cls: ' cell--star', svg: icon('star') },
  [MARK.AUTO_X]: { cls: ' cell--x cell--auto', svg: icon('x') }
};

/** Color de una región cuando se activa "Colorear regiones". */
const regionColor = (g, N) => `hsl(${(g * 360 / N + 18) % 360} 16% 28%)`;

export class StarBattleBoard extends GridBoard {
  build({ N, regions }, { tint = false } = {}){
    super.build(N, regions, tint ? (el, i) => { el.style.background = regionColor(regions[i], N); } : null);
  }

  /**
   * @param {number[]} marks
   * @param {number[]} paint  1 si la casilla está pintada con el pincel
   * @param {Uint8Array|null} bad  casillas con error (null = no resaltar)
   */
  render(marks, paint, bad){
    const STAR_KEY = String(MARK.STAR);
    for (let i = 0; i < marks.length; i++){
      const v = marks[i], isBad = !!(bad && bad[i]), painted = !!paint[i];
      const view = MARK_VIEW[v], isStar = v === MARK.STAR;
      this.paint(i, v + (isBad ? 'b' : '') + (painted ? 'h' : ''),
        prev => 'cell' + view.cls + (isBad ? ' is-bad' : '') +
          (isStar && prev[0] !== STAR_KEY ? ' is-new' : '') + (painted ? ' is-painted' : ''),
        view.svg);
    }
  }
}
