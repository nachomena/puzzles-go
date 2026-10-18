# Notas para Claude

## Forma de trabajar
- Se trabaja directamente en `main`. No hacer commit ni push hasta que el usuario dé el ok ("ok push").
- Responder en español.
- Tras cada cambio en la app, publicar la versión de prueba en https://claude.ai/artifact/RFYwytBGfBy6QTfJCuxYEy
  (`index.html` con los archivos cambiados en `files`, siempre también `sw.js`).
- Antes de hacer push: `npm run build:sw`, `npm run check`, `npm test` y `npx playwright test`.
- CSS ordenado y sin duplicar: lo compartido va en `css/components.css`, lo de cada juego en `css/games/<id>.css`.
- Ningún texto visible en el código: va en `js/i18n/es.js` y `js/i18n/en.js` (mismas claves) y se usa con `t()`.
- Nombres de juego sin marcas registradas (Atasco, Pentominós, Calcudoku, Encaje, Dados…); los ids y las claves de
  guardado no cambian, para no perder el progreso.

## Pendiente para más adelante
- **App en las tiendas con Capacitor**: la misma web dentro de una app de iOS y Android (`npx cap sync` tras
  cada cambio). Google Play: 25 $ una vez (cuenta personal nueva: prueba cerrada con 12 personas durante
  14 días). App Store: 99 $ al año, compilar en un Mac o en la nube. Solo Android: TWA (PWABuilder o
  Bubblewrap). Por ahora se sigue con la web app hasta que esté sólida.
- **Antes de publicar en tiendas**: publicar una política de privacidad, añadir `fonts/OFL.txt` (licencia de
  Archivo) y comprobar que "Puzzles Go" no es una marca registrada.
- **Exportar e importar el progreso** en Ajustes, para poder reinstalar la app sin perderlo.
- **Dominio propio** en GitHub Pages.
