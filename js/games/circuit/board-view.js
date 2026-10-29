/* Circuit view: 6×5 board, the puzzle's clues, placed pieces and tray.
   The board's pieces are all drawn in one SVG with cell coordinates, so the paths of neighbouring
   pieces line up exactly (with a box per piece, each box's pixel rounding could misalign them slightly). */
import { GridBoard } from '../../ui/grid-board.js';
import { W, H, CELLS, DIRS } from './engine/pieces.js';
import { orient } from './engine/solver.js';
import { footprint } from './engine/arrangements.js';
import { pieceSvg, pieceParts, cellPath } from './piece-svg.js';

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
    this.cluesEl = layer('ct-clues');
    this.piecesEl = layer('ct-pieces');
    this.errorsEl = layer('ct-errors');
    this.board.append(this.cluesEl, this.piecesEl, this.errorsEl);
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
  }

  /** Draws the clues the puzzle gives: dots, shape of the paths or outlines of the pieces. */
  build(p){
    this.grid.build(W, new Array(CELLS).fill(0), null, H);
    const sol = p.solution.map(footprint);
    let svg = '';
    if (p.show.regions){
      // outline of each piece: edges between cells of different pieces (the outer one is already the frame)
      const owner = new Array(CELLS);
      sol.forEach((f, k) => f.cells.forEach(c => owner[c] = k));
      let d = '';
      for (let i = 0; i < CELLS; i++){
        const x = i % W, y = (i / W) | 0;
        if (x < W - 1 && owner[i + 1] !== owner[i]) d += `M${x + 1} ${y}V${y + 1}`;
        if (y < H - 1 && owner[i + W] !== owner[i]) d += `M${x} ${y + 1}H${x + 1}`;
      }
      svg += `<path class="ct-clue-outline" d="${d}"/>`;
    }
    if (p.show.masks){
      let d = '';
      sol.forEach(f => f.cells.forEach((c, k) => { d += cellPath(c % W, (c / W) | 0, f.masks[k]); }));
      svg += `<path class="ct-clue-path" d="${d}"/>`;
    }
    svg += p.dots.map(c => `<circle class="ct-clue-dot" cx="${c % W + .5}" cy="${((c / W) | 0) + .5}" r=".22"/>`).join('');
    this.cluesEl.innerHTML = svg;
  }

  /**
   * @param {object} v
   * @param {(null|{face,rot,x,y})[]} v.place
   * @param {number[]} v.tface @param {number[]} v.trot  side and rotation of each piece in the tray
   * @param {number[]} v.fixed  @param {number} v.sel  selected piece (-1 = none)
   * @param {{cell:number, dir:string}[]|null} v.broken  cut-off exits (null = don't highlight)
   */
  render({ place, tface, trot, fixed, sel, broken }){
    this.piecesEl.innerHTML = place.map((pos, piece) => {
      if (!pos) return '';
      const o = orient(piece, pos.face, pos.rot);
      const cls = (fixed.includes(piece) ? ' is-fixed' : '') + (piece === sel ? ' is-selected' : '');
      return `<g class="ct-piece${cls}" data-piece="${piece}" transform="translate(${pos.x} ${pos.y})" style="--w:${o.w};--h:${o.h}">` +
        `${pieceParts(o, { halo: piece === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = place.map((pos, piece) => {
      if (pos) return '';
      const o = orient(piece, tface[piece], trot[piece]);
      return `<div class="ct-piece is-tray${piece === sel ? ' is-selected' : ''}" data-piece="${piece}" style="--w:${o.w};--h:${o.h}">${pieceSvg(o)}</div>`;
    }).join('');
    this.errorsEl.innerHTML = (broken || []).map(({ cell, dir }) => {
      const [dx, dy] = DIRS[dir], x = cell % W + .5 + dx * .5, y = ((cell / W) | 0) + .5 + dy * .5;
      return `<circle class="ct-broken" cx="${x}" cy="${y}" r=".16"/>`;
    }).join('');
    const canFlip = sel >= 0 && !fixed.includes(sel);
    this.flipBtn.disabled = !canFlip;
  }

  pieceEl(piece){ return this.board.querySelector(`[data-piece="${piece}"]`) || this.tray.querySelector(`[data-piece="${piece}"]`); }
  flash(piece){ const el = this.pieceEl(piece); if (el){ el.classList.remove('is-flash'); el.getBoundingClientRect(); el.classList.add('is-flash'); } }

  /** Loose (HTML) copy of a piece to follow the finger while dragging it. */
  ghostFor(piece, { face, rot }){
    const el = document.createElement('div');
    el.className = 'ct-piece';
    el.innerHTML = pieceSvg(orient(piece, face, rot));
    return el;
  }
  celebrate(){ this.grid.celebrate(); }

  /** Top-left cell for a piece dropped at `rect` (or null if it lands outside). */
  cellFor(rect){
    const b = this.board.getBoundingClientRect(), cell = b.width / W;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) return null;
    return { y: Math.round((rect.top - b.top) / cell), x: Math.round((rect.left - b.left) / cell) };
  }
  cellSize(){ return this.board.getBoundingClientRect().width / W; }
}
