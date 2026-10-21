/* Star Battle board: stars, trial stars (with a gold outline), X marks and automatic X marks. */
import { GridBoard } from '../../ui/grid-board.js';
import { svgIcon as icon } from '../../ui/templates.js';
import { MARK } from './config.js';

/** Class and icon of each mark. */
const MARK_VIEW = {
  [MARK.EMPTY]:  { cls: '',            svg: '' },
  [MARK.X]:      { cls: ' cell--x',    svg: icon('x') },
  [MARK.STAR]:   { cls: ' cell--star', svg: icon('star') },
  [MARK.AUTO_X]: { cls: ' cell--x cell--auto', svg: icon('x') },
  [MARK.TRY]:    { cls: ' cell--star cell--try', svg: icon('star') }
};

/** Colour of a region when "Colour regions" is on. */
const regionColor = (g, N) => `hsl(${(g * 360 / N + 18) % 360} 9% 31%)`;

export class StarBattleBoard extends GridBoard {
  build({ N, regions }, { tint = false } = {}){
    super.build(N, regions, tint ? (el, i) => { el.style.background = regionColor(regions[i], N); } : null);
  }

  /**
   * @param {number[]} marks
   * @param {Uint8Array|null} bad  cells with a mistake (null = don't highlight)
   */
  render(marks, bad){
    for (let i = 0; i < marks.length; i++){
      const v = marks[i], isBad = !!(bad && bad[i]), view = MARK_VIEW[v];
      const isStar = v === MARK.STAR || v === MARK.TRY;
      // the star "pops" when it appears (not when going from trial to star or back)
      this.paint(i, v + (isBad ? 'b' : ''),
        prev => 'cell' + view.cls + (isBad ? ' is-bad' : '') + (isStar && prev[0] !== String(MARK.STAR) && prev[0] !== String(MARK.TRY) ? ' is-new' : ''),
        view.svg);
    }
  }
}
