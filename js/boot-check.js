/* Diagnóstico de arranque (script clásico, se carga antes que los módulos).
   Si la app no consigue pintar el selector de juegos, muestra el error en pantalla:
   en el móvil no hay consola a mano para verlo. */
(function(){
  var errors = [];
  function remember(msg){ if (msg && errors.indexOf(msg) < 0) errors.push(String(msg)); }
  window.addEventListener('error', function(e){
    remember(e.message || (e.target && e.target.src ? 'No se pudo cargar ' + e.target.src : ''));
  }, true);
  window.addEventListener('unhandledrejection', function(e){ remember(e.reason && (e.reason.stack || e.reason.message) || e.reason); });
  window.addEventListener('load', function(){
    setTimeout(function(){
      var list = document.getElementById('games');
      if (!list || list.children.length) return;
      var box = document.createElement('div');
      box.className = 'boot-error';
      box.innerHTML = '<b>No se pudo arrancar la app.</b><span></span>';
      box.lastChild.textContent = (errors.join('\n') || 'Sin mensaje de error.') + '\n\n' + navigator.userAgent;
      list.appendChild(box);
    }, 3000);
  });
})();
