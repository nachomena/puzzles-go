/* Vista de Zip: tablero de N × N, el camino como un trazo grueso entre centros de casilla y los
   números en círculos encima. */
import { GridBoard } from '../../ui/grid-board.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const at = (n, c) => [c % n + .5, ((c / n) | 0) + .5];

export class ZipBoardView {
  constructor(screen){
    this.grid = new GridBoard(screen.querySelector('.board'));
    this.layer = document.createElementNS(SVG_NS, 'svg');
    this.layer.setAttribute('class', 'zp-layer');
    this.grid.root.append(this.layer);
  }

  build(n, nums){
    this.n = n;
    this.grid.build(n, new Array(n * n).fill(0));
    this.grid.root.style.setProperty('--n', n);
    this.layer.setAttribute('viewBox', `0 0 ${n} ${n}`);
    const dots = nums.map((c, k) => { const [x, y] = at(n, c); return `<g class="zp-num" transform="translate(${x} ${y})"><circle r=".33"/><text dy=".02">${k + 1}</text></g>`; }).join('');
    this.layer.innerHTML = `<path class="zp-path"/><g class="zp-nums">${dots}</g>`;
    this.pathEl = this.layer.querySelector('.zp-path');
  }

  /** @param {{ path: number[] }} v */
  render({ path }){
    const n = this.n;
    this.pathEl.setAttribute('d', path.length ? 'M' + path.map(c => at(n, c).join(' ')).join('L') : '');
    // casillas recorridas un poco más claras
    const on = new Set(path);
    this.grid.cells.forEach((el, i) => el.classList.toggle('is-on', on.has(i)));
  }

  flash(i){ this.grid.flash(i); }
  celebrate(){ this.grid.celebrate(); }
  cellAt(x, y){ return this.grid.cellAt(x, y); }
  cellSize(){ return this.grid.cellSize(); }
}
