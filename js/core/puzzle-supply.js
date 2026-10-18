/* Keeps each level's board reserve full by generating in the background, and serves the level
   the player is waiting for first. */
import { WorkerRunner, MainThreadRunner } from './runners.js';

export class PuzzleSupply {
  /**
   * @param {object} deps
   * @param {import('./store.js').Store} deps.store
   * @param {{ levels: object, levelOrder: string[], workerUrl: URL|string, generate: Function }} deps.game
   * @param {() => boolean} deps.isBusy   true while playing (the main thread must not generate)
   * @param {() => void} deps.onChange    the reserve or the work in progress changed
   * @param {(L: string) => void} deps.onReady  there is now a board for the requested level
   */
  constructor({ store, game, isBusy, onChange, onReady }){
    Object.assign(this, { store, game, isBusy, onChange, onReady });
    this.runner = null;   // null while checking whether there is a worker
    this.job = null;      // level being generated
    this.waiting = null;  // level the player is waiting for
  }

  init(){
    WorkerRunner.probe(this.game.workerUrl, () => this.#fallBack())
      .then(r => this.#use(r), () => this.#fallBack());
  }

  /** The player wants a board of L and there is none: give it priority. */
  request(L){ this.waiting = L; this.pump(); }
  cancelRequest(){ this.waiting = null; this.onChange(); }

  /** Decides what to generate now. Called after any relevant change. */
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

  /** Should the main thread give way to the game? */
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

  /** Every generated board is stored in the level it belongs to. */
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
