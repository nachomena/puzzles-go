/* Dice view: 6×6 board with the 4 dice, placed pieces, arrows and tray. */
import { GridBoard } from '../../ui/grid-board.js';
import { t } from '../../i18n/index.js';
import { SIZE, CELLS, PIECES, shape, dieOf } from './engine/pieces.js';

const REGIONS = Array.from({ length: CELLS }, (_, i) => dieOf(i));
const pct = (n, of = SIZE) => (n / of * 100) + '%';

/* Each piece leaves a --gap margin inside its cells; the dots are placed relative to the grid (not to
   the shrunk piece) so they land right in the centre of their cell. */
const inset = (n, of = SIZE) => `calc(${pct(n, of)} + var(--gap))`;
const span = (n, of = SIZE) => `calc(${pct(n, of)} - 2 * var(--gap))`;
const dotPos = (k, size) => `calc((100% + 2 * var(--gap)) * ${(k + .5) / size} - var(--gap))`;

/** Markup of a piece (rectangle with its dots) in a rotation. `style` positions the piece. */
function pieceHtml(piece, rot, { style = '', cls = '' } = {}){
  const s = shape(PIECES[piece], rot);
  const dots = s.dots.map(([r, c]) => `<i style="left:${dotPos(c, s.w)};top:${dotPos(r, s.h)}"></i>`).join('');
  return `<div class="dc-piece ${cls}" data-piece="${piece}" style="--w:${s.w};--h:${s.h};${style}">${dots}</div>`;
}

export class DicesBoardView {
  constructor(screen){
    this.screen = screen;
    this.grid = new GridBoard(screen.querySelector('.board'));
    this.board = this.grid.root;
    this.piecesEl = document.createElement('div');
    this.piecesEl.className = 'dc-pieces';
    this.board.appendChild(this.piecesEl);
    this.diceEl = document.createElement('div');
    this.diceEl.className = 'dc-dice';
    this.diceEl.innerHTML = '<i></i><i></i><i></i><i></i>';
    this.board.insertBefore(this.diceEl, this.piecesEl);
    this.tray = screen.querySelector('[data-tray]');
    this.arrows = Object.fromEntries([...screen.querySelectorAll('[data-arrow]')].map(el => [el.dataset.arrow, el]));
  }

  build({ arrows }){
    this.grid.build(SIZE, REGIONS);
    // Without row arrows their column isn't needed: the board is centred
    const noRows = arrows.rows.every(s => s == null);
    this.board.closest('.dc-area').classList.toggle('is-no-rows', noRows);
    this.screen.classList.toggle('dc-no-rows', noRows);   // the header lines up with the board
    // GridBoard replaces its cell content; the custom layers stay on top
    for (const [kind, list] of Object.entries(arrows)) list.forEach((sum, i) => {
      const el = this.arrows[`${kind}-${i}`];
      el.querySelector('.dc-arrow__num').textContent = sum ?? '';
      el.setAttribute('aria-label', sum == null ? '' : t('games.dice.sum', { n: sum }));
      el.classList.toggle('is-empty', sum == null);
    });
  }

  /**
   * @param {object} v
   * @param {(null|{rot,r,c})[]} v.place
   * @param {number[]} v.trot   rotation of each piece in the tray
   * @param {number[]} v.fixed
   * @param {{ dice: {full,value}[], arrows: {rows: string[], cols: string[]} }|null} v.status  null = don't highlight
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

  /** Top-left cell (row, column) for a piece dropped at `rect`. */
  cellFor(rect){
    const b = this.board.getBoundingClientRect(), cell = b.width / SIZE;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) return null;
    return { r: Math.round((rect.top - b.top) / cell), c: Math.round((rect.left - b.left) / cell) };
  }
  cellSize(){ return this.board.getBoundingClientRect().width / SIZE; }
}

export { pieceHtml };
