/* Hoja de ajustes: pinta los interruptores que declara el juego actual y los enlaza con su store. */
export class SettingsPanel {
  constructor(listEl){
    this.listEl = listEl;
    this.store = null;
    this.onChange = null;
    listEl.addEventListener('change', e => {
      const key = e.target.dataset.setting;
      if (!key || !this.store) return;
      this.store.state.settings[key] = e.target.checked;
      this.store.save();
      this.onChange?.(key);
    });
  }

  /** Muestra los ajustes `defs` ([{ key, title, desc }]) con los valores de `store`. */
  show(defs, store, onChange){
    this.store = store;
    this.onChange = onChange;
    const s = store.state.settings;
    this.listEl.innerHTML = defs.map(({ key, title, desc }) =>
      `<label class="toggle"><div><b>${title}</b><span>${desc}</span></div>` +
      `<input type="checkbox" data-setting="${key}"${s[key] ? ' checked' : ''}></label>`).join('');
  }
}
