/* Vista de Smart Circle: tablero redondo de 3 anillos, nervios (que se pueden girar en los niveles
   difíciles), marcas de nervios del reto, piezas colocadas, vista previa al arrastrar y bandeja.
   Todo el tablero es un único SVG en unidades de tablero (radio 1). */
import { PIECES, RINGS, SECTORS, RIB_PATTERN } from './engine/pieces.js';
import { RING_R, HOLE_R, xy, pieceParts, looseSvg } from './piece-svg.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEG = 360 / SECTORS;
/** Tamaño de la copia que sigue al dedo, respecto al tablero. */
const GHOST_SCALE = .65;

/** Sector (con decimales) en el que cae cada bola con una postura. */
const sectorFor = pose => (ring, d) => pose.m * d + pose.s;

export class CircleBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-sl-board]');
    this.svg = this.root.querySelector('svg');
    this.tray = screen.querySelector('[data-tray]');
    this.flipBtn = screen.querySelector('[data-action="flip"]');
    this.ribsBtn = screen.querySelector('[data-action="turn-ribs"]');
    this.ghost = null;
  }

  /** Dibuja el tablero vacío y las marcas de nervios del reto. */
  build(p){
    let holes = '';
    for (let r = 0; r < RINGS; r++) for (let s = 0; s < SECTORS; s++){
      const [x, y] = xy(r, s);
      holes += `<circle cx="${x.toFixed(4)}" cy="${y.toFixed(4)}" r="${HOLE_R[r]}"/>`;
    }
    const rib = k => `<line x1=".655" y1="0" x2=".955" y2="0" transform="rotate(${(k + .5) * DEG})"/>`;
    // en los niveles difíciles solo se marcan algunos nervios, en el borde
    const marks = p.ribsFixed ? '' : p.marks.map(k => `<line x1=".965" y1="0" x2="1.02" y2="0" transform="rotate(${(k + .5) * DEG})"/>`).join('');
    this.svg.innerHTML =
      `<defs><radialGradient id="sl-shine-g"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>` +
      `<circle class="sl-disc" r="1"/><g class="sl-holes">${holes}</g>` +
      `<g class="sl-marks">${marks}</g>` +
      `<g class="sl-ribs">${RIB_PATTERN.map(rib).join('')}</g>` +
      `<g class="sl-pieces"></g><g class="sl-preview"></g>`;
    this.ribsEl = this.svg.querySelector('.sl-ribs');
    this.piecesEl = this.svg.querySelector('.sl-pieces');
    this.previewEl = this.svg.querySelector('.sl-preview');
    this.root.classList.remove('is-won');
    if (this.ribsBtn) this.ribsBtn.hidden = p.ribsFixed;
  }

  /**
   * @param {object} v
   * @param {(null|{m,s})[]} v.place  @param {number[]} v.tm  cara de cada pieza en la bandeja
   * @param {number[]} v.fixed  @param {number} v.sel  @param {number} v.ro  orientación de los nervios
   */
  render({ place, tm, fixed, sel, ro }){
    this.ribsEl.style.transform = `rotate(${ro * DEG}deg)`;
    this.piecesEl.innerHTML = place.map((pose, p) => {
      if (!pose) return '';
      const cls = (fixed.includes(p) ? ' is-fixed' : '') + (p === sel ? ' is-selected' : '');
      return `<g class="sl-piece sl-hue-${PIECES[p].hue}${cls}" data-piece="${p}">${pieceParts(p, sectorFor(pose), { halo: p === sel })}</g>`;
    }).join('');
    this.tray.innerHTML = place.map((pose, p) => {
      if (pose) return '';
      const { w, h, svg } = looseSvg(p, tm[p]);
      return `<div class="sl-tray-piece${p === sel ? ' is-selected' : ''}" data-piece="${p}" ` +
        `style="--w:${w.toFixed(3)};--h:${h.toFixed(3)}">${svg}</div>`;
    }).join('');
    if (this.flipBtn) this.flipBtn.disabled = sel < 0 || fixed.includes(sel);
  }

  /** Vista previa de una pieza en el tablero mientras se arrastra (`ok` = cabe ahí). */
  preview(piece, pose, ok){
    this.previewEl.innerHTML = piece < 0 ? '' :
      `<g class="sl-piece sl-hue-${PIECES[piece].hue} is-preview${ok ? '' : ' is-bad'}">${pieceParts(piece, sectorFor(pose))}</g>`;
  }

  /** Copia suelta que sigue al dedo fuera del tablero (null para quitarla). */
  ghostAt(piece, m, x, y){
    if (piece < 0){ this.ghost?.remove(); this.ghost = null; return; }
    if (!this.ghost || this.ghost.dataset.key !== `${piece}:${m}`){
      this.ghost?.remove();
      const { w, h, svg } = looseSvg(piece, m);
      const unit = this.unit() * GHOST_SCALE;
      this.ghost = document.createElement('div');
      this.ghost.className = 'sl-ghost';
      this.ghost.dataset.key = `${piece}:${m}`;
      Object.assign(this.ghost.style, { width: w * unit + 'px', height: h * unit + 'px' });
      this.ghost.innerHTML = svg;
      this.root.closest('.screen').appendChild(this.ghost);
    }
    this.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }

  /** Marca la pieza que se está arrastrando (se atenúa en su sitio). */
  lift(piece, on){ this.root.closest('.screen').querySelectorAll(`[data-piece="${piece}"]`).forEach(el => el.classList.toggle('is-lifted', on)); }

  /** Píxeles por unidad de tablero. */
  unit(){ return this.svg.getBoundingClientRect().width / 2; }

  /** Posición de la pantalla en el tablero: { r, sector (con decimales), ring más cercano }. */
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

