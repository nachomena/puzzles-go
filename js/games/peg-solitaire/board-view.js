/* Vista del Solitario: tablero redondo con los agujeros en cruz y, alrededor, la ranura donde se
   dejan las bolas que se van retirando (como en los tableros de madera).
   Coordenadas en unidades de agujero con el centro en (0, 0); el tablero mide 2·R de lado. */
import { N, holes } from './engine/rules.js';

const R = 4.5;          // radio del tablero
const GROOVE = 4.0;     // radio de la ranura de las bolas retiradas
const BALL = .7;        // diámetro de una bola
const pct = v => ((v + R) / (2 * R) * 100) + '%';
const holeXY = i => [i % N - 3, ((i / N) | 0) - 3];

export class PegBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-ps-board]');
    this.wood = this.root.querySelector('.ps-wood');
    this.layer = this.root.querySelector('.ps-balls');
    this.status = screen.querySelector('[data-ps-status]');
    this.board = null;
    this.balls = [];     // elemento de cada bola, por id
    this.targets = [];   // marcas de los agujeros a los que se puede saltar
  }

  /** Dibuja la madera y los agujeros del tablero, y crea una bola por agujero. */
  build(board){
    this.board = board;
    this.holes = holes(board);
    this.slots = this.holes.length - 1;   // en la ranura caben todas las que se pueden retirar
    let grain = '';
    for (let r = .6; r < R; r += .55) grain += `<circle r="${r.toFixed(2)}" class="ps-grain"/>`;
    this.wood.innerHTML =
      `<defs>` +
      `<radialGradient id="ps-wood-g" cx="42%" cy="35%" r="70%"><stop offset="0" stop-color="#34333b"/><stop offset=".65" stop-color="#28272e"/><stop offset="1" stop-color="#1e1d23"/></radialGradient>` +
      `<radialGradient id="ps-hole-g" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="#0c0c0f"/><stop offset=".7" stop-color="#141318"/><stop offset="1" stop-color="#232228"/></radialGradient>` +
      `</defs>` +
      `<circle r="${R - .04}" class="ps-disc"/>${grain}` +
      `<circle r="${GROOVE}" class="ps-groove"/>` +
      `<circle r="${GROOVE + .41}" class="ps-groove-rim"/><circle r="${GROOVE - .41}" class="ps-groove-edge"/>` +
      this.holes.map(i => { const [x, y] = holeXY(i); return `<circle cx="${x}" cy="${y}" r=".33" class="ps-hole"/>`; }).join('');
    this.layer.replaceChildren();
    this.balls = this.holes.map(() => {
      const el = document.createElement('div');
      el.className = 'ps-ball';
      el.style.width = el.style.height = (BALL / (2 * R) * 100) + '%';
      this.layer.appendChild(el);
      return el;
    });
    this.targets = [];
    this.root.classList.remove('is-won');
  }

  /** Centro (en unidades) del hueco `k` de la ranura: empiezan arriba y siguen en sentido horario. */
  slotXY(k){
    const a = -Math.PI / 2 + k * 2 * Math.PI / this.slots;
    return [GROOVE * Math.cos(a), GROOVE * Math.sin(a)];
  }

  /**
   * @param {object} v
   * @param {number[]} v.balls  id de bola por casilla (-1 = vacía)
   * @param {number[]} v.out    ids de las bolas retiradas, en orden
   * @param {number} v.sel      casilla elegida (-1 = ninguna)
   * @param {number[]} v.targets  casillas a las que puede saltar la elegida
   * @param {string} v.status
   */
  render({ balls, out, sel, targets, status }){
    const place = (el, [x, y]) => { el.style.left = pct(x); el.style.top = pct(y); };
    // hay un elemento por agujero, pero una bola menos (la del agujero que empieza vacío)
    const shown = new Set(out);
    balls.forEach(id => { if (id >= 0) shown.add(id); });
    this.balls.forEach((el, id) => { el.hidden = !shown.has(id); });
    balls.forEach((id, i) => {
      if (id < 0) return;
      const el = this.balls[id];
      place(el, holeXY(i));
      el.classList.remove('is-out');
      el.classList.toggle('is-selected', i === sel);
    });
    out.forEach((id, k) => {
      const el = this.balls[id];
      place(el, this.slotXY(k));
      el.classList.add('is-out');
      el.classList.remove('is-selected');
    });
    // marcas de destino
    while (this.targets.length < targets.length){
      const t = document.createElement('div');
      t.className = 'ps-target';
      t.style.width = t.style.height = (BALL / (2 * R) * 100) + '%';
      this.layer.prepend(t);
      this.targets.push(t);
    }
    this.targets.forEach((t, k) => {
      t.hidden = k >= targets.length;
      if (k < targets.length) place(t, holeXY(targets[k]));
    });
    this.status.textContent = status;
  }

  /** Agujero bajo unas coordenadas de pantalla (o -1). */
  holeAt(clientX, clientY){
    const r = this.root.getBoundingClientRect();
    const x = (clientX - r.left) / r.width * 2 * R - R, y = (clientY - r.top) / r.height * 2 * R - R;
    const c = Math.round(x) + 3, q = Math.round(y) + 3;
    if (Math.hypot(x - (c - 3), y - (q - 3)) > .55) return -1;
    const i = q * N + c;
    return c >= 0 && q >= 0 && c < N && q < N && this.holes.includes(i) ? i : -1;
  }

  ballEl(id){ return this.balls[id]; }
  celebrate(){ this.root.classList.add('is-won'); }
}
