/* Startup diagnostics (classic script, loaded before the modules).
   If the app fails to draw the game picker, it shows the error on screen: on a phone there is no
   console at hand to see it. It runs before the js/i18n texts, so it carries its own in both
   languages. */
(function(){
  var errors = [], lang = '';
  try { lang = localStorage.getItem('puzzlesgo.lang') || ''; } catch (e){}
  var es = /^es/i.test(lang || navigator.language || '');
  var TEXT = es
    ? { load: 'No se pudo cargar ', fail: 'No se pudo arrancar la app.', none: 'Sin mensaje de error.' }
    : { load: 'Could not load ', fail: 'The app could not start.', none: 'No error message.' };
  function remember(msg){ if (msg && errors.indexOf(msg) < 0) errors.push(String(msg)); }
  window.addEventListener('error', function(e){
    remember(e.message || (e.target && e.target.src ? TEXT.load + e.target.src : ''));
  }, true);
  window.addEventListener('unhandledrejection', function(e){ remember(e.reason && (e.reason.stack || e.reason.message) || e.reason); });
  window.addEventListener('load', function(){
    setTimeout(function(){
      var list = document.getElementById('games');
      if (!list || list.children.length) return;
      var boot = document.querySelector('.is-boot');   // the startup screen would hide the error
      if (boot) boot.classList.remove('is-on', 'is-boot');
      var box = document.createElement('div');
      box.className = 'boot-error';
      box.innerHTML = '<b>' + TEXT.fail + '</b><span></span>';
      box.lastChild.textContent = (errors.join('\n') || TEXT.none) + '\n\n' + navigator.userAgent;
      list.appendChild(box);
    }, 3000);
  });
})();
