/** Modal layers (sheets, cards, loading). Identified by their id. */
export class Overlays {
  constructor(root = document){
    this.root = root;
    this.hooks = new Map();
  }
  /** Runs `fn` right before opening layer `id`. */
  beforeOpen(id, fn){ this.hooks.set(id, fn); }

  /** Opens layer `id`, with its sheet scrolled back to the top. */
  open(id){
    this.hooks.get(id)?.();
    const el = this.#el(id);
    el.classList.add('is-on');
    const body = el.querySelector('.sheet__body');
    if (body) body.scrollTop = 0;
  }
  close(id){ this.#el(id).classList.remove('is-on'); }
  /** Closes every layer that can be dismissed. */
  closeDismissable(){
    this.root.querySelectorAll('.overlay[data-dismissable].is-on').forEach(el => el.classList.remove('is-on'));
  }
  anyOpen(){ return !!this.root.querySelector('.overlay.is-on'); }

  #el(id){ return this.root.getElementById(id); }
}
