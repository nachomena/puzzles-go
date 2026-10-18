/* Strategies to run the generator. Both share the same interface:
     run(target, onPuzzle)  starts generating; calls onPuzzle(p) for each board
                            and stops by itself on getting one of level `target`.
     stop()                 drops the work in progress.
     resume()               carries on if it was paused.
     background             true if it doesn't block the interface. */
import { TIMING } from '../config.js';

/** Generates in a Web Worker (ES module). */
export class WorkerRunner {
  background = true;

  constructor(url, onFailure){
    this.url = url;
    this.onFailure = onFailure;
    this.token = 0;
    this.onPuzzle = null;
    this.worker = this.#spawn();
  }

  /** Creates a runner and checks that the worker answers. Rejects if it fails or takes too long. */
  static probe(url, onFailure, timeoutMs = TIMING.workerProbeMs){
    return new Promise((resolve, reject) => {
      let runner;
      const fail = () => { runner?.dispose(); reject(new Error('worker unavailable')); };
      const timer = setTimeout(fail, timeoutMs);
      try {
        runner = new WorkerRunner(url, () => { clearTimeout(timer); fail(); });
        runner.onPong = () => { clearTimeout(timer); runner.onFailure = onFailure; resolve(runner); };
        runner.worker.postMessage({ ping: 1 });
      } catch (e){ clearTimeout(timer); fail(); }
    });
  }

  #spawn(){
    const w = new Worker(this.url, { type: 'module' });
    w.onmessage = ({ data }) => {
      if (data.pong){ this.onPong?.(); this.onPong = null; return; }
      if (data.token === this.token) this.onPuzzle?.(data.p);
    };
    w.onerror = e => { try { e.preventDefault(); } catch (_){} this.onFailure?.(); };
    return w;
  }

  run(target, onPuzzle){
    this.onPuzzle = onPuzzle;
    this.worker.postMessage({ target, token: ++this.token });
  }
  stop(){
    // The worker is busy in a synchronous loop: the only way to stop it is to replace it.
    this.token++;
    this.onPuzzle = null;
    this.worker.terminate();
    try { this.worker = this.#spawn(); }
    catch (e){ this.worker = null; this.onFailure?.(); }
  }
  resume(){}
  dispose(){
    this.onFailure = null;
    try { this.worker?.terminate(); } catch (e){}
  }
}

/**
 * Generates on the main thread in short slices; pauses when `shouldYield()` asks for it.
 * `generate(target)` is the game's generator function (the same one its worker uses).
 */
export class MainThreadRunner {
  background = false;

  constructor(generate, shouldYield){
    this.generate = generate;
    this.shouldYield = shouldYield;
    this.token = 0;
    this.paused = null;
  }

  run(target, onPuzzle){
    const tok = ++this.token;
    let gen = this.generate(target);
    const step = () => {
      if (tok !== this.token) return;
      if (this.shouldYield()){ this.paused = step; return; }
      const t = performance.now();
      while (performance.now() - t < TIMING.mainThreadSliceMs){
        const r = gen.next();
        if (!r.done) continue;
        if (r.value){
          onPuzzle(r.value);
          if (r.value.level === target || tok !== this.token) return;
        }
        gen = this.generate(target);
      }
      setTimeout(step, 0);
    };
    setTimeout(step, 0);
  }
  stop(){ this.token++; this.paused = null; }
  resume(){
    if (!this.paused) return;
    const step = this.paused;
    this.paused = null;
    setTimeout(step, 0);
  }
  dispose(){ this.stop(); }
}
