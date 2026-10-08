/* Vista de Rush Hour: aparcamiento de 6 × 6 con la salida a la derecha de la fila del coche rojo y
   los vehículos como bloques que se deslizan (posición en % del tablero). */
import { N, EXIT_ROW } from './engine/board.js';
import { restartAnimation } from '../../lib/dom.js';

/** Colores de los demás vehículos (nada parecido al rojo, para no confundirlo). */
const HUES = ['yellow', 'blue', 'green', 'purple', 'aqua', 'pink', 'lime', 'navy', 'sky', 'gray', 'sand', 'teal', 'orange'];
const pct = v => (v / N * 100) + '%';

export class RushHourBoardView {
  constructor(screen){
    this.root = screen.querySelector('[data-rh-board]');
    this.lot = this.root.querySelector('.rh-lot');
    this.movesEl = screen.querySelector('[data-rh-moves]');
    this.els = [];
  }

  /** Coloca los vehículos del reto (el 0 es el rojo). */
  build(cars){
    this.cars = cars;
    let cells = '';
    for (let i = 0; i < N * N; i++) cells += '<i></i>';
    this.lot.innerHTML = `<div class="rh-cells">${cells}</div>` +
      `<div class="rh-exit" style="top:${pct(EXIT_ROW)}" aria-hidden="true"></div>` +
      cars.map((car, i) => {
        const w = car.dir === 'h' ? car.len : 1, h = car.dir === 'h' ? 1 : car.len;
        return `<div class="rh-car${i === 0 ? ' is-red' : ''} rh-hue-${i === 0 ? 'red' : HUES[(i - 1) % HUES.length]}${car.dir === 'v' ? ' is-v' : ''}" data-car="${i}" ` +
          `style="width:${pct(w)};height:${pct(h)}"><span></span></div>`;
      }).join('');
    this.els = [...this.lot.querySelectorAll('[data-car]')];
    this.root.classList.remove('is-won');
  }

  /** Mueve el vehículo i a la posición p (con decimales mientras se arrastra). */
  place(i, p){
    const car = this.cars[i], el = this.els[i];
    el.style.left = pct(car.dir === 'h' ? p : car.line);
    el.style.top = pct(car.dir === 'h' ? car.line : p);
  }

  /** @param {{ pos: number[], moves: number, min: number, dragging?: number }} v */
  render({ pos, moves, min, dragging = -1 }){
    pos.forEach((p, i) => { if (i !== dragging) this.place(i, p); });
    this.els.forEach((el, i) => el.classList.toggle('is-dragging', i === dragging));
    this.movesEl.textContent = `${moves} ${moves === 1 ? 'movimiento' : 'movimientos'} · mínimo ${min}`;
  }

  flash(i){ const el = this.els[i]; if (el) restartAnimation(el, 'is-flash'); }
  celebrate(){ this.root.classList.add('is-won'); }

  /** Casillas por píxel (para convertir el arrastre en posiciones). */
  cellSize(){ return this.lot.getBoundingClientRect().width / N; }
}
