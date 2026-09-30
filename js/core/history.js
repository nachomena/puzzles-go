/** Pila de deshacer/rehacer genérica sobre instantáneas. */
export class History {
  constructor(limit = Infinity){
    this.limit = limit;
    this.clear();
  }
  clear(){ this.past = []; this.future = []; }
  get canUndo(){ return this.past.length > 0; }
  get canRedo(){ return this.future.length > 0; }

  /** Guarda el estado anterior a un cambio nuevo (invalida el rehacer). */
  record(snapshot){
    this.past.push(snapshot);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }
  /** Devuelve el estado al que volver, o null. `current` pasa a la otra pila. */
  undo(current){ return this.#move(this.past, this.future, current); }
  redo(current){ return this.#move(this.future, this.past, current); }

  #move(from, to, current){
    if (!from.length) return null;
    to.push(current);
    return from.pop();
  }
}
