import { TIMING } from '../config.js';

/** Aviso breve en la parte inferior. */
export class Toast {
  constructor(el, duration = TIMING.toastMs){
    this.el = el;
    this.duration = duration;
    this.timer = 0;
  }
  show(msg){
    this.el.textContent = msg;
    this.el.classList.add('is-on');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.remove('is-on'), this.duration);
  }
}
