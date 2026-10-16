/* Vista de Engranajes: un SVG con los huecos hexagonales, los números, los puntos y los engranajes. Lo
   unido a la manivela va en latón (o en rojo si se atasca); lo suelto, en gris. */
import { center, viewBox, hexPath, gear, clueText } from './art.js';

const TURN_MS = 2400;

export class GearsBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-gr-board]');
    this.svg = this.root.querySelector('svg');
  }

  build(p){
    const { w, h } = p, n = w * h;
    this.p = p;
    this.svg.setAttribute('viewBox', viewBox(w, h));
    let socks = '';
    for (let i = 0; i < n; i++){
      const [x, y] = center(w, i), fixed = i === p.crank || i === p.lock || p.fixed.includes(i) || p.clues[i] !== undefined;
      socks += `<path class="gr-sock${fixed ? ' is-fixed' : ''}" data-i="${i}" d="${hexPath(x, y)}"/>`;
    }
    this.svg.innerHTML = `<g class="gr-socks">${socks}</g><g class="gr-items"></g><g class="gr-flash"></g>`;
    this.items = this.svg.querySelector('.gr-items');
    this.flashEl = this.svg.querySelector('.gr-flash');
    clearTimeout(this.turnTimer);
    this.root.classList.remove('is-won', 'is-turning', 'is-stuck');
  }

  /** @param {{ marks: number[], gears: number[], on: Set<number>, spin: Int8Array, jam: boolean, counts: object, showErrors: boolean }} v */
  render({ marks, gears, on, spin, jam, counts, showErrors }){
    const p = this.p, { w, h } = p;
    let s = '';
    for (let i = 0; i < w * h; i++){
      const [x, y] = center(w, i), c = p.clues[i];
      if (c !== undefined){
        const got = counts[i];
        s += clueText(x, y, c, c > 0 && got === c ? ' is-done' : showErrors && got > c ? ' is-bad' : '');
        continue;
      }
      if (marks[i] === 2 && !gears[i]){ s += `<circle class="gr-dot" cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r=".12"/>`; continue; }
      if (!gears[i]) continue;
      const kind = i === p.crank ? 'crank' : i === p.lock ? 'lock' : p.fixed.includes(i) ? 'fixed' : 'player';
      const isOn = on.has(i), cls = isOn ? `on ${spin[i] ? 'ccw' : 'cw'}${jam && showErrors ? ' jam' : ''}` : '';
      s += gear(x, y, kind, kind === 'crank' ? 0 : p.spin[i], cls);
    }
    this.items.innerHTML = s;
    this.jam = jam;
  }

  /** Gira la manivela: se mueve lo que está unido a ella (o tiembla, si se atasca). */
  turn(){
    const cls = this.jam ? 'is-stuck' : 'is-turning';
    this.root.classList.remove('is-turning', 'is-stuck');
    void this.root.getBoundingClientRect();   // para que la animación vuelva a empezar
    this.root.classList.add(cls);
    clearTimeout(this.turnTimer);
    this.turnTimer = setTimeout(() => this.root.classList.remove(cls), TURN_MS);
  }

  flash(i){
    const [x, y] = center(this.p.w, i);
    this.flashEl.innerHTML = `<path d="${hexPath(x, y, .9)}"/>`;
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => { this.flashEl.innerHTML = ''; }, 1600);
  }

  celebrate(){ clearTimeout(this.turnTimer); this.root.classList.remove('is-turning', 'is-stuck'); this.root.classList.add('is-won'); }

  /** Hueco bajo un evento de puntero, o −1. */
  socketAt(e){ const el = e.target.closest?.('[data-i]'); return el ? Number(el.dataset.i) : -1; }
}
