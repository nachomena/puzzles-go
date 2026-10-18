/* Confirmation dialog in the app's style (instead of window.confirm).
   ask() returns a promise with the chosen option: 'accept', 'alternate' or 'cancel'. */
import { t } from '../i18n/index.js';

export class ConfirmDialog {
  constructor(el, overlays){
    this.el = el;
    this.overlays = overlays;
    this.resolve = null;
    this.title = el.querySelector('[data-confirm="title"]');
    this.text = el.querySelector('[data-confirm="text"]');
    this.accept = el.querySelector('[data-confirm="accept"]');
    this.alternate = el.querySelector('[data-confirm="alternate"]');
    // Tapping the backdrop counts as cancel
    el.addEventListener('click', e => { if (e.target === el) this.answer('cancel'); });
  }

  get isOpen(){ return !!this.resolve; }

  /** @param {{ title: string, text: string, accept: string, alternate?: string }} o */
  ask({ title, text, accept, alternate }){
    this.answer('cancel');   // an earlier unanswered question counts as cancelled
    this.title.textContent = title;
    this.text.textContent = text;
    this.accept.textContent = accept;
    this.alternate.textContent = alternate || t('common.cancel');
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
