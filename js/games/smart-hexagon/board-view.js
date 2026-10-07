/* Vista de Smart Hexagon: tablero hexagonal con sus 19 clavijas, piezas colocadas, vista previa
   al arrastrar y bandeja. Todo el tablero es un único SVG (distancia entre clavijas = 1). */
import { PIECES, POSTS } from './engine/pieces.js';
import { postXY, toDoubled, pieceParts, looseSvg } from './piece-svg.js';

/** Radio del marco hexagonal (hasta sus esquinas). */
const FRAME = 3.3;
/** Tamaño de la copia que sigue al dedo, respecto al tablero. */
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
    this.root = screen.querySelector('[data-sh-board]');
    this.svg = this.root.querySelector('svg');
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
    this.ghost = null;
  }

  build(){
    const posts = POSTS.map(p => { const [x, y] = postXY(p); return `<path d="${hexPath(x, y, .2)}"/>`; }).join('');
    this.svg.innerHTML =
      `<path class="sh-frame" d="${hexPath(0, 0, FRAME)}"/>` +
      `<path class="sh-floor" d="${hexPath(0, 0, FRAME - .16)}"/>` +
      `<g class="sh-posts">${posts}</g><g class="sh-pieces"></g><g class="sh-chosen"></g><g class="sh-spots"></g><g class="sh-preview"></g>`;
    this.piecesEl = this.svg.querySelector('.sh-pieces');
    this.previewEl = this.svg.querySelector('.sh-preview');
    this.chosenEl = this.svg.querySelector('.sh-chosen');
    this.spotsEl = this.svg.querySelector('.sh-spots');
    this.root.classList.remove('is-won');
  }

  /**
   * @param {object} v
   * @param {(null|{m,r,tu,tv})[]} v.place  @param {number[]} v.tm @param {number[]} v.tr  cara y giro en la bandeja
   * @param {number[]} v.fixed  @param {number} v.sel
   * @param {{x:number,y:number}[]} [v.spots]  centros de los sitios donde cabe la pieza elegida
   * @param {object|null} [v.chosen]  sitio elegido (postura), que se ve en vista previa
   */
  render({ place, tm, tr, fixed, sel, spots = [], chosen = null }){
    this.spotsEl.innerHTML = spots.map(({ x, y, on }, i) =>
      `<circle class="sh-spot${on ? ' is-on' : ''}" data-spot="${i}" cx="${x.toFixed(4)}" cy="${y.toFixed(4)}" r="${on ? .15 : .1}"/>`).join('');
    this.chosenEl.innerHTML = chosen && sel >= 0
      ? `<g class="sh-piece sh-hue-${PIECES[sel].hue} is-chosen">${pieceParts(sel, chosen)}</g>` : '';
    this.piecesEl.innerHTML = place.map((pose, p) => {
      if (!pose) return '';
      const cls = (fixed.includes(p) ? ' is-fixed' : '') + (p === sel ? ' is-selected' : '');
      return `<g class="sh-piece sh-hue-${PIECES[p].hue}${cls}" data-piece="${p}">${pieceParts(p, pose, { halo: p === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = place.map((pose, p) => {
      if (pose) return '';
      const { w, h, svg } = looseSvg(p, tm[p], tr[p]);
      return `<div class="sh-tray-piece${p === sel ? ' is-selected' : ''}" data-piece="${p}" ` +
        `style="--w:${w.toFixed(3)};--h:${h.toFixed(3)}">${svg}</div>`;
    }).join('');
    if (this.flipBtn) this.flipBtn.disabled = sel < 0 || fixed.includes(sel);
  }

  /** Vista previa de una pieza en el tablero mientras se arrastra (`ok` = cabe ahí). */
  preview(piece, pose, ok){
    this.previewEl.innerHTML = piece < 0 ? '' :
      `<g class="sh-piece sh-hue-${PIECES[piece].hue} is-preview${ok ? '' : ' is-bad'}">${pieceParts(piece, pose)}</g>`;
  }

  /** Copia suelta que sigue al dedo fuera del tablero (piece < 0 para quitarla). */
  ghostAt(piece, m, r, x, y){
    if (piece < 0){ this.ghost?.remove(); this.ghost = null; return; }
    const key = `${piece}:${m}:${r}`;
    if (!this.ghost || this.ghost.dataset.key !== key){
      this.ghost?.remove();
      const { w, h, svg } = looseSvg(piece, m, r), unit = this.unit() * GHOST_SCALE;
      this.ghost = document.createElement('div');
      this.ghost.className = 'sh-ghost';
      this.ghost.dataset.key = key;
      Object.assign(this.ghost.style, { width: w * unit + 'px', height: h * unit + 'px' });
      this.ghost.innerHTML = svg;
      this.screen.appendChild(this.ghost);
    }
    this.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }

  lift(piece, on){ this.screen.querySelectorAll(`[data-piece="${piece}"]`).forEach(el => el.classList.toggle('is-lifted', on)); }

  /** Píxeles por unidad de tablero. */
  unit(){ const vb = this.svg.viewBox.baseVal; return this.svg.getBoundingClientRect().width / vb.width; }

  /** Posición de la pantalla en el tablero: { x, y, inside, doubled }. */
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
