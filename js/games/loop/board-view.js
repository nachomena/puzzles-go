/* Loop view: an SVG in cell units with the dots, the cell numbers and, on each side, a line or a small
   cross. */
import { geometry } from './engine/grid.js';

const PAD = .35;   // margin around the outer dots (to tap the border sides)

export class SlitherBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-lp-board]');
    this.svg = this.root.querySelector('svg');
  }

  build(p){
    const n = p.n, g = geometry(n);
    this.p = p; this.g = g;
    this.svg.setAttribute('viewBox', `${-PAD} ${-PAD} ${n + 2 * PAD} ${n + 2 * PAD}`);
    let nums = '';
    p.clues.forEach((c, i) => { if (c >= 0) nums += `<text data-cell="${i}" x="${i % n + .5}" y="${((i / n) | 0) + .5}" dy=".35em">${c}</text>`; });
    let dots = '';
    for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) dots += `<circle data-v="${r * (n + 1) + c}" cx="${c}" cy="${r}" r=".075"/>`;
    this.svg.innerHTML = `<g class="lp-nums">${nums}</g><g class="lp-crosses"></g><g class="lp-lines"></g><g class="lp-dots">${dots}</g>`;
    this.numEls = new Map([...this.svg.querySelectorAll('[data-cell]')].map(el => [Number(el.dataset.cell), el]));
    this.dotEls = [...this.svg.querySelectorAll('[data-v]')];
    this.linesEl = this.svg.querySelector('.lp-lines');
    this.crossesEl = this.svg.querySelector('.lp-crosses');
    this.root.classList.remove('is-won');
  }

  /** Ends of side e in cell coordinates. */
  ends(e){
    const n = this.p.n, [a, b] = this.g.edgeVerts[e], xy = v => [v % (n + 1), (v / (n + 1)) | 0];
    return [...xy(a), ...xy(b)];
  }

  /** @param {{ e: number[], counts: number[], crowded: boolean[], showErrors: boolean }} v */
  render({ e, counts, crowded, showErrors }){
    let lines = '', crosses = '';
    e.forEach((v, k) => {
      if (!v) return;
      const [x1, y1, x2, y2] = this.ends(k);
      if (v === 1) lines += `<line data-edge="${k}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      else {
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, d = .09;
        crosses += `<path d="M${cx - d} ${cy - d}L${cx + d} ${cy + d}M${cx + d} ${cy - d}L${cx - d} ${cy + d}"/>`;
      }
    });
    this.linesEl.innerHTML = lines;
    this.crossesEl.innerHTML = crosses;
    for (const [i, el] of this.numEls){
      const c = this.p.clues[i];
      el.classList.toggle('is-done', c > 0 && counts[i] === c);   // a 0 stays the same: there is nothing to meet
      el.classList.toggle('is-bad', showErrors && counts[i] > c);
    }
    this.dotEls.forEach((el, v) => el.classList.toggle('is-bad', showErrors && crowded[v]));
  }

  flashEdge(k){
    const [x1, y1, x2, y2] = this.ends(k);
    this.linesEl.insertAdjacentHTML('beforeend', `<line class="is-flash" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
  }
  celebrate(){ this.root.classList.add('is-won'); }

  /** Screen point → cell coordinates (0 to n). */
  toCell(clientX, clientY){
    const b = this.svg.getBoundingClientRect(), s = this.p.n + 2 * PAD;
    return { x: (clientX - b.left) / b.width * s - PAD, y: (clientY - b.top) / b.height * s - PAD };
  }
}
