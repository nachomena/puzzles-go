/* Partida de Star Battle: marcas, estrellas de prueba, X automáticas y pistas. */
import { GameController } from '../../core/game-controller.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { StarBattleBoard } from './board-view.js';
import { MARK, TOOL } from './config.js';
import { analyze, applyAutoX, effectiveMark, nextMark, hasPlayerInput, findHint, findMistake } from './rules.js';

const HINT_MESSAGES = {
  'wrong-star': 'Esta estrella no va aquí',
  'missing-star': 'Aquí sí va una estrella'
};

export class StarBattleController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new StarBattleBoard(deps.screen.querySelector('.board'));
    this.stroke = null;  // trazo en curso: { value, before } (value null: no se arrastra)
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.pressCell(i),
      onEnter: cells => this.dragOver(cells),
      onEnd: () => this.release()
    });
  }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const cells = puzzle.N * puzzle.N;
    return { L, p: puzzle, marks: new Array(cells).fill(MARK.EMPTY), time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.board.build(this.session.p, { tint: this.settings.tint }); }
  renderBoard(){
    const s = this.session, { bad } = analyze(s.marks, s.p);
    this.board.render(s.marks, this.settings.errors ? bad : null);
  }
  snapshot(){ return { m: this.session.marks.slice() }; }
  restore(snap){ this.session.marks = snap.m.slice(); }
  sameAs(snap){ return snap.m.every((v, i) => effectiveMark(v) === effectiveMark(this.session.marks[i])); }
  hasInput(){ return hasPlayerInput(this.session.marks); }
  clearInput(){ this.session.marks = this.session.marks.map(() => MARK.EMPTY); }
  isSolved(){ return analyze(this.session.marks, this.session.p).solved; }
  normalize(){ applyAutoX(this.session.marks, this.session.p.N, this.settings.autoX); }
  onSetting(key){
    if (key === 'tint') this.mountBoard();
    this.board.invalidate();
  }
  celebrate(){ this.board.celebrate(); }
  get actions(){
    return { tool: el => this.setTool(el.dataset.tool) };
  }

  findMistake(){
    const m = findMistake(this.session.marks, this.session.p.solution);
    return m && { ...m, message: HINT_MESSAGES[m.type] };
  }
  showMistake({ cell }){ this.board.flash(cell); }
  giveHint(){
    const s = this.session, hint = findHint(s.marks, s.p.solution);
    if (!hint) return false;
    this.record();
    s.marks[hint.cell] = MARK.STAR;
    this.commit(true);
    this.board.flash(hint.cell);
    return true;
  }

  /* ---------- Trazos (tocar y arrastrar) ---------- */

  /** Empieza un trazo en la casilla i: su valor decide qué hace el resto del arrastre. */
  pressCell(i){
    const s = this.session, before = this.snapshot();
    let value = null;
    if (this.tool === TOOL.TRY){
      // estrella de prueba: se pone o se quita (sobre una estrella, la vuelve de prueba); arrastrar no hace nada
      s.marks[i] = s.marks[i] === MARK.TRY ? MARK.EMPTY : MARK.TRY;
    } else {
      const next = nextMark(s.marks[i]);
      s.marks[i] = next;
      value = next === MARK.EMPTY ? 0 : 1;   // arrastrar pone X o las quita
    }
    this.stroke = { value, before };
    this.commit(false);
  }

  dragOver(cells){
    if (!this.stroke || this.stroke.value === null) return;
    const { marks } = this.session, { value } = this.stroke;
    let changed = false;
    for (const i of cells){
      if (value === 1 && effectiveMark(marks[i]) === MARK.EMPTY){
        marks[i] = MARK.X; changed = true;
      } else if (value === 0 && marks[i] === MARK.X){
        marks[i] = MARK.EMPTY; changed = true;
      }
    }
    if (changed) this.commit(false);
  }

  release(){
    if (!this.stroke) return;
    const { before } = this.stroke;
    this.stroke = null;
    // cada toque es un paso: deshacer una estrella vuelve a la X
    if (!this.sameAs(before)) this.history.record(before);
    this.commit(true);
  }
}
