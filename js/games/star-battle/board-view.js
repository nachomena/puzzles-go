/* Tablero de Star Battle: estrellas, estrellas de prueba (con fondo amarillo), X y X automáticas. */
import { GridBoard } from '../../ui/grid-board.js';
import { svgIcon as icon } from '../../ui/templates.js';
import { MARK } from './config.js';

/** Clase e icono de cada marca. */
const MARK_VIEW = {
  [MARK.EMPTY]:  { cls: '',            svg: '' },
  [MARK.X]:      { cls: ' cell--x',    svg: icon('x') },
  [MARK.STAR]:   { cls: ' cell--star', svg: icon('star') },
  [MARK.AUTO_X]: { cls: ' cell--x cell--auto', svg: icon('x') },
  [MARK.TRY]:    { cls: ' cell--star cell--try', svg: icon('star') }
};

/** Color de una región cuando se activa "Colorear regiones". */
const regionColor = (g, N) => `hsl(${(g * 360 / N + 18) % 360} 16% 28%)`;

export class StarBattleBoard extends GridBoard {
  build({ N, regions }, { tint = false } = {}){
    super.build(N, regions, tint ? (el, i) => { el.style.background = regionColor(regions[i], N); } : null);
  }

  /**
   * @param {number[]} marks
   * @param {Uint8Array|null} bad  casillas con error (null = no resaltar)
   */
  render(marks, bad){
    for (let i = 0; i < marks.length; i++){
      const v = marks[i], isBad = !!(bad && bad[i]), view = MARK_VIEW[v];
      const isStar = v === MARK.STAR || v === MARK.TRY;
      // la estrella "salta" al aparecer (no al pasar de prueba a estrella ni al revés)
      this.paint(i, v + (isBad ? 'b' : ''),
        prev => 'cell' + view.cls + (isBad ? ' is-bad' : '') + (isStar && prev[0] !== String(MARK.STAR) && prev[0] !== String(MARK.TRY) ? ' is-new' : ''),
        view.svg);
    }
  }
}
