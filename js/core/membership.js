/* Free or Pro. Free: every game on its first level (Easy) plus the daily challenge; Pro: every level.
   Pro is only sold inside the apps (the stores' purchase will go here), so on the web nobody has it: it is a demo.
   For tests there is a developer mode (`puzzlesgo.dev`, switched from the app settings) with a simulated purchase
   that is saved on the device. */

const KEY = 'puzzlesgo.pro';
const DEV = 'puzzlesgo.dev';

export class Membership {
  /** @param {Storage|null} storage */
  constructor(storage){
    this.storage = storage;
    let dev = false, pro = false;
    try { dev = storage?.getItem(DEV) === '1'; pro = storage?.getItem(KEY) === '1'; } catch (e){}
    this.dev = dev;
    this.stored = pro;
  }

  /** Can Pro be bought here? Only in developer mode, with the simulated purchase, until the stores' one exists. */
  get canBuy(){ return this.dev; }

  /** Is Pro active? */
  get pro(){ return this.dev && this.stored; }

  /** Does level `L` of the game need Pro? (Games with a single level, e.g. Peg Solitaire, are free.) */
  locks(meta, L){ return !this.pro && meta.levelOrder.length > 1 && L !== meta.levelOrder[0]; }

  /** The (simulated) purchase, or taking it away. It does nothing where Pro can't be bought. */
  set(pro){
    if (!this.canBuy) return;
    this.stored = pro;
    try { this.storage?.setItem(KEY, pro ? '1' : '0'); } catch (e){}
  }

  /** Switches the developer mode on or off. */
  setDev(on){
    this.dev = on;
    try { this.storage?.setItem(DEV, on ? '1' : '0'); } catch (e){}
  }
}
