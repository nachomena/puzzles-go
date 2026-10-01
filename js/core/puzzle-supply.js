/* Mantiene llena la reserva de tableros de cada nivel generando en segundo plano,
   y atiende con prioridad al nivel que el jugador está esperando. */
import { WorkerRunner, MainThreadRunner } from './runners.js';

export class PuzzleSupply {
  /**
   * @param {object} deps
   * @param {import('./store.js').Store} deps.store
   * @param {{ levels: object, levelOrder: string[], workerUrl: URL|string, generate: Function }} deps.game
   * @param {() => boolean} deps.isBusy   true mientras se juega (el hilo principal no debe generar)
   * @param {() => void} deps.onChange    la reserva o el trabajo en curso han cambiado
   * @param {(L: string) => void} deps.onReady  ya hay tablero para el nivel solicitado
   */
  constructor({ store, game, isBusy, onChange, onReady }){
    Object.assign(this, { store, game, isBusy, onChange, onReady });
    this.runner = null;   // null mientras se comprueba si hay worker
    this.job = null;      // nivel que se está generando
    this.waiting = null;  // nivel que el jugador espera
  }

  init(){
    WorkerRunner.probe(this.game.workerUrl, () => this.#fallBack())
      .then(r => this.#use(r), () => this.#fallBack());
  }

  /** El jugador quiere un tablero de L y no hay: se prioriza. */
  request(L){ this.waiting = L; this.pump(); }
  cancelRequest(){ this.waiting = null; this.onChange(); }

  /** Decide qué generar ahora. Se llama tras cualquier cambio relevante. */
  pump(){
    if (!this.runner) return;
    if (this.job){
      if (!this.waiting || this.job === this.waiting){ this.runner.resume(); this.onChange(); return; }
      this.#stopJob();
    }
    const L = this.#nextLevel();
    if (!L){ this.onChange(); return; }
    if (!this.runner.background && !this.waiting && this.isBusy()) return;
    this.job = L;
    this.runner.run(this.game.levels[L].target, p => this.#receive(p));
    this.onChange();
  }

  /** ¿Debe el hilo principal ceder el paso al juego? */
  shouldYield(){ return !this.waiting && this.isBusy(); }

  #use(runner){
    this.runner?.dispose();
    this.runner = runner;
    this.job = null;
    this.pump();
  }
  #fallBack(){
    if (this.runner instanceof MainThreadRunner) return;
    this.#use(new MainThreadRunner(this.game.generate, () => this.shouldYield()));
  }
  #stopJob(){ this.runner.stop(); this.job = null; }

  #nextLevel(){
    if (this.waiting) return this.waiting;
    return this.game.levelOrder.find(L => this.store.hasRoom(L)) || null;
  }

  #receive(p){
    const job = this.job;
    this.#file(p);
    if (job && this.game.levels[job].target === p.level){ this.job = null; this.pump(); }
  }

  /** Cualquier tablero generado se guarda en el nivel que le corresponde. */
  #file(p){
    const L = this.game.levelOrder.find(k => this.game.levels[k].target === p.level);
    if (!L) return;
    if (this.waiting === L){
      this.waiting = null;
      this.store.addPuzzle(L, p, { front: true });
      this.onReady(L);
      return;
    }
    if (this.store.hasRoom(L)){
      this.store.addPuzzle(L, p);
      this.store.save();
      this.onChange();
    }
  }
}
