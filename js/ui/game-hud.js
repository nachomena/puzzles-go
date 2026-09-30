/* Cabecera y barra de herramientas de la partida. Solo presentación. */
import { TOOL } from '../config.js';

export class GameHud {
  constructor(root){
    const q = sel => root.querySelector(sel);
    this.level = q('[data-hud="level"]');
    this.size = q('[data-hud="size"]');
    this.time = q('[data-hud="time"]');
    this.undo = q('[data-action="undo"]');
    this.redo = q('[data-action="redo"]');
    this.tools = [...root.querySelectorAll('[data-action="tool"]')];
  }
  setHeader(levelName, { N, K }){
    this.level.textContent = levelName;
    this.size.textContent = `${N}x${N} ${K}★`;
  }
  setTime(text){ this.time.textContent = text; }
  setHistory(canUndo, canRedo){
    this.undo.disabled = !canUndo;
    this.redo.disabled = !canRedo;
  }
  setTool(tool){
    for (const btn of this.tools){
      const on = btn.dataset.tool === tool;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', on);
    }
  }
}

export const isTool = t => Object.values(TOOL).includes(t);
