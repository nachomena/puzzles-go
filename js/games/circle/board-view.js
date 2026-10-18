/* Circle view: a round board of 3 rings, ribs (which can be turned on the hard levels), the puzzle's
   rib marks, placed pieces, drag preview and tray.
   The whole board is a single SVG in board units (radius 1). */
import { PIECES, RINGS, SECTORS, RIB_PATTERN } from './engine/pieces.js';
import { RING_R, HOLE_R, xy, pieceParts, looseSvg } from './piece-svg.js';
import { spotsMarkup } from '../../ui/fit-spots.js';

const DEG = 360 / SECTORS;
/** Size of the copy that follows the finger, relative to the board. */
const GHOST_SCALE = .65;

/** Sector (with decimals) where each ball lands with a pose. */
const sectorFor = pose => (ring, d) => pose.m * d + pose.s;

export class CircleBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-ci-board]');
    this.svg = this.root.querySelector('svg');
    this.tray = screen.querySelector('[data-tray]');
    this.ribsBtn = screen.querySelector('[data-action="turn-ribs"]');
    this.ghost = null;
  }

  /** Draws the empty board and the puzzle's rib marks. */
  build(p){
    let holes = '';
    for (let r = 0; r < RINGS; r++) for (let s = 0; s < SECTORS; s++){
      const [x, y] = xy(r, s);
      holes += `<circle cx="${x.toFixed(4)}" cy="${y.toFixed(4)}" r="${HOLE_R[r]}"/>`;
    }
    const rib = k => `<line x1=".655" y1="0" x2=".955" y2="0" transform="rotate(${(k + .5) * DEG})"/>`;
    // on the hard levels only some ribs are marked, on the edge
    const marks = p.ribsFixed ? '' : p.marks.map(k => `<line x1=".965" y1="0" x2="1.02" y2="0" transform="rotate(${(k + .5) * DEG})"/>`).join('');
    this.svg.innerHTML =
      `<defs><radialGradient id="ci-shine-g"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>` +
      `<circle class="ci-disc" r="1"/><g class="ci-holes">${holes}</g>` +
      `<g class="ci-marks">${marks}</g>` +
      `<g class="ci-ribs">${RIB_PATTERN.map(rib).join('')}</g>` +
      `<g class="ci-pieces"></g><g class="ci-chosen"></g><g class="ci-spots"></g><g class="ci-preview"></g>`;
    this.ribsEl = this.svg.querySelector('.ci-ribs');
    this.piecesEl = this.svg.querySelector('.ci-pieces');
    this.previewEl = this.svg.querySelector('.ci-preview');
    this.chosenEl = this.svg.querySelector('.ci-chosen');
    this.spotsEl = this.svg.querySelector('.ci-spots');
    this.root.classList.remove('is-won');
    if (this.ribsBtn) this.ribsBtn.hidden = p.ribsFixed;
  }

  /**
   * @param {object} v
   * @param {(null|{m,s})[]} v.place  @param {number[]} v.tm  side of each piece in the tray
   * @param {number[]} v.fixed  @param {number} v.sel  @param {number} v.ro  orientation of the ribs
   * @param {{x:number,y:number}[]} [v.spots]  centres of the places where the picked piece fits
   * @param {number} [v.chosenSpot]  place being looked at  @param {object|null} [v.chosen]  its pose
   */
  render({ place, tm, fixed, sel, ro, spots = [], chosenSpot = -1, chosen = null }){
    this.spotsEl.innerHTML = spotsMarkup(spots, chosenSpot, .045);
    this.chosenEl.innerHTML = chosen && sel >= 0
      ? `<g class="ci-piece ci-hue-${PIECES[sel].hue} is-chosen">${pieceParts(sel, sectorFor(chosen))}</g>` : '';
    this.ribsEl.style.transform = `rotate(${ro * DEG}deg)`;
    this.piecesEl.innerHTML = place.map((pose, p) => {
      if (!pose) return '';
      const cls = (fixed.includes(p) ? ' is-fixed' : '') + (p === sel ? ' is-selected' : '');
      return `<g class="ci-piece ci-hue-${PIECES[p].hue}${cls}" data-piece="${p}">${pieceParts(p, sectorFor(pose), { halo: p === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = place.map((pose, p) => {
      if (pose) return '';
      const { w, h, svg } = looseSvg(p, tm[p]);
      return `<div class="ci-tray-piece${p === sel ? ' is-selected' : ''}" data-piece="${p}" ` +
        `style="--w:${w.toFixed(3)};--h:${h.toFixed(3)}">${svg}</div>`;
    }).join('');
  }

  /** Preview of a piece on the board while it is dragged (`ok` = it fits there). */
  preview(piece, pose, ok){
    this.previewEl.innerHTML = piece < 0 ? '' :
      `<g class="ci-piece ci-hue-${PIECES[piece].hue} is-preview${ok ? '' : ' is-bad'}">${pieceParts(piece, sectorFor(pose))}</g>`;
  }

  /** Loose copy that follows the finger off the board (null to remove it). */
  ghostAt(piece, m, x, y){
    if (piece < 0){ this.ghost?.remove(); this.ghost = null; return; }
    if (!this.ghost || this.ghost.dataset.key !== `${piece}:${m}`){
      this.ghost?.remove();
      const { w, h, svg } = looseSvg(piece, m);
      const unit = this.unit() * GHOST_SCALE;
      this.ghost = document.createElement('div');
      this.ghost.className = 'ci-ghost';
      this.ghost.dataset.key = `${piece}:${m}`;
      Object.assign(this.ghost.style, { width: w * unit + 'px', height: h * unit + 'px' });
      this.ghost.innerHTML = svg;
      this.root.closest('.screen').appendChild(this.ghost);
    }
    this.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }

  /** Marks the piece being dragged (it is dimmed in its place). */
  lift(piece, on){ this.root.closest('.screen').querySelectorAll(`[data-piece="${piece}"]`).forEach(el => el.classList.toggle('is-lifted', on)); }

  /** Pixels per board unit. */
  unit(){ return this.svg.getBoundingClientRect().width / 2; }

  /** Screen position on the board: { r, sector (with decimals), nearest ring }. */
  polarAt(clientX, clientY){
    const b = this.svg.getBoundingClientRect();
    const x = (clientX - b.left) / b.width * 2 - 1, y = (clientY - b.top) / b.height * 2 - 1;
    const r = Math.hypot(x, y);
    const sector = ((Math.atan2(y, x) / (2 * Math.PI) * SECTORS) % SECTORS + SECTORS) % SECTORS;
    const ring = RING_R.reduce((best, R, i) => Math.abs(r - R) < Math.abs(r - RING_R[best]) ? i : best, 0);
    return { r, sector, ring };
  }

  flash(piece){
    const el = this.root.closest('.screen').querySelector(`[data-piece="${piece}"]`);
    if (el){ el.classList.remove('is-flash'); el.getBoundingClientRect(); el.classList.add('is-flash'); }
  }
  celebrate(){ this.root.classList.add('is-won'); }
}

