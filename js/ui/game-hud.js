/* Header and toolbar of a game screen. Presentation only. */
import { formatTime } from '../lib/format.js';
import { t } from '../i18n/index.js';

export class GameHud {
  constructor(root){
    const q = sel => root.querySelector(sel);
    this.level = q('[data-hud="level"]');
    this.size = q('[data-hud="size"]');
    this.time = q('[data-hud="time"]');
    this.undo = q('[data-action="undo"]');
    this.redo = q('[data-action="redo"]');
    this.tools = [...root.querySelectorAll('[data-action="tool"]')];
    this.hint = q('[data-action="hint"]');
    this.hintWait = q('[data-hud="hint-wait"]');
  }
  setHeader(levelName, sizeText){
    this.level.textContent = levelName;
    this.size.textContent = sizeText;
  }
  setTime(text){ this.time.textContent = text; }
  /** Games without undo/redo buttons simply don't have them. */
  setHistory(canUndo, canRedo){
    if (this.undo) this.undo.disabled = !canUndo;
    if (this.redo) this.redo.disabled = !canRedo;
  }
  /** Countdown to the next hint (0 = available). */
  setHintWait(sec){
    if (!this.hint) return;   // game without hints
    const text = sec > 0 ? formatTime(sec) : '';
    if (this.hintWait.textContent === text) return;
    this.hintWait.textContent = text;
    this.hint.classList.toggle('is-waiting', sec > 0);
    this.hint.setAttribute('aria-label', sec > 0 ? t('common.hintIn', { time: text }) : t('common.hint'));
  }
  setTool(tool){
    for (const btn of this.tools){
      const on = btn.dataset.tool === tool;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', on);
    }
  }
}
