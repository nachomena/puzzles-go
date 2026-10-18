/* Bridges view: an SVG in cell units with the islands (circles with their number) and the bridges
   (one or two lines between centres). */
const at = s => [s.x + .5, s.y + .5];

export class BridgesBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-br-board]');
    this.svg = this.root.querySelector('svg');
  }

  build(p, edges){
    this.p = p; this.edges = edges;
    this.svg.setAttribute('viewBox', `0 0 ${p.w} ${p.h}`);
    let dots = '';
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) dots += `<circle cx="${x + .5}" cy="${y + .5}" r=".04"/>`;
    // touch area of each span (invisible, under the islands)
    const hits = edges.map((e, k) => {
      const [x1, y1] = at(p.islands[e.a]), [x2, y2] = at(p.islands[e.b]);
      return `<line data-edge="${k}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join('');
    const isles = p.islands.map((s, i) => `<g class="br-island" data-island="${i}" transform="translate(${s.x + .5} ${s.y + .5})"><circle r=".4"/><text dy=".35em">${s.n}</text></g>`).join('');
    this.svg.innerHTML = `<g class="br-dots">${dots}</g><g class="br-hits">${hits}</g><g class="br-bridges"></g><g class="br-preview"></g><g class="br-islands">${isles}</g>`;
    this.bridgesEl = this.svg.querySelector('.br-bridges');
    this.previewEl = this.svg.querySelector('.br-preview');
    this.islandEls = [...this.svg.querySelectorAll('[data-island]')];
    this.root.classList.remove('is-won');
  }

  /** @param {{ val: number[], counts: number[], showErrors: boolean }} v */
  render({ val, counts, showErrors }){
    const p = this.p;
    this.bridgesEl.innerHTML = this.edges.map((e, k) => {
      if (!val[k]) return '';
      const [x1, y1] = at(p.islands[e.a]), [x2, y2] = at(p.islands[e.b]), h = e.dir === 'h';
      const offs = val[k] === 2 ? [-.11, .11] : [0];
      return offs.map(o => `<line data-bridge="${k}" x1="${x1 + (h ? 0 : o)}" y1="${y1 + (h ? o : 0)}" x2="${x2 + (h ? 0 : o)}" y2="${y2 + (h ? o : 0)}"/>`).join('');
    }).join('');
    this.islandEls.forEach((el, i) => {
      const n = p.islands[i].n;
      el.classList.toggle('is-done', counts[i] === n);
      el.classList.toggle('is-over', showErrors && counts[i] > n);
    });
  }

  /**
   * Preview while dragging from an island. Over a span: how it will end up (`count` bridges,
   * 0 = removed; `bad` = it would cross another). Without a span: a line to the finger (`point`).
   */
  preview(v){
    if (!v){ this.previewEl.innerHTML = ''; this.islandEls.forEach(el => el.classList.remove('is-target')); return; }
    const p = this.p, [x1, y1] = at(p.islands[v.from]);
    let html = '';
    this.islandEls.forEach((el, i) => el.classList.toggle('is-target', v.edge >= 0 && i === v.to));
    if (v.edge >= 0){
      const e = this.edges[v.edge], [x2, y2] = at(p.islands[v.to]), h = e.dir === 'h';
      const cls = v.bad ? 'is-bad' : v.count === 0 ? 'is-remove' : '';
      const offs = v.count === 2 ? [-.11, .11] : [0];
      html = offs.map(o => `<line class="${cls}" x1="${x1 + (h ? 0 : o)}" y1="${y1 + (h ? o : 0)}" x2="${x2 + (h ? 0 : o)}" y2="${y2 + (h ? o : 0)}"/>`).join('');
    } else if (v.point){
      html = `<line class="is-free" x1="${x1}" y1="${y1}" x2="${v.point.x}" y2="${v.point.y}"/>`;
    }
    this.previewEl.innerHTML = html;
  }

  flashEdge(k){
    for (const el of this.bridgesEl.querySelectorAll(`[data-bridge="${k}"]`)){ el.classList.remove('is-flash'); el.getBoundingClientRect(); el.classList.add('is-flash'); }
  }
  celebrate(){ this.root.classList.add('is-won'); }

  /** Screen coordinates → cell with decimals. */
  toCell(clientX, clientY){
    const b = this.svg.getBoundingClientRect();
    return { x: (clientX - b.left) / b.width * this.p.w, y: (clientY - b.top) / b.height * this.p.h };
  }
}
