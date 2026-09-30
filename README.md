# Star Battle Go

Juego de lógica Star Battle (10×10, 2 estrellas) como web app instalable que funciona sin conexión.

Publicado con GitHub Pages. En iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

## Desarrollo

Sin dependencias ni paso de compilación: HTML, CSS y ES modules nativos.

```sh
npm start          # servidor local en http://localhost:8000 (los módulos no cargan con file://)
npm test           # pruebas del motor y de las reglas (node:test)
npm run check:sw   # comprueba que sw.js precachea todos los archivos
```

Al publicar cambios, sube `VERSION` en `sw.js`. Si añades un archivo en `css/` o `js/`, añádelo también a `FILES` en `sw.js` (`npm run check:sw` te avisa).

## Estructura

```
index.html            marcado + sprite de iconos SVG (<use href="#i-…">)
css/
  tokens.css          colores, fuentes y medidas (variables CSS)
  base.css            reset y utilidades
  components.css      botones, interruptor, selector, casilla, aviso
  menu.css · game.css · overlays.css   estilos de cada pantalla
js/
  config.js           constantes: niveles, tamaño, tiempos, marcas
  main.js             punto de entrada: crea y conecta los módulos, mapa de acciones
  pwa.js              registro del service worker
  lib/                utilidades genéricas (rejilla, azar, formato, DOM)
  engine/             motor puro, sin DOM: se usa en la página y en el worker
    exact-solver.js     búsqueda exhaustiva / conteo de soluciones
    logic-solver.js     técnicas humanas por niveles (califica la dificultad)
    regions.js          construcción de regiones
    generator.js        generador de tableros de solución única
    worker.js           Web Worker (módulo) que genera en segundo plano
  game/               dominio de la app
    store.js            estado persistente (almacenamiento inyectable)
    rules.js            reglas sobre las marcas del jugador (puras)
    history.js          deshacer / rehacer
    runners.js          estrategias de generación: worker o hilo principal
    puzzle-supply.js    mantiene la reserva de tableros de cada nivel
    game-controller.js  partida en curso
  ui/                 vistas: tablero, HUD, menú, capas, ajustes, aviso, arrastre
tests/                pruebas con node:test
```

Los botones declaran lo que hacen con `data-action="…"`; `main.js` resuelve cada acción en un único mapa, así que añadir un botón no requiere tocar el resto.
