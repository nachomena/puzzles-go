/* Star Battle game: marks, trial stars, automatic X marks and hints. */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { StarBattleBoard } from './board-view.js';
import { MARK, TOOL } from './config.js';
import { analyze, applyAutoX, effectiveMark, isStar, nextMark, hasPlayerInput, findHint, findMistake } from './rules.js';

const HINT_MESSAGES = {
  'wrong-star': t('games.star-battle.wrongStar'),
  'missing-star': t('games.star-battle.missingStar')
};

export class StarBattleController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new StarBattleBoard(deps.screen.querySelector('.board'));
    this.stroke = null;  // stroke in progress: { value, before } (value null: not dragging)
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.pressCell(i),
      onEnter: cells => this.dragOver(cells),
      onEnd: () => this.release()
    });
  }

  /* ---------- Template steps ---------- */

  createSession(L, puzzle){
    const cells = puzzle.N * puzzle.N;
    return { L, p: puzzle, marks: new Array(cells).fill(MARK.EMPTY), trials: {}, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.board.build(this.session.p, { tint: this.settings.tint }); }
  /** With every star placed, the ones that break a rule turn red even with errors off: it isn't solved. */
  renderBoard(){
    const s = this.session, { bad } = analyze(s.marks, s.p);
    this.board.render(s.marks, this.settings.errors || this.#allPlaced() ? bad : null);
  }
  snapshot(){ return { m: this.session.marks.slice(), t: { ...this.session.trials } }; }
  restore(snap){ this.session.marks = snap.m.slice(); this.session.trials = { ...snap.t }; }
  sameAs(snap){ return snap.m.every((v, i) => effectiveMark(v) === effectiveMark(this.session.marks[i])); }
  hasInput(){ return hasPlayerInput(this.session.marks); }
  clearInput(){ this.session.marks = this.session.marks.map(() => MARK.EMPTY); this.session.trials = {}; }
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

  /* ---------- Strokes (tap and drag) ---------- */

  /** Starts a stroke on cell i: its value decides what the rest of the drag does. */
  pressCell(i){
    const s = this.session, before = this.snapshot();
    let value = null;
    if (s.marks[i] === MARK.TRY){
      // a trial star, with either tool: back to the board from before placing it, so it and everything
      // done after it go away (undo brings them back); dragging does nothing
      this.#rewindTrial(i);
    } else if (this.tool === TOOL.TRY){
      // placing a trial star (also on a star) remembers the board right before it
      s.trials ??= {};
      s.trials[i] = s.marks.slice();
      s.marks[i] = MARK.TRY;
    } else {
      const next = nextMark(s.marks[i]);
      s.marks[i] = next;
      value = next === MARK.EMPTY ? 0 : 1;   // dragging places X marks or removes them
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
    // every tap is a step: undoing a star goes back to the X
    const changed = !this.sameAs(before);
    if (changed) this.history.record(before);
    this.commit(true);
    if (changed && this.active && this.#allPlaced()) this.notify(this.#brokenRules());
  }

  /** What the red stars break, in words: one sentence per rule. */
  #brokenRules(){
    const { broken } = analyze(this.session.marks, this.session.p), k = this.session.p.K;
    return ['region', 'row', 'col', 'touch'].filter(r => broken[r])
      .map(r => t(`games.star-battle.broken.${r}`, { k })).join(' ');
  }

  /** Takes the board back to how it was before trial star `i` was placed (or just removes it). */
  #rewindTrial(i){
    const s = this.session, saved = s.trials?.[i];
    if (saved) s.marks = saved.slice();
    else s.marks[i] = MARK.EMPTY;
    // only the trial stars still on the board keep their saved board
    for (const k of Object.keys(s.trials ?? {})) if (s.marks[k] !== MARK.TRY) delete s.trials[k];
  }

  /** Are all the stars placed (trial ones too)? Then it is either solved or some star breaks a rule. */
  #allPlaced(){
    const { N, K } = this.session.p;
    return this.session.marks.filter(isStar).length === N * K;
  }
}
