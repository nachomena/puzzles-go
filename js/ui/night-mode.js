/* Night mode: warm colours across the app (css/tokens.css, :root.is-night). It is an app setting, not a
   game's: it is saved separately and changed from its row in the app settings (picker) and in each game's. */
const KEY = 'puzzlesgo.night';
const THEME = { day: '#232228', night: '#1c1612' };   // status bar colour

export class NightMode {
  /** @param {Storage|null} storage */
  constructor(storage){
    this.storage = storage;
    let on = false;
    try { on = storage?.getItem(KEY) === '1'; } catch (e){}
    this.apply(on);
  }

  get on(){ return document.documentElement.classList.contains('is-night'); }

  set(on){
    this.apply(on);
    try { this.storage?.setItem(KEY, on ? '1' : '0'); } catch (e){}
  }

  /** Draws the state: class on the root, status bar colour and the switches that show it. */
  apply(on){
    document.documentElement.classList.toggle('is-night', on);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', on ? THEME.night : THEME.day);
    document.querySelectorAll('[data-night-toggle]').forEach(i => { i.checked = on; });
  }
}
