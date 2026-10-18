/* Generic board of N columns × R rows (square by default): cells in a CSS grid and, on top, an SVG
   with the thin grid and the thick walls between regions (Star Battle regions, Sudoku boxes...).
   Cell i = row * N + column. */
import { TIMING } from '../config.js';
import { rowOf, colOf } from '../lib/grid.js';
import { restartAnimation } from '../lib/dom.js';

/** Grid strokes: thin inside a region, thick between regions. */
export function wallPaths(N, regions, R = N){
  let thin = '', thick = '';
  const add = (sameRegion, seg) => { if (sameRegion) thin += seg; else thick += seg; };
  for (let r = 0; r < R; r++) for (let c = 0; c < N; c++){
    const g = regions[r * N + c];
    if (c < N - 1) add(regions[r * N + c + 1] === g, `M${c + 1} ${r}V${r + 1}`);
    if (r < R - 1) add(regions[(r + 1) * N + c] === g, `M${c} ${r + 1}H${c + 1}`);
  }
  return { thin, thick };
}

export class GridBoard {
  /** @param {HTMLElement} root  .board element with [data-board-cells] and [data-board-lines] */
  constructor(root){
    this.root = root;
    this.cellsEl = root.querySelector('[data-board-cells]');
    this.linesEl = root.querySelector('[data-board-lines]');
    this.N = 0;
    this.R = 0;
    this.cells = [];
    this.cache = [];  // last key drawn per cell, so the DOM isn't touched needlessly
  }

  /**
   * Creates N×R cells (R = N by default) and draws the walls according to `regions`.
   * @param {(el:HTMLElement, i:number) => void} [decorate]  customises each cell
   */
  build(N, regions, decorate, R = N){
    this.N = N;
    this.R = R;
    this.cellsEl.style.setProperty('--n', N);
    this.cellsEl.style.setProperty('--rows', R);
    const frag = document.createDocumentFragment();
    // the four (rounded) corners: each game adjusts what it draws in them (labels, tiles)
    const corners = { 0: 'tl', [N - 1]: 'tr', [(R - 1) * N]: 'bl', [N * R - 1]: 'br' };
    this.cells = [];
    for (let i = 0; i < N * R; i++){
      const d = document.createElement('div');
      d.className = 'cell';
      if (corners[i]) d.dataset.corner = corners[i];
      // delay of the win wave, diagonally
      d.style.setProperty('--wave-delay', (colOf(N, i) + rowOf(N, i)) * TIMING.winWaveStepMs + 'ms');
      decorate?.(d, i);
      frag.appendChild(d);
      this.cells.push(d);
    }
    this.cellsEl.replaceChildren(frag);
    this.invalidate();

    const { thin, thick } = wallPaths(N, regions, R);
    this.linesEl.setAttribute('viewBox', `0 0 ${N} ${R}`);
    this.linesEl.innerHTML =
      `<path class="board__grid" d="${thin}"/>` +
      `<path class="board__wall" d="${thick}"/>`;   // the frame is drawn by the CSS (.board::after), with rounded corners
    this.root.classList.remove('is-won');
  }

  /** Forces all cells to be redrawn on the next render. */
  invalidate(){ this.cache = this.cells.map(() => ''); }

  /** Draws cell i only if its state key changed. */
  paint(i, key, className, html){
    if (this.cache[i] === key) return false;
    const prev = this.cache[i];
    this.cache[i] = key;
    this.cells[i].className = typeof className === 'function' ? className(prev) : className;
    this.cells[i].innerHTML = html;
    return true;
  }

  flash(i){ restartAnimation(this.cells[i], 'is-flash'); }
  celebrate(){ this.root.classList.add('is-won'); }

  /** Index of the cell under some screen coordinates, or -1. */
  cellAt(x, y){
    const r = this.root.getBoundingClientRect(), N = this.N, R = this.R;
    const c = Math.floor((x - r.left) / r.width * N), q = Math.floor((y - r.top) / r.height * R);
    return (c < 0 || q < 0 || c >= N || q >= R) ? -1 : q * N + c;
  }
  /** Size of a cell in pixels. */
  cellSize(){ return this.root.getBoundingClientRect().width / this.N; }
}
