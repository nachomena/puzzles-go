/* Gridlock view: a 6 × 6 car park with the exit on the right of the red car's row and the vehicles as
   sliding blocks (position in % of the board). */
import { N, EXIT_ROW } from './engine/board.js';
import { t } from '../../i18n/index.js';
import { restartAnimation } from '../../lib/dom.js';

/** Colours of the other vehicles (nothing like red, so it isn't confused). */
const HUES = ['yellow', 'blue', 'green', 'purple', 'aqua', 'pink', 'lime', 'navy', 'sky', 'gray', 'sand', 'teal', 'orange'];
const pct = v => (v / N * 100) + '%';

export class GridlockBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-gl-board]');
    this.lot = this.root.querySelector('.gl-lot');
    this.movesEl = screen.querySelector('[data-gl-moves]');
    this.els = [];
  }

  /** Places the puzzle's vehicles (0 is the red one). */
  build(cars){
    this.cars = cars;
    let cells = '';
    for (let i = 0; i < N * N; i++) cells += '<i></i>';
    this.lot.innerHTML = `<div class="gl-cells">${cells}</div>` +
      `<div class="gl-exit" style="top:${pct(EXIT_ROW)}" aria-hidden="true"></div>` +
      cars.map((car, i) => {
        const w = car.dir === 'h' ? car.len : 1, h = car.dir === 'h' ? 1 : car.len;
        return `<div class="gl-car${i === 0 ? ' is-red' : ''} gl-hue-${i === 0 ? 'red' : HUES[(i - 1) % HUES.length]}${car.dir === 'v' ? ' is-v' : ''}" data-car="${i}" ` +
          `style="width:${pct(w)};height:${pct(h)}"><span></span></div>`;
      }).join('');
    this.els = [...this.lot.querySelectorAll('[data-car]')];
    this.root.classList.remove('is-won');
  }

  /** Moves vehicle i to position p (with decimals while dragging). */
  place(i, p){
    const car = this.cars[i], el = this.els[i];
    el.style.left = pct(car.dir === 'h' ? p : car.line);
    el.style.top = pct(car.dir === 'h' ? car.line : p);
  }

  /** @param {{ pos: number[], moves: number, min: number, dragging?: number }} v */
  render({ pos, moves, min, dragging = -1 }){
    pos.forEach((p, i) => { if (i !== dragging) this.place(i, p); });
    this.els.forEach((el, i) => el.classList.toggle('is-dragging', i === dragging));
    this.movesEl.textContent = t('games.gridlock.moves', { n: moves, min });
  }

  flash(i){ const el = this.els[i]; if (el) restartAnimation(el, 'is-flash'); }
  celebrate(){ this.root.classList.add('is-won'); }

  /** Cells per pixel (to turn the drag into positions). */
  cellSize(){ return this.lot.getBoundingClientRect().width / N; }
}
