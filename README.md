# Puzzles Go

Juegos de lógica como web app instalable que funciona sin conexión:

- **Star Battle** 10×10, 2 estrellas (Fácil, Difícil, Experto).
- **Sudoku** 9×9 (Fácil, Medio, Difícil). El Difícil siempre exige X-Wing o Swordfish.
- **Smart Dices**: 12 piezas que forman 4 caras de dado con sumas por fila y columna (5 niveles).

Todos los tableros se generan en el dispositivo, tienen solución única y su nivel lo garantiza un
solucionador lógico que usa técnicas humanas.

Publicado con GitHub Pages. En iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

## Desarrollo

Sin dependencias ni paso de compilación: HTML, CSS y ES modules nativos.

```sh
npm start          # servidor local en http://localhost:8000 (los módulos no cargan con file://)
npm test           # pruebas de motores, reglas e infraestructura (node:test)
npm run check:sw   # comprueba que sw.js precachea todos los archivos
```

Al publicar cambios, sube `VERSION` en `sw.js`. Si añades un archivo en `css/` o `js/`, añádelo también
a `FILES` en `sw.js` (`npm run check:sw` te avisa).

## Estructura

```
index.html              carcasa: selector de juegos, menú de niveles, capas comunes y sprite de iconos
css/
  tokens.css            colores, fuentes y medidas (variables CSS)
  base.css · components.css · menu.css · play.css · overlays.css
  games/<juego>.css     estilos propios de cada juego
js/
  main.js               punto de entrada
  config.js             constantes comunes (tiempos, historial, reserva)
  app/app.js            carcasa: navegación, reparto de acciones, cronómetro, teclado
  core/                 infraestructura genérica, sin saber de ningún juego
    game-definition.js    contrato que cumple cada juego
    game-controller.js    controlador base (patrón plantilla): historial, victoria, cronómetro…
    store.js              estado persistente por juego (almacenamiento inyectable)
    puzzle-supply.js      reserva de tableros por nivel, generada en segundo plano
    runners.js            estrategias de generación: Web Worker o hilo principal
    generator-worker.js   bucle común de los workers
    history.js            deshacer / rehacer
  ui/                   vistas reutilizables: tablero en rejilla, cabecera, menús, capas, arrastre…
  lib/                  utilidades puras (bits, rejilla, azar, formato, DOM)
  games/
    catalog.js          catálogo: datos del selector + carga diferida de cada juego
    star-battle/        motor, reglas, controlador, vista, plantillas y definición
    sudoku/             ídem
tests/                  pruebas con node:test
```

Las 6.288 colocaciones válidas de Smart Dices están precalculadas en
`js/games/smart-dices/engine/arrangements-data.js` (`node scripts/build-dice-arrangements.mjs` las regenera).

Los iconos de la app salen de `icons/icon.svg`: `node scripts/make-icons.cjs` regenera los PNG.

Cómo añadir un juego nuevo: [js/games/README.md](js/games/README.md).
