/* App languages. The texts are in one file per language (es.js, en.js) with the same keys; only the one in
   use is loaded. The language is the phone's unless another one is chosen in the picker settings; changing
   it reloads the app. Outside the browser (the Node tests) it is Spanish. */
const KEY = 'puzzlesgo.lang';

/** Available languages, each with its name in its own language. */
export const LANGUAGES = Object.freeze({ es: 'Español', en: 'English' });

const storage = (() => { try { return globalThis.localStorage ?? null; } catch (e){ return null; } })();

/** The phone's language, if it is one of the app's; otherwise English. */
export function deviceLanguage(){
  if (typeof document === 'undefined') return 'es';
  const tags = globalThis.navigator?.languages?.length ? navigator.languages : [navigator.language || ''];
  for (const tag of tags){
    const code = String(tag).slice(0, 2).toLowerCase();
    if (code in LANGUAGES) return code;
  }
  return 'en';
}

/** What was chosen in the settings: 'es', 'en' or 'auto' (the phone's). */
export function languageChoice(){
  let v = null;
  try { v = storage?.getItem(KEY); } catch (e){}
  return v in LANGUAGES ? v : 'auto';
}

/** Language in use. */
export const lang = languageChoice() === 'auto' ? deviceLanguage() : languageChoice();

const dict = (await import(`./${lang}.js`)).default;
if (typeof document !== 'undefined') document.documentElement.lang = lang;

/** Saves the chosen language ('auto' goes back to the phone's) and reloads the app to apply it. */
export function setLanguage(choice){
  try { choice === 'auto' ? storage?.removeItem(KEY) : storage?.setItem(KEY, choice); } catch (e){}
  location.reload();
}

const lookup = (d, key) => key.split('.').reduce((o, k) => o?.[k], d);

/**
 * Text for `key` ("hub.choose", "games.sudoku.name"…). Texts have {name} slots that are filled from
 * `vars`; the ones that depend on a number (plurals) are functions that receive `vars`.
 */
export function t(key, vars = {}){
  const s = lookup(dict, key);
  if (typeof s === 'function') return s(vars);
  if (typeof s !== 'string'){ console.warn('i18n: missing', key); return key; }
  return s.replace(/\{(\w+)\}/g, (m, k) => k in vars ? vars[k] : m);
}

/** Translates the fixed markup: data-i18n (text) and data-i18n-aria (aria-label). */
export function translateDom(root = document){
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
}
