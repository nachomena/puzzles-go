/** Capas modales (hojas, tarjetas, carga). Se identifican por su id. */
export class Overlays {
  constructor(root = document){
    this.root = root;
    this.hooks = new Map();
  }
  /** Ejecuta `fn` justo antes de abrir la capa `id`. */
  beforeOpen(id, fn){ this.hooks.set(id, fn); }

  open(id){
    this.hooks.get(id)?.();
    this.#el(id).classList.add('is-on');
  }
  close(id){ this.#el(id).classList.remove('is-on'); }
  /** Cierra todas las capas que se pueden descartar. */
  closeDismissable(){
    this.root.querySelectorAll('.overlay[data-dismissable].is-on').forEach(el => el.classList.remove('is-on'));
  }
  anyOpen(){ return !!this.root.querySelector('.overlay.is-on'); }

  #el(id){ return this.root.getElementById(id); }
}
