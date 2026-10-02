/* Partida del Solitario: elegir una bola y saltar (tocando el destino o arrastrando). */
import { GameController } from '../../core/game-controller.js';
import { plural } from '../../lib/format.js';
import { PegBoardView } from './board-view.js';
import { BOARDS, CENTER, isBoard, startBalls, movesFrom, jumpOver, anyMove, countBalls } from './engine/rules.js';

const DRAG_THRESHOLD = 6;

export class PegSolitaireController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new PegBoardView(deps.screen);
    this.#bindPointer(this.view.root);
  }

  #boardFromSettings(){ return isBoard(this.settings.board) ? this.settings.board : 'english'; }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const board = this.#boardFromSettings();
    return { L, p: puzzle, board, balls: startBalls(board), out: [], sel: -1, time: 0, done: false, hints: 0 };
  }
  mount(){
    if (!super.mount()) return false;
    this.hud.setHeader(BOARDS[this.session.board].name, '');
    return true;
  }
  mountBoard(){ this.view.build(this.session.board); }
  renderBoard(){
    const s = this.session, n = countBalls(s.balls);
    const targets = s.sel >= 0 ? movesFrom(s.board, s.balls, s.sel).map(m => m.to) : [];
    let status = plural(n, 'bola');
    if (n === 1) status = s.balls[CENTER] >= 0 ? '¡Una bola, en el centro!' : '¡Una sola bola!';
    else if (!anyMove(s.board, s.balls)) status = `Sin saltos · ${status}`;
    this.view.render({ balls: s.balls, out: s.out, sel: s.sel, targets, status });
  }
  snapshot(){ return { balls: this.session.balls.slice(), out: this.session.out.slice() }; }
  restore(snap){ Object.assign(this.session, { balls: snap.balls.slice(), out: snap.out.slice(), sel: -1 }); }
  hasInput(){ return this.session.out.length > 0; }
  clearInput(){ Object.assign(this.session, { balls: startBalls(this.session.board), out: [], sel: -1 }); }
  isSolved(){ return countBalls(this.session.balls) === 1; }
  get resetMessage(){ return 'Bolas de vuelta al tablero. Puedes deshacerlo.'; }
  celebrate(){ this.session.sel = -1; this.renderBoard(); this.view.celebrate(); }

  /** Cambiar de tablero: al momento si aún no se ha jugado; si no, en la próxima partida. */
  onSetting(key){
    const s = this.session;
    if (key !== 'board' || !s || s.board === this.#boardFromSettings()) return;
    if (s.done || this.hasInput()){ this.notify('El tablero nuevo se usará en la próxima partida'); return; }
    this.store.state.cur = this.createSession(s.L, s.p);
    this.history.clear();
    this.store.save();
    this.mount();
  }

  /* ---------- Jugadas ---------- */

  select(i){
    const s = this.session;
    if (!this.active) return;
    this.autoSel = false;
    s.sel = s.balls[i] >= 0 ? i : -1;
    this.render();
  }

  /** Salta de `from` a `to` si es válido. Devuelve si se movió. */
  jump(from, to){
    const s = this.session;
    if (!this.active) return false;
    const m = jumpOver(s.board, s.balls, from, to);
    if (!m) return false;
    this.record();
    s.out.push(s.balls[m.over]);
    s.balls[to] = s.balls[from];
    s.balls[from] = s.balls[m.over] = -1;
    // la bola sigue elegida si puede seguir saltando (saltos encadenados)
    s.sel = movesFrom(s.board, s.balls, to).length ? to : -1;
    this.autoSel = s.sel >= 0;   // elegida por el juego: tocarla no la suelta, sigue saltando
    this.commit(true);
    if (!s.done && !anyMove(s.board, s.balls)) this.notify(`No quedan saltos: ${plural(countBalls(s.balls), 'bola')}. Puedes deshacer.`);
    return true;
  }

  /**
   * Tocar una bola la elige (otra vez, la suelta); tocar un destino salta. Arrastrar una bola
   * la lleva con el dedo y, al soltarla sobre un destino, salta.
   */
  #bindPointer(el){
    let drag = null;
    el.addEventListener('pointerdown', e => {
      if (drag || !this.active) return;
      const s = this.session, i = this.view.holeAt(e.clientX, e.clientY);
      if (i < 0){ if (s.sel >= 0) this.select(-1); return; }
      e.preventDefault();
      if (s.balls[i] < 0){
        if (s.sel < 0 || !this.jump(s.sel, i)) this.select(-1);
        return;
      }
      try { el.setPointerCapture(e.pointerId); } catch (_){}
      drag = { id: e.pointerId, from: i, ball: this.view.ballEl(s.balls[i]), x: e.clientX, y: e.clientY, moved: false, was: s.sel === i && !this.autoSel };
      this.select(i);
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.moved = true;
      drag.ball.classList.add('is-dragging');
      drag.ball.style.translate = `${dx}px ${dy}px`;
    });
    const end = (e, cancelled) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      try { el.releasePointerCapture(d.id); } catch (_){}
      d.ball.classList.remove('is-dragging');
      d.ball.style.translate = '';
      if (cancelled) return;
      if (d.moved){
        const to = this.view.holeAt(e.clientX, e.clientY);
        if (to < 0 || !this.jump(d.from, to)) this.render();
      } else if (d.was) this.select(-1);
    };
    el.addEventListener('pointerup', e => end(e, false));
    el.addEventListener('pointercancel', e => end(e, true));
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
}
