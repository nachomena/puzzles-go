/** Enlaza los interruptores [data-setting] con los ajustes del store. */
export class SettingsPanel {
  constructor(root, store, onChange){
    this.inputs = [...root.querySelectorAll('[data-setting]')];
    this.store = store;
    this.inputs.forEach(inp => inp.addEventListener('change', () => {
      store.state.settings[inp.dataset.setting] = inp.checked;
      store.save();
      onChange(inp.dataset.setting);
    }));
  }
  /** Refleja en los interruptores los valores actuales. */
  sync(){
    const s = this.store.state.settings;
    this.inputs.forEach(inp => inp.checked = !!s[inp.dataset.setting]);
  }
}
