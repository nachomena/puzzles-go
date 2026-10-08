/* Vista de Hashi: un SVG en unidades de casilla con las islas (círculos con su número) y los puentes
   (una o dos rayas entre centros). */
const at = s => [s.x + .5, s.y + .5];

export class HashiBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-hs-board]');
    this.svg = this.root.querySelector('svg');
  }

  build(p, edges){
    this.p = p; this.edges = edges;
    this.svg.setAttribute('viewBox', `0 0 ${p.w} ${p.h}`);
    let dots = '';
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) dots += `<circle cx="${x + .5}" cy="${y + .5}" r=".04"/>`;
    // zona de toque de cada tramo (invisible, debajo de las islas)
    const hits = edges.map((e, k) => {
      const [x1, y1] = at(p.islands[e.a]), [x2, y2] = at(p.islands[e.b]);
      return `<line data-edge="${k}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join('');
    const isles = p.islands.map((s, i) => `<g class="hs-island" data-island="${i}" transform="translate(${s.x + .5} ${s.y + .5})"><circle r=".4"/><text dy=".35em">${s.n}</text></g>`).join('');
    this.svg.innerHTML = `<g class="hs-dots">${dots}</g><g class="hs-hits">${hits}</g><g class="hs-bridges"></g><g class="hs-preview"></g><g class="hs-islands">${isles}</g>`;
    this.bridgesEl = this.svg.querySelector('.hs-bridges');
    this.previewEl = this.svg.querySelector('.hs-preview');
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
   * Vista previa mientras se arrastra desde una isla. Sobre un tramo: cómo quedará (`count` puentes,
   * 0 = se quitan; `bad` = se cruzaría con otro). Sin tramo: una raya hasta el dedo (`point`).
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

  /** Coordenadas de pantalla → casilla con decimales. */
  toCell(clientX, clientY){
    const b = this.svg.getBoundingClientRect();
    return { x: (clientX - b.left) / b.width * this.p.w, y: (clientY - b.top) / b.height * this.p.h };
  }
}
