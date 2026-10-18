/* Settings sheet: draws the settings declared by the current game and links them to its store.
   A setting is a switch ({ key, title, desc }) or a select if it has `options`
   ([{ value, label }]); the select saves the chosen `value`. */
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

  /** Shows the settings `defs` with the values in `store`. */
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
