/* Vista de Smart Dices: tablero de 6×6 con los 4 dados, piezas colocadas, flechas y bandeja. */
import { GridBoard } from '../../ui/grid-board.js';
import { SIZE, CELLS, PIECES, shape, dieOf } from './engine/pieces.js';

const REGIONS = Array.from({ length: CELLS }, (_, i) => dieOf(i));
/** Grosor del marco en unidades de casilla (coincide con .board--dice .board__frame en el CSS). */
const FRAME = .08;
const pct = (n, of = SIZE) => (n / of * 100) + '%';

/* Cada pieza deja un margen --gap dentro de sus casillas; los puntos se sitúan respecto a la
   cuadrícula (no a la pieza encogida) para que caigan justo en el centro de su casilla. */
const inset = (n, of = SIZE) => `calc(${pct(n, of)} + var(--gap))`;
const span = (n, of = SIZE) => `calc(${pct(n, of)} - 2 * var(--gap))`;
const dotPos = (k, size) => `calc((100% + 2 * var(--gap)) * ${(k + .5) / size} - var(--gap))`;

/** Marcado de una pieza (rectángulo con sus puntos) en un giro. `style` posiciona la pieza. */
function pieceHtml(piece, rot, { style = '', cls = '' } = {}){
  const s = shape(PIECES[piece], rot);
  const dots = s.dots.map(([r, c]) => `<i style="left:${dotPos(c, s.w)};top:${dotPos(r, s.h)}"></i>`).join('');
  return `<div class="sd-piece ${cls}" data-piece="${piece}" style="--w:${s.w};--h:${s.h};${style}">${dots}</div>`;
}

export class DicesBoardView {
  constructor(screen){
    this.grid = new GridBoard(screen.querySelector('.board'));
    this.board = this.grid.root;
    this.piecesEl = document.createElement('div');
    this.piecesEl.className = 'sd-pieces';
    this.board.appendChild(this.piecesEl);
    this.diceEl = document.createElement('div');
    this.diceEl.className = 'sd-dice';
    this.diceEl.innerHTML = '<i></i><i></i><i></i><i></i>';
    this.board.insertBefore(this.diceEl, this.piecesEl);
    this.tray = screen.querySelector('[data-tray]');
    this.arrows = Object.fromEntries([...screen.querySelectorAll('[data-arrow]')].map(el => [el.dataset.arrow, el]));
  }

  build({ arrows }){
    this.grid.build(SIZE, REGIONS);
    // Sin flechas en las filas no hace falta su columna: el tablero se centra
    this.board.closest('.sd-area').classList.toggle('is-no-rows', arrows.rows.every(s => s == null));
    // El marco va por fuera de la cuadrícula para que las casillas del borde no se vean más pequeñas
    const frame = this.board.querySelector('.board__frame'), out = FRAME / 2;
    frame.setAttribute('x', -out); frame.setAttribute('y', -out);
    frame.setAttribute('width', SIZE + 2 * out); frame.setAttribute('height', SIZE + 2 * out);
    // GridBoard sustituye su contenido de casillas; las capas propias siguen encima
    for (const [kind, list] of Object.entries(arrows)) list.forEach((sum, i) => {
      const el = this.arrows[`${kind}-${i}`];
      el.querySelector('.sd-arrow__num').textContent = sum ?? '';
      el.setAttribute('aria-label', sum == null ? '' : `Suma ${sum}`);
      el.classList.toggle('is-empty', sum == null);
    });
  }

  /**
   * @param {object} v
   * @param {(null|{rot,r,c})[]} v.place
   * @param {number[]} v.trot   giro de cada pieza en la bandeja
   * @param {number[]} v.fixed
   * @param {{ dice: {full,value}[], arrows: {rows: string[], cols: string[]} }|null} v.status  null = no resaltar
   */
  render({ place, trot, fixed, status }){
    this.piecesEl.innerHTML = place.map((pos, piece) => {
      if (!pos) return '';
      const s = shape(PIECES[piece], pos.rot);
      return pieceHtml(piece, pos.rot, {
        cls: fixed.includes(piece) ? 'is-fixed' : '',
        style: `left:${inset(pos.c)};top:${inset(pos.r)};width:${span(s.w)};height:${span(s.h)}`
      });
    }).join('');
    this.tray.innerHTML = place.map((pos, piece) => pos ? '' : pieceHtml(piece, trot[piece], { cls: 'is-tray' })).join('');
    [...this.diceEl.children].forEach((el, d) => el.classList.toggle('is-bad', !!status && status.dice[d].full && !status.dice[d].value));
    for (const kind of ['rows', 'cols']) for (const i of [0, 1]){
      const st = status?.arrows[kind][i] || '';
      this.arrows[`${kind}-${i}`].classList.toggle('is-bad', st === 'bad');
      this.arrows[`${kind}-${i}`].classList.toggle('is-ok', st === 'ok');
    }
  }

  pieceEl(piece){ return this.board.querySelector(`[data-piece="${piece}"]`) || this.tray.querySelector(`[data-piece="${piece}"]`); }
  flash(piece){ const el = this.pieceEl(piece); if (el){ el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); } }
  celebrate(){ this.grid.celebrate(); }

  /** Casilla (fila, columna) de la esquina superior izquierda para una pieza soltada en `rect`. */
  cellFor(rect){
    const b = this.board.getBoundingClientRect(), cell = b.width / SIZE;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) return null;
    return { r: Math.round((rect.top - b.top) / cell), c: Math.round((rect.left - b.left) / cell) };
  }
  cellSize(){ return this.board.getBoundingClientRect().width / SIZE; }
}

export { pieceHtml };
