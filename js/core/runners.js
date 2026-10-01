/* Estrategias para ejecutar el generador. Ambas cumplen la misma interfaz:
     run(target, onPuzzle)  empieza a generar; llama a onPuzzle(p) por cada tablero
                            y para sola al conseguir uno del nivel `target`.
     stop()                 descarta el trabajo en curso.
     resume()               continúa si estaba en pausa.
     background             true si no bloquea la interfaz. */
import { TIMING } from '../config.js';

/** Genera en un Web Worker (módulo ES). */
export class WorkerRunner {
  background = true;

  constructor(url, onFailure){
    this.url = url;
    this.onFailure = onFailure;
    this.token = 0;
    this.onPuzzle = null;
    this.worker = this.#spawn();
  }

  /** Crea un runner y comprueba que el worker responde. Rechaza si falla o tarda. */
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
    // El worker está ocupado en un bucle síncrono: la única forma de pararlo es reemplazarlo.
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
 * Genera en el hilo principal en porciones cortas; se pausa cuando `shouldYield()` lo pide.
 * `generate(target)` es la función generadora del juego (la misma que usa su worker).
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
