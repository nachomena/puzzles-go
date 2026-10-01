/* Tablero genérico de N columnas × R filas (cuadrado por defecto): casillas en una rejilla CSS y,
   encima, un SVG con la rejilla fina y las paredes gruesas entre regiones (regiones de Star Battle,
   cajas de Sudoku...). Casilla i = fila * N + columna. */
import { TIMING } from '../config.js';
import { rowOf, colOf } from '../lib/grid.js';
import { restartAnimation } from '../lib/dom.js';

/** Trazos de la rejilla: finos dentro de una región, gruesos entre regiones. */
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
  /** @param {HTMLElement} root  elemento .board con [data-board-cells] y [data-board-lines] */
  constructor(root){
    this.root = root;
    this.cellsEl = root.querySelector('[data-board-cells]');
    this.linesEl = root.querySelector('[data-board-lines]');
    this.N = 0;
    this.R = 0;
    this.cells = [];
    this.cache = [];  // última clave pintada por casilla, para no tocar el DOM sin necesidad
  }

  /**
   * Crea N×R casillas (R = N por defecto) y dibuja las paredes según `regions`.
   * @param {(el:HTMLElement, i:number) => void} [decorate]  personaliza cada casilla
   */
  build(N, regions, decorate, R = N){
    this.N = N;
    this.R = R;
    this.cellsEl.style.setProperty('--n', N);
    this.cellsEl.style.setProperty('--rows', R);
    const frag = document.createDocumentFragment();
    this.cells = [];
    for (let i = 0; i < N * R; i++){
      const d = document.createElement('div');
      d.className = 'cell';
      // retardo de la ola de victoria, en diagonal
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
      `<path class="board__wall" d="${thick}"/>` +
      `<rect class="board__frame" x="0" y="0" width="${N}" height="${R}"/>`;
    this.root.classList.remove('is-won');
  }

  /** Fuerza a repintar todas las casillas en el próximo render. */
  invalidate(){ this.cache = this.cells.map(() => ''); }

  /** Pinta la casilla i solo si su clave de estado cambió. */
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

  /** Índice de la casilla bajo unas coordenadas de pantalla, o -1. */
  cellAt(x, y){
    const r = this.root.getBoundingClientRect(), N = this.N, R = this.R;
    const c = Math.floor((x - r.left) / r.width * N), q = Math.floor((y - r.top) / r.height * R);
    return (c < 0 || q < 0 || c >= N || q >= R) ? -1 : q * N + c;
  }
  /** Tamaño de una casilla en píxeles. */
  cellSize(){ return this.root.getBoundingClientRect().width / this.N; }
}
