/* Free or Pro. Free: every game on its first level (Easy) plus the daily challenge; Pro: every level.
   For now the purchase is simulated and saved on the device; the stores' purchase will go here. */

const KEY = 'puzzlesgo.pro';

export class Membership {
  /** @param {Storage|null} storage */
  constructor(storage){
    this.storage = storage;
    let pro = false;
    try { pro = storage?.getItem(KEY) === '1'; } catch (e){}
    this.pro = pro;
  }

  /** Does level `L` of the game need Pro? (Games with a single level, e.g. Peg Solitaire, are free.) */
  locks(meta, L){ return !this.pro && meta.levelOrder.length > 1 && L !== meta.levelOrder[0]; }

  set(pro){
    this.pro = pro;
    try { this.storage?.setItem(KEY, pro ? '1' : '0'); } catch (e){}
  }
}
