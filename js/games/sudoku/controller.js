/* Sudoku game: select a cell and then a number, with a pencil mode for notes
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
  /** The next cell deduced with singles (or any empty one). */
  hintFor(values, solution){
    const h = findHint(values, solution);
    return h && h.type === 'place' ? { cell: h.cell, digit: h.digit } : null;
  }
  mountBoard(){ this.board.build(); }
}
