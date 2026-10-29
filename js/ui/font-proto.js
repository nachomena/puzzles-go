/* PROTOTYPE: lets the player try other fonts from the app settings (css/font-proto.css). Saved apart, like
   night mode. To be removed once a font is chosen. */
const KEY = 'puzzlesgo.font';
export const FONTS = ['rubik', 'outfit', 'bricolage', 'space'];

export class FontProto {
  /** @param {Storage|null} storage */
  constructor(storage){
    this.storage = storage;
    let v = null;
    try { v = storage?.getItem(KEY); } catch (e){}
    this.apply(FONTS.includes(v) ? v : '');
  }

  get current(){ return document.documentElement.dataset.font || ''; }

  set(font){
    this.apply(font);
    try { font ? this.storage?.setItem(KEY, font) : this.storage?.removeItem(KEY); } catch (e){}
  }

  apply(font){
    if (font) document.documentElement.dataset.font = font;
    else delete document.documentElement.dataset.font;
    document.querySelectorAll('[data-font-select]').forEach(s => { s.value = font; });
  }
}
