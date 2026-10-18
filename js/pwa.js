/**
 * Registers the service worker to play offline (only on http/https).
 * `onUpdate` is called when a new version takes control: reloading is enough to use it, with no
 * need to reinstall the app (removing the home screen icon also removes the progress).
 */
export function registerServiceWorker({ url = 'sw.js', onUpdate } = {}){
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const sw = navigator.serviceWorker, hadController = !!sw.controller;
  // the first install also takes control, but that isn't a new version
  sw.addEventListener('controllerchange', () => { if (hadController) onUpdate?.(); });
  const register = () => sw.register(url).then(reg => {
    // the home screen app can stay open for days: when coming back to it, look for another version
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
}

/** Asks the browser not to delete saved data even when space runs low (if it allows it). */
export function requestPersistentStorage(){
  try {
    navigator.storage?.persisted?.().then(done => done || navigator.storage.persist()).catch(() => {});
  } catch (e){ /* not supported */ }
}

/**
 * iOS, in the home screen app with a translucent status bar, makes the window shorter than the
 * screen (it subtracts the status bar) as long as the page isn't taller than that: whatever is fixed
 * to the bottom floats above the edge and the bottom strip isn't drawn. On screens taller than the
 * window (e.g. the Pentominoes table) it reaches the edge. So, if there is a gap, the page is at least
 * as tall as the whole screen (class has-viewport-gap, css/base.css).
 * The gap is kept in --viewport-gap and never goes down even if the window grows: with the bar already
 * at the edge, the strip covers the home indicator and is taken off the margin (--safe-bottom, css/tokens.css).
 * Only in app mode: in the browser the difference is its bars, which do take up room.
 */
export function fixStandaloneViewport(){
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (!standalone) return;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  let gap = 0;
  const update = () => {
    const now = Math.round(probe.getBoundingClientRect().height - window.innerHeight);
    if (now <= gap) return;
    gap = now;
    document.documentElement.style.setProperty('--viewport-gap', gap + 'px');
    document.documentElement.classList.add('has-viewport-gap');
  };
  update();
  window.addEventListener('resize', update);
}
