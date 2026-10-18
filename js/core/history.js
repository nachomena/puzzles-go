/** Generic undo/redo stack over snapshots. */
export class History {
  constructor(limit = Infinity){
    this.limit = limit;
    this.clear();
  }
  clear(){ this.past = []; this.future = []; this.stamp = 0; }
  get canUndo(){ return this.past.length > 0; }
  get canRedo(){ return this.future.length > 0; }

  /** Saves the state before a new change (clears redo). */
  record(snapshot){
    this.stamp++;   // changes with every step (record, undo, redo): see GameController#recordTap
    this.past.push(snapshot);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }
  /** Returns the state to go back to, or null. `current` goes to the other stack. */
  undo(current){ return this.#move(this.past, this.future, current); }
  redo(current){ return this.#move(this.future, this.past, current); }

  #move(from, to, current){
    if (!from.length) return null;
    this.stamp++;
    to.push(current);
    return from.pop();
  }
}
