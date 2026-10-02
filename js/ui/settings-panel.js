/* Hoja de ajustes: pinta los ajustes que declara el juego actual y los enlaza con su store.
   Un ajuste es un interruptor ({ key, title, desc }) o un desplegable si trae `options`
   ([{ value, label }]); el desplegable guarda el `value` elegido. */
export class SettingsPanel {
  constructor(listEl){
    this.listEl = listEl;
    this.store = null;
    this.onChange = null;
    listEl.addEventListener('change', e => {
      const key = e.target.dataset.setting;
      if (!key || !this.store) return;
      this.store.state.settings[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      this.store.save();
      this.onChange?.(key);
    });
  }

  /** Muestra los ajustes `defs` con los valores de `store`. */
  show(defs, store, onChange){
    this.store = store;
    this.onChange = onChange;
    const s = store.state.settings;
    this.listEl.innerHTML = defs.map(({ key, title, desc, options }) => {
      const input = options
        ? `<select class="select" data-setting="${key}">` +
          options.map(o => `<option value="${o.value}"${s[key] === o.value ? ' selected' : ''}>${o.label}</option>`).join('') +
          `</select>`
        : `<input type="checkbox" data-setting="${key}"${s[key] ? ' checked' : ''}>`;
      return `<label class="toggle"><div><b>${title}</b><span>${desc}</span></div>${input}</label>`;
    }).join('');
  }
}
