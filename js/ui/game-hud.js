/* Cabecera y barra de herramientas de una pantalla de juego. Solo presentación. */
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
  setHeader(levelName, sizeText){
    this.level.textContent = levelName;
    this.size.textContent = sizeText;
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
