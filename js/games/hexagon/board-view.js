/* Hexagon view: hexagonal board with its 19 pegs, placed pieces, drag preview and tray. The whole board
   is a single SVG (distance between pegs = 1). */
import { PIECES, POSTS } from './engine/pieces.js';
import { postXY, toDoubled, pieceParts, looseSvg } from './piece-svg.js';
import { spotsMarkup } from '../../ui/fit-spots.js';

/** Radius of the hexagonal frame (to its corners). */
const FRAME = 3.3;
/** Size of the copy that follows the finger, relative to the board. */
const GHOST_SCALE = .75;

const hexPath = (cx, cy, r, flat = true) => {
  let d = '';
  for (let k = 0; k < 6; k++){
    const a = (k * 60 + (flat ? 0 : 30)) * Math.PI / 180;
    d += (k ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(4) + ' ' + (cy + r * Math.sin(a)).toFixed(4);
  }
  return d + 'Z';
};

export class HexagonBoardView {
  constructor(screen){
    this.screen = screen;
    this.root = screen.querySelector('[data-hx-board]');
    this.svg = this.root.querySelector('svg');
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
    this.ghost = null;
  }

  build(){
    const posts = POSTS.map(p => { const [x, y] = postXY(p); return `<path d="${hexPath(x, y, .2)}"/>`; }).join('');
    this.svg.innerHTML =
      `<path class="hx-frame" d="${hexPath(0, 0, FRAME)}"/>` +
      `<path class="hx-floor" d="${hexPath(0, 0, FRAME - .16)}"/>` +
      `<g class="hx-posts">${posts}</g><g class="hx-pieces"></g><g class="hx-chosen"></g><g class="hx-spots"></g><g class="hx-preview"></g>`;
    this.piecesEl = this.svg.querySelector('.hx-pieces');
    this.previewEl = this.svg.querySelector('.hx-preview');
    this.chosenEl = this.svg.querySelector('.hx-chosen');
    this.spotsEl = this.svg.querySelector('.hx-spots');
    this.root.classList.remove('is-won');
  }

  /**
   * @param {object} v
   * @param {(null|{m,r,tu,tv})[]} v.place  @param {number[]} v.tm @param {number[]} v.tr  side and rotation in the tray
   * @param {number[]} v.fixed  @param {number} v.sel
   * @param {{x:number,y:number}[]} [v.spots]  centres of the places where the picked piece fits
   * @param {number} [v.chosenSpot]  place being looked at  @param {object|null} [v.chosen]  its pose
   */
  render({ place, tm, tr, fixed, sel, spots = [], chosenSpot = -1, chosen = null }){
    this.spotsEl.innerHTML = spotsMarkup(spots, chosenSpot, .1);
    this.chosenEl.innerHTML = chosen && sel >= 0
      ? `<g class="hx-piece hx-hue-${PIECES[sel].hue} is-chosen">${pieceParts(sel, chosen)}</g>` : '';
    this.piecesEl.innerHTML = place.map((pose, p) => {
      if (!pose) return '';
      const cls = (fixed.includes(p) ? ' is-fixed' : '') + (p === sel ? ' is-selected' : '');
      return `<g class="hx-piece hx-hue-${PIECES[p].hue}${cls}" data-piece="${p}">${pieceParts(p, pose, { halo: p === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = place.map((pose, p) => {
      if (pose) return '';
      const { w, h, svg } = looseSvg(p, tm[p], tr[p]);
      return `<div class="hx-tray-piece${p === sel ? ' is-selected' : ''}" data-piece="${p}" ` +
        `style="--w:${w.toFixed(3)};--h:${h.toFixed(3)}">${svg}</div>`;
    }).join('');
    if (this.flipBtn) this.flipBtn.disabled = sel < 0 || fixed.includes(sel);
  }

  /** Preview of a piece on the board while it is dragged (`ok` = it fits there). */
  preview(piece, pose, ok){
    this.previewEl.innerHTML = piece < 0 ? '' :
      `<g class="hx-piece hx-hue-${PIECES[piece].hue} is-preview${ok ? '' : ' is-bad'}">${pieceParts(piece, pose)}</g>`;
  }

  /** Loose copy that follows the finger off the board (piece < 0 to remove it). */
  ghostAt(piece, m, r, x, y){
    if (piece < 0){ this.ghost?.remove(); this.ghost = null; return; }
    const key = `${piece}:${m}:${r}`;
    if (!this.ghost || this.ghost.dataset.key !== key){
      this.ghost?.remove();
      const { w, h, svg } = looseSvg(piece, m, r), unit = this.unit() * GHOST_SCALE;
      this.ghost = document.createElement('div');
      this.ghost.className = 'hx-ghost';
      this.ghost.dataset.key = key;
      Object.assign(this.ghost.style, { width: w * unit + 'px', height: h * unit + 'px' });
      this.ghost.innerHTML = svg;
      this.screen.appendChild(this.ghost);
    }
    this.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }

  lift(piece, on){ this.screen.querySelectorAll(`[data-piece="${piece}"]`).forEach(el => el.classList.toggle('is-lifted', on)); }

  /** Pixels per board unit. */
  unit(){ const vb = this.svg.viewBox.baseVal; return this.svg.getBoundingClientRect().width / vb.width; }

  /** Screen position on the board: { x, y, inside, doubled }. */
  boardAt(clientX, clientY){
    const b = this.svg.getBoundingClientRect(), vb = this.svg.viewBox.baseVal;
    const x = vb.x + (clientX - b.left) / b.width * vb.width, y = vb.y + (clientY - b.top) / b.height * vb.height;
    return { x, y, inside: Math.hypot(x, y) < FRAME * 1.05, doubled: toDoubled(x, y) };
  }

  flash(piece){
    const el = this.screen.querySelector(`[data-piece="${piece}"]`);
    if (el){ el.classList.remove('is-flash'); el.getBoundingClientRect(); el.classList.add('is-flash'); }
  }
  celebrate(){ this.root.classList.add('is-won'); }
}
