/* Tablero de Sudoku: pistas fijas, números del jugador, notas y resaltados. */
import { GridBoard } from '../../ui/grid-board.js';
import { SIZE, CELLS, boxOf, rowOf, colOf } from './engine/grid.js';

const REGIONS = Array.from({ length: CELLS }, (_, i) => boxOf(i));
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const notesHtml = mask =>
  `<span class="sd-notes">${DIGITS.map(d => `<i>${mask & (1 << (d - 1)) ? d : ''}</i>`).join('')}</span>`;

/** ¿Comparten fila, columna o caja? */
const sees = (a, b) => rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);

export class SudokuBoard extends GridBoard {
  build(){ super.build(SIZE, REGIONS); }

  /**
   * @param {object} v
   * @param {number[]} v.values   0 = vacía
   * @param {number[]} v.notes    máscara de notas por casilla
   * @param {number[]} v.givens   pistas fijas
   * @param {number} v.sel        casilla seleccionada (-1 = ninguna)
   * @param {Uint8Array|null} v.bad
   * @param {number} v.same       dígito a resaltar (0 = ninguno)
   */
  render({ values, notes, givens, sel, bad, same }){
    for (let i = 0; i < CELLS; i++){
      const d = values[i], given = !!givens[i];
      const flags =
        (given ? ' is-given' : d ? ' is-entry' : '') +
        (bad && bad[i] ? ' is-bad' : '') +
        (i === sel ? ' is-selected' : sel >= 0 && sees(i, sel) ? ' is-peer' : '') +
        (same && d === same ? ' is-same' : '');
      const html = d ? `<span class="sd-digit">${d}</span>` : notes[i] ? notesHtml(notes[i]) : '';
      this.paint(i, `${d}|${notes[i]}|${flags}`, 'cell' + flags, html);
    }
  }
}
