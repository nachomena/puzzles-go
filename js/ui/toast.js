import { TIMING } from '../config.js';

const MS_PER_CHAR = 50;

/** Short notice at the bottom. A long text stays longer, so there is time to read it. */
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
    this.timer = setTimeout(() => this.el.classList.remove('is-on'), Math.max(this.duration, msg.length * MS_PER_CHAR));
  }
}
