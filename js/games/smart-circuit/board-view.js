/* Vista de Smart Circuit: tablero de 8×4, pistas del reto, piezas colocadas y bandeja.
   Las piezas del tablero se dibujan todas en un mismo SVG con coordenadas de casilla, así los
   caminos de piezas vecinas encajan exactos (con una caja por pieza, el redondeo a píxeles de cada
   caja podía desalinearlos un poco). */
import { GridBoard } from '../../ui/grid-board.js';
import { W, H, CELLS, DIRS } from './engine/pieces.js';
import { orient } from './engine/solver.js';
import { footprint } from './engine/arrangements.js';
import { pieceSvg, pieceParts, cellPath } from './piece-svg.js';
import { spotsMarkup } from '../../ui/fit-spots.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const layer = cls => {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('class', cls);
  el.setAttribute('viewBox', `0 0 ${W} ${H}`);
  return el;
};

export class CircuitBoardView {
  constructor(screen){
    this.screen = screen;
    this.grid = new GridBoard(screen.querySelector('.board'));
    this.board = this.grid.root;
    this.cluesEl = layer('sc-clues');
    this.piecesEl = layer('sc-pieces');
    this.errorsEl = layer('sc-errors');
    this.spotsEl = layer('sc-spots');
    this.board.append(this.cluesEl, this.piecesEl, this.errorsEl, this.spotsEl);
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
  }

  /** Dibuja las pistas que da el reto: puntos, forma de los caminos o siluetas de las piezas. */
  build(p){
    this.grid.build(W, new Array(CELLS).fill(0), null, H);
    const sol = p.solution.map(footprint);
    let svg = '';
    if (p.show.regions){
      // silueta de cada pieza: bordes entre casillas de piezas distintas
      const owner = new Array(CELLS);
      sol.forEach((f, k) => f.cells.forEach(c => owner[c] = k));
      let d = '';
      for (let i = 0; i < CELLS; i++){
        const x = i % W, y = (i / W) | 0;
        if (x === W - 1 || owner[i + 1] !== owner[i]) d += `M${x + 1} ${y}V${y + 1}`;
        if (y === H - 1 || owner[i + W] !== owner[i]) d += `M${x} ${y + 1}H${x + 1}`;
        if (x === 0) d += `M0 ${y}V${y + 1}`;
        if (y === 0) d += `M${x} 0H${x + 1}`;
      }
      svg += `<path class="sc-clue-outline" d="${d}"/>`;
    }
    if (p.show.masks){
      let d = '';
      sol.forEach(f => f.cells.forEach((c, k) => { d += cellPath(c % W, (c / W) | 0, f.masks[k]); }));
      svg += `<path class="sc-clue-path" d="${d}"/>`;
    }
    svg += p.dots.map(c => `<circle class="sc-clue-dot" cx="${c % W + .5}" cy="${((c / W) | 0) + .5}" r=".22"/>`).join('');
    this.cluesEl.innerHTML = svg;
  }

  /**
   * @param {object} v
   * @param {(null|{face,rot,x,y})[]} v.place
   * @param {number[]} v.tface @param {number[]} v.trot  cara y giro de cada pieza en la bandeja
   * @param {number[]} v.fixed  @param {number} v.sel  pieza seleccionada (-1 = ninguna)
   * @param {{cell:number, dir:string}[]|null} v.broken  salidas cortadas (null = no resaltar)
   * @param {{x:number,y:number}[]} [v.spots]  centros de los sitios donde cabe la pieza elegida
   * @param {number} [v.chosenSpot]  sitio que se está mirando  @param {object|null} [v.chosen]  su posición
   */
  render({ place, tface, trot, fixed, sel, broken, spots = [], chosenSpot = -1, chosen = null }){
    this.piecesEl.innerHTML = place.map((pos, piece) => {
      if (!pos) return '';
      const o = orient(piece, pos.face, pos.rot);
      const cls = (fixed.includes(piece) ? ' is-fixed' : '') + (piece === sel ? ' is-selected' : '');
      return `<g class="sc-piece${cls}" data-piece="${piece}" transform="translate(${pos.x} ${pos.y})" style="--w:${o.w};--h:${o.h}">` +
        `${pieceParts(o, { halo: piece === sel })}</g>`;
    }).join('') + (chosen && sel >= 0
      ? `<g class="sc-piece is-chosen" transform="translate(${chosen.x} ${chosen.y})">${pieceParts(orient(sel, chosen.face, chosen.rot))}</g>` : '');
    this.spotsEl.innerHTML = spotsMarkup(spots, chosenSpot, .15);
    this.tray.innerHTML = place.map((pos, piece) => {
      if (pos) return '';
      const o = orient(piece, tface[piece], trot[piece]);
      return `<div class="sc-piece is-tray${piece === sel ? ' is-selected' : ''}" data-piece="${piece}" style="--w:${o.w};--h:${o.h}">${pieceSvg(o)}</div>`;
    }).join('');
    this.errorsEl.innerHTML = (broken || []).map(({ cell, dir }) => {
      const [dx, dy] = DIRS[dir], x = cell % W + .5 + dx * .5, y = ((cell / W) | 0) + .5 + dy * .5;
      return `<circle class="sc-broken" cx="${x}" cy="${y}" r=".16"/>`;
    }).join('');
    const canFlip = sel >= 0 && !fixed.includes(sel);
    this.flipBtn.disabled = !canFlip;
  }

  pieceEl(piece){ return this.board.querySelector(`[data-piece="${piece}"]`) || this.tray.querySelector(`[data-piece="${piece}"]`); }
  flash(piece){ const el = this.pieceEl(piece); if (el){ el.classList.remove('is-flash'); el.getBoundingClientRect(); el.classList.add('is-flash'); } }

  /** Copia suelta (HTML) de una pieza para seguir al dedo al arrastrarla. */
  ghostFor(piece, { face, rot }){
    const el = document.createElement('div');
    el.className = 'sc-piece';
    el.innerHTML = pieceSvg(orient(piece, face, rot));
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
