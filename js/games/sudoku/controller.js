/* Partida de Sudoku: seleccionar casilla y luego número, con modo lápiz para notas
   (core/digit-grid-controller.js). */
import { DigitGridController } from '../../core/digit-grid-controller.js';
import { SudokuBoard } from './board-view.js';
import { SIZE, PEERS } from './engine/grid.js';
import { conflicts, findHint } from './rules.js';

export class SudokuController extends DigitGridController {
  constructor(deps){ super(deps, new SudokuBoard(deps.screen.querySelector('.board'))); }

  get n(){ return SIZE; }
  givensOf(p){ return p.givens; }
  conflicts(values){ return conflicts(values); }
  peersOf(i){ return PEERS[i]; }
  /** La siguiente casilla que se deduce con singles (o una vacía cualquiera). */
  hintFor(values, solution){
    const h = findHint(values, solution);
    return h && h.type === 'place' ? { cell: h.cell, digit: h.digit } : null;
  }
  mountBoard(){ this.board.build(); }
}
