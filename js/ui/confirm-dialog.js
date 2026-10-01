/* Diálogo de confirmación con el estilo de la app (en vez de window.confirm).
   ask() devuelve una promesa con la opción elegida: 'accept', 'alternate' o 'cancel'. */
export class ConfirmDialog {
  constructor(el, overlays){
    this.el = el;
    this.overlays = overlays;
    this.resolve = null;
    this.title = el.querySelector('[data-confirm="title"]');
    this.text = el.querySelector('[data-confirm="text"]');
    this.accept = el.querySelector('[data-confirm="accept"]');
    this.alternate = el.querySelector('[data-confirm="alternate"]');
    // Tocar el fondo equivale a cancelar
    el.addEventListener('click', e => { if (e.target === el) this.answer('cancel'); });
  }

  get isOpen(){ return !!this.resolve; }

  /** @param {{ title: string, text: string, accept: string, alternate?: string }} o */
  ask({ title, text, accept, alternate }){
    this.answer('cancel');   // una pregunta anterior sin responder se da por cancelada
    this.title.textContent = title;
    this.text.textContent = text;
    this.accept.textContent = accept;
    this.alternate.textContent = alternate || 'Cancelar';
    this.overlays.open(this.el.id);
    return new Promise(resolve => { this.resolve = resolve; });
  }

  answer(choice){
    if (!this.resolve) return;
    const resolve = this.resolve;
    this.resolve = null;
    this.overlays.close(this.el.id);
    resolve(choice);
  }
}
