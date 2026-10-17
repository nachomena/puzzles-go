/* Modo noche: colores cálidos en toda la app (css/tokens.css, :root.is-night). Es un ajuste de la app, no de
   un juego: se guarda aparte y lo cambian el botón de la luna del selector y la fila de la hoja de ajustes. */
const KEY = 'puzzlesgo.night';
const THEME = { day: '#232228', night: '#1c1612' };   // color de la barra de estado

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

  toggle(){ this.set(!this.on); }

  /** Pinta el estado: clase en la raíz, color de la barra de estado y los controles que lo muestran. */
  apply(on){
    document.documentElement.classList.toggle('is-night', on);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', on ? THEME.night : THEME.day);
    document.querySelectorAll('[data-action="night"]').forEach(b => b.setAttribute('aria-pressed', String(on)));
    document.querySelectorAll('[data-night-toggle]').forEach(i => { i.checked = on; });
  }
}
