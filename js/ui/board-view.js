/* Dibuja el tablero: casillas en una rejilla CSS y paredes de región en un SVG encima. */
import { MARK, TIMING } from '../config.js';
import { rowOf, colOf } from '../lib/grid.js';
import { restartAnimation } from '../lib/dom.js';
import { icon } from './icons.js';

/** Clase e icono de cada marca. */
const MARK_VIEW = {
  [MARK.EMPTY]:  { cls: '',            svg: '' },
  [MARK.X]:      { cls: ' cell--x',    svg: icon('x') },
  [MARK.STAR]:   { cls: ' cell--star', svg: icon('star') },
  [MARK.AUTO_X]: { cls: ' cell--x cell--auto', svg: icon('x') }
};

/** Color de una región cuando se activa "Colorear regiones". */
const regionColor = (g, N) => `hsl(${(g * 360 / N + 18) % 360} 16% 28%)`;

/** Trazos de la rejilla: finos dentro de una región, gruesos entre regiones. */
function wallPaths(N, regions){
  let thin = '', thick = '';
  const add = (sameRegion, seg) => { if (sameRegion) thin += seg; else thick += seg; };
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){
    const g = regions[r * N + c];
    if (c < N - 1) add(regions[r * N + c + 1] === g, `M${c + 1} ${r}V${r + 1}`);
    if (r < N - 1) add(regions[(r + 1) * N + c] === g, `M${c} ${r + 1}H${c + 1}`);
  }
  return { thin, thick };
}

export class BoardView {
  constructor(root){
    this.root = root;
    this.cellsEl = root.querySelector('[data-board-cells]');
    this.linesEl = root.querySelector('[data-board-lines]');
    this.N = 0;
    this.cells = [];
    this.cache = [];  // última clave pintada por casilla, para no tocar el DOM sin necesidad
  }

  build({ N, regions }, { tint = false } = {}){
    this.N = N;
    this.cellsEl.style.setProperty('--n', N);
    const frag = document.createDocumentFragment();
    this.cells = [];
    for (let i = 0; i < N * N; i++){
      const d = document.createElement('div');
      d.className = 'cell';
      if (tint) d.style.background = regionColor(regions[i], N);
      frag.appendChild(d);
      this.cells.push(d);
    }
    this.cellsEl.replaceChildren(frag);
    this.invalidate();

    const { thin, thick } = wallPaths(N, regions);
    this.linesEl.setAttribute('viewBox', `0 0 ${N} ${N}`);
    this.linesEl.innerHTML =
      `<path class="board__grid" d="${thin}"/>` +
      `<path class="board__wall" d="${thick}"/>` +
      `<rect class="board__frame" x="0" y="0" width="${N}" height="${N}"/>`;
    this.root.classList.remove('is-won');
  }

  /** Fuerza a repintar todas las casillas en el próximo render. */
  invalidate(){ this.cache = this.cells.map(() => ''); }

  /**
   * @param {number[]} marks
   * @param {number[]} paint  1 si la casilla está pintada con el pincel
   * @param {Uint8Array|null} bad  casillas con error (null = no resaltar)
   */
  render(marks, paint, bad){
    for (let i = 0; i < marks.length; i++){
      const v = marks[i], isBad = !!(bad && bad[i]), painted = !!paint[i];
      const key = v + (isBad ? 'b' : '') + (painted ? 'h' : '');
      if (this.cache[i] === key) continue;
      const wasStar = this.cache[i][0] === String(MARK.STAR);
      this.cache[i] = key;
      const view = MARK_VIEW[v], isStar = v === MARK.STAR;
      this.cells[i].className = 'cell' + view.cls +
        (isBad ? ' is-bad' : '') + (isStar && !wasStar ? ' is-new' : '') + (painted ? ' is-painted' : '');
      this.cells[i].innerHTML = view.svg;
    }
  }

  flash(i){ restartAnimation(this.cells[i], 'is-flash'); }

  /** Animación de victoria: una ola que recorre el tablero en diagonal. */
  celebrate(){
    this.root.classList.add('is-won');
    const N = this.N;
    this.cells.forEach((el, i) => {
      const svg = el.querySelector('svg');
      if (svg) svg.style.animationDelay = (colOf(N, i) + rowOf(N, i)) * TIMING.winWaveStepMs + 'ms';
    });
  }

  /** Índice de la casilla bajo unas coordenadas de pantalla, o -1. */
  cellAt(x, y){
    const r = this.root.getBoundingClientRect(), N = this.N;
    const c = Math.floor((x - r.left) / r.width * N), q = Math.floor((y - r.top) / r.height * N);
    return (c < 0 || q < 0 || c >= N || q >= N) ? -1 : q * N + c;
  }
  /** Tamaño de una casilla en píxeles. */
  cellSize(){ return this.root.getBoundingClientRect().width / this.N; }
}
