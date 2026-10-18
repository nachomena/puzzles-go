/* Fit view: an 11 × 5 board of holes, ball pieces and tray.
   The board's pieces go in one SVG with cell coordinates. */
import { W, H, orient } from './engine/pieces.js';
import { pieceParts, pieceSvg } from './piece-svg.js';
import { restartAnimation } from '../../lib/dom.js';

const SHINE = `<defs><radialGradient id="ft-shine-g"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;

export class FitBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-ft-board]');
    this.svg = this.root.querySelector('svg');
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
    // the shine gradient, once per document (the tray and the drag copy use it too)
    if (!document.getElementById('ft-shine-g')){
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defs.setAttribute('width', '0'); defs.setAttribute('height', '0'); defs.setAttribute('aria-hidden', 'true');
      defs.style.position = 'absolute';
      defs.innerHTML = SHINE;
      document.body.appendChild(defs);
    }
  }

  build(){
    let holes = '';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) holes += `<circle cx="${x + .5}" cy="${y + .5}" r=".36"/>`;
    this.svg.setAttribute('viewBox', `-.25 -.25 ${W + .5} ${H + .5}`);
    this.svg.innerHTML = `<rect class="ft-frame" x="-.25" y="-.25" width="${W + .5}" height="${H + .5}" rx=".45"/>` +
      `<g class="ft-holes">${holes}</g><g class="ft-pieces"></g>`;
    this.piecesEl = this.svg.querySelector('.ft-pieces');
    this.root.classList.remove('is-won');
  }

  /**
   * @param {object} v
   * @param {(null|{m,r,x,y})[]} v.place  @param {number[]} v.tm @param {number[]} v.tr  side and rotation in the tray
   * @param {number[]} v.fixed  @param {number} v.sel  picked piece (-1 = none)
   */
  render({ place, tm, tr, fixed, sel }){
    this.piecesEl.innerHTML = place.map((pose, piece) => {
      if (!pose) return '';
      const o = orient(piece, pose.m, pose.r);
      const cls = (fixed.includes(piece) ? ' is-fixed' : '') + (piece === sel ? ' is-selected' : '');
      return `<g class="ft-piece${cls}" data-piece="${piece}" transform="translate(${pose.x} ${pose.y})" style="--w:${o.w};--h:${o.h}">` +
        `${pieceParts(piece, pose.m, pose.r, { halo: piece === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = place.map((pose, piece) => {
      if (pose) return '';
      const o = orient(piece, tm[piece], tr[piece]);
      return `<div class="ft-piece is-tray${piece === sel ? ' is-selected' : ''}" data-piece="${piece}" style="--w:${o.w};--h:${o.h}">${pieceSvg(piece, tm[piece], tr[piece])}</div>`;
    }).join('');
    this.flipBtn.disabled = sel < 0 || fixed.includes(sel);
  }

  pieceEl(piece){ return this.svg.querySelector(`[data-piece="${piece}"]`) || this.tray.querySelector(`[data-piece="${piece}"]`); }
  flash(piece){ const el = this.pieceEl(piece); if (el) restartAnimation(el, 'is-flash'); }
  celebrate(){ this.root.classList.add('is-won'); }

  /** Loose (HTML) copy of a piece to follow the finger while dragging it. */
  ghostFor(piece, { m, r }){
    const el = document.createElement('div');
    el.className = 'ft-piece';
    el.innerHTML = pieceSvg(piece, m, r);
    return el;
  }

  /** On-screen rectangle of the cells (without the frame). */
  #cells(){
    const b = this.svg.getBoundingClientRect(), unit = b.width / (W + .5);
    return { left: b.left + .25 * unit, top: b.top + .25 * unit, unit };
  }
  /** Top-left cell for a piece dropped at `rect` (or null if it lands outside). */
  cellFor(rect){
    const { left, top, unit } = this.#cells();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    if (cx < left || cx > left + W * unit || cy < top || cy > top + H * unit) return null;
    return { x: Math.round((rect.left - left) / unit), y: Math.round((rect.top - top) / unit) };
  }
  cellSize(){ return this.#cells().unit; }
}
