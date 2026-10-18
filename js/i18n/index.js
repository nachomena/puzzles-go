/* Idiomas de la app. Los textos están en un fichero por idioma (es.js, en.js) con las mismas claves; se carga
   solo el del idioma en uso. El idioma es el del móvil salvo que se elija otro en los ajustes del selector;
   al cambiarlo se recarga la app. Fuera del navegador (las pruebas en Node) va en español. */
const KEY = 'puzzlesgo.lang';

/** Idiomas disponibles, cada uno con su nombre en su propio idioma. */
export const LANGUAGES = Object.freeze({ es: 'Español', en: 'English' });

const storage = (() => { try { return globalThis.localStorage ?? null; } catch (e){ return null; } })();

/** Idioma del móvil, si es uno de los de la app; si no, inglés. */
export function deviceLanguage(){
  if (typeof document === 'undefined') return 'es';
  const tags = globalThis.navigator?.languages?.length ? navigator.languages : [navigator.language || ''];
  for (const tag of tags){
    const code = String(tag).slice(0, 2).toLowerCase();
    if (code in LANGUAGES) return code;
  }
  return 'en';
}

/** Lo elegido en los ajustes: 'es', 'en' o 'auto' (el del móvil). */
export function languageChoice(){
  let v = null;
  try { v = storage?.getItem(KEY); } catch (e){}
  return v in LANGUAGES ? v : 'auto';
}

/** Idioma en uso. */
export const lang = languageChoice() === 'auto' ? deviceLanguage() : languageChoice();

const dict = (await import(`./${lang}.js`)).default;
if (typeof document !== 'undefined') document.documentElement.lang = lang;

/** Guarda el idioma elegido ('auto' vuelve al del móvil) y recarga la app para aplicarlo. */
export function setLanguage(choice){
  try { choice === 'auto' ? storage?.removeItem(KEY) : storage?.setItem(KEY, choice); } catch (e){}
  location.reload();
}

const lookup = (d, key) => key.split('.').reduce((o, k) => o?.[k], d);

/**
 * Texto de `key` ("hub.choose", "games.sudoku.name"…). Los textos llevan huecos {nombre} que se rellenan con
 * `vars`; los que dependen de un número (plurales) son funciones que reciben `vars`.
 */
export function t(key, vars = {}){
  const s = lookup(dict, key);
  if (typeof s === 'function') return s(vars);
  if (typeof s !== 'string'){ console.warn('i18n: falta', key); return key; }
  return s.replace(/\{(\w+)\}/g, (m, k) => k in vars ? vars[k] : m);
}

/** Traduce el marcado fijo: data-i18n (texto) y data-i18n-aria (aria-label). */
export function translateDom(root = document){
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
}
