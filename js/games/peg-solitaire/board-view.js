/* Peg Solitaire view: a round board with the holes in a cross and, around it, the groove where the
   removed balls are left (as on wooden boards).
   Coordinates in hole units with the centre at (0, 0); the board is 2·R across. */
import { N, holes } from './engine/rules.js';

const R = 4.5;          // board radius
const GROOVE = 4.0;     // radius of the groove for the removed balls
const BALL = .7;        // diameter of a ball
const pct = v => ((v + R) / (2 * R) * 100) + '%';
const holeXY = i => [i % N - 3, ((i / N) | 0) - 3];

export class PegBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-ps-board]');
    this.wood = this.root.querySelector('.ps-wood');
    this.layer = this.root.querySelector('.ps-balls');
    this.board = null;
    this.balls = [];     // element of each ball, by id
    this.targets = [];   // marks on the holes that can be jumped to
  }

  /** Draws the wood and the board's holes, and creates one ball per hole. */
  build(board){
    this.board = board;
    this.holes = holes(board);
    this.slots = this.holes.length - 1;   // the groove fits every ball that can be removed
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

  /** Centre (in units) of slot `k` of the groove: they start at the top and go clockwise. */
  slotXY(k){
    const a = -Math.PI / 2 + k * 2 * Math.PI / this.slots;
    return [GROOVE * Math.cos(a), GROOVE * Math.sin(a)];
  }

  /**
   * @param {object} v
   * @param {number[]} v.balls  ball id per cell (-1 = empty)
   * @param {number[]} v.out    ids of the removed balls, in order
   * @param {number} v.sel      picked cell (-1 = none)
   * @param {number[]} v.targets  cells the picked one can jump to
   */
  render({ balls, out, sel, targets }){
    const place = (el, [x, y]) => { el.style.left = pct(x); el.style.top = pct(y); };
    // there is one element per hole, but one ball fewer (the one of the hole that starts empty)
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
    // target marks
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
  }

  /** Hole under some screen coordinates (or -1). */
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
