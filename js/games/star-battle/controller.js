/* Partida de Star Battle: marcas, pincel, X automáticas y pistas. */
import { GameController } from '../../core/game-controller.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { StarBattleBoard } from './board-view.js';
import { MARK, TOOL } from './config.js';
import { analyze, applyAutoX, effectiveMark, nextMark, hasPlayerInput, findHint } from './rules.js';

const HINT_MESSAGES = {
  'wrong-star': 'Esta estrella no va aquí',
  'missing-star': 'Aquí sí va una estrella'
};

export class StarBattleController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new StarBattleBoard(deps.screen.querySelector('.board'));
    this.stroke = null;  // trazo en curso: { value, before }
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
    return { L, p: puzzle, marks: new Array(cells).fill(MARK.EMPTY), hl: new Array(cells).fill(0), time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.board.build(this.session.p, { tint: this.settings.tint }); }
  renderBoard(){
    const s = this.session, { bad } = analyze(s.marks, s.p);
    this.board.render(s.marks, s.hl, this.settings.errors ? bad : null);
  }
  snapshot(){ return { m: this.session.marks.slice(), h: this.session.hl.slice() }; }
  restore(snap){ this.session.marks = snap.m; this.session.hl = snap.h; }
  sameAs(snap){
    const s = this.session;
    return snap.m.every((v, i) => effectiveMark(v) === effectiveMark(s.marks[i]) && snap.h[i] === s.hl[i]);
  }
  hasInput(){ return hasPlayerInput(this.session.marks, this.session.hl); }
  clearInput(){
    const s = this.session;
    s.marks = s.marks.map(() => MARK.EMPTY);
    s.hl = s.hl.map(() => 0);
  }
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

  hint(){
    const s = this.session;
    if (!this.active) return;
    const hint = findHint(s.marks, s.p.solution);
    if (!hint) return;
    this.countHint();
    if (hint.type === 'place-star'){
      this.record();
      s.marks[hint.cell] = MARK.STAR;
      this.commit(true);
    } else {
      this.notify(HINT_MESSAGES[hint.type]);
      this.store.save();
    }
    this.board.flash(hint.cell);
  }

  /* ---------- Trazos (tocar y arrastrar) ---------- */

  /** Empieza un trazo en la casilla i: su valor decide qué hace el resto del arrastre. */
  pressCell(i){
    const s = this.session, before = this.snapshot();
    let value;
    if (this.tool === TOOL.STAR){
      const next = nextMark(s.marks[i]);
      s.marks[i] = next;
      value = next === MARK.EMPTY ? 0 : 1;   // arrastrar pone X o las quita
    } else {
      value = s.hl[i] ? 0 : 1;
      s.hl[i] = value;
    }
    this.stroke = { value, before };
    this.commit(false);
  }

  dragOver(cells){
    if (!this.stroke) return;
    const { marks, hl } = this.session, { value } = this.stroke;
    let changed = false;
    for (const i of cells){
      if (this.tool === TOOL.BRUSH){
        if (hl[i] !== value){ hl[i] = value; changed = true; }
      } else if (value === 1 && effectiveMark(marks[i]) === MARK.EMPTY){
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
    if (!this.sameAs(before)) this.history.record(before);
    this.commit(true);
  }
}
