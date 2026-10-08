/* Vista de Katamino: tablero de 5 columnas por n filas (el listón al final), piezas y bandeja.
   Las piezas del tablero van todas en un mismo SVG con coordenadas de casilla, como en Smart Circuit. */
import { GridBoard } from '../../ui/grid-board.js';
import { W, orient } from './engine/pieces.js';
import { pieceParts, pieceSvg } from './piece-svg.js';

export class KataminoBoardView {
  constructor(screen){
    this.screen = screen;
    this.grid = new GridBoard(screen.querySelector('.board'));
    this.board = this.grid.root;
    this.piecesEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.piecesEl.setAttribute('class', 'km-pieces');
    this.board.append(this.piecesEl);
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
    this.n = 0;
  }

  /** Tablero de n filas. */
  build(n){
    this.n = n;
    this.grid.build(W, new Array(W * n).fill(0), null, n);
    this.board.parentElement.style.setProperty('--rows', n);   // tablero y listón
    this.piecesEl.setAttribute('viewBox', `0 0 ${W} ${n}`);
  }

  /**
   * @param {object} v
   * @param {number[]} v.pieces  piezas del PENTA
   * @param {(null|{m,r,x,y})[]} v.place
   * @param {number[]} v.tm @param {number[]} v.tr  cara y giro de cada pieza en la bandeja
   * @param {number} v.sel  pieza elegida (-1 = ninguna)
   */
  render({ pieces, place, tm, tr, sel }){
    this.piecesEl.innerHTML = pieces.map(piece => {
      const pose = place[piece];
      if (!pose) return '';
      const o = orient(piece, pose.m, pose.r);
      return `<g class="km-piece${piece === sel ? ' is-selected' : ''}" data-piece="${piece}" transform="translate(${pose.x} ${pose.y})" style="--w:${o.w};--h:${o.h}">` +
        `${pieceParts(piece, pose.m, pose.r, { halo: piece === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = pieces.map(piece => {
      if (place[piece]) return '';
      const o = orient(piece, tm[piece], tr[piece]);
      return `<div class="km-piece is-tray${piece === sel ? ' is-selected' : ''}" data-piece="${piece}" style="--w:${o.w};--h:${o.h}">${pieceSvg(piece, tm[piece], tr[piece])}</div>`;
    }).join('');
    this.flipBtn.disabled = sel < 0;
  }

  pieceEl(piece){ return this.board.querySelector(`[data-piece="${piece}"]`) || this.tray.querySelector(`[data-piece="${piece}"]`); }
  flash(piece){ const el = this.pieceEl(piece); if (el){ el.classList.remove('is-flash'); el.getBoundingClientRect(); el.classList.add('is-flash'); } }

  /** Copia suelta (HTML) de una pieza para seguir al dedo al arrastrarla. */
  ghostFor(piece, { m, r }){
    const el = document.createElement('div');
    el.className = 'km-piece';
    el.innerHTML = pieceSvg(piece, m, r);
    return el;
  }
  celebrate(){ this.grid.celebrate(); }

  /** Casilla de la esquina superior izquierda para una pieza soltada en `rect` (o null si cae fuera). */
  cellFor(rect){
    const b = this.board.getBoundingClientRect(), cell = b.width / W;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) return null;
    return { y: Math.round((rect.top - b.top) / cell), x: Math.round((rect.left - b.left) / cell) };
  }
  cellSize(){ return this.board.getBoundingClientRect().width / W; }
}
