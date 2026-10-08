# Puzzles Go

Juegos de lógica como web app instalable que funciona sin conexión:

- **Star Battle** 10×10, 2 estrellas (Fácil, Difícil, Experto).
- **Sudoku** 9×9 (Fácil, Medio, Difícil). El Difícil siempre exige X-Wing o Swordfish.
- **Smart Dices**: 12 piezas que forman 4 caras de dado con sumas por fila y columna (5 niveles).
- **Smart Circuit**: 10 piezas de doble cara que unen los puntos con caminos en un tablero de 8×4 (5 niveles).
- **Smart Circle**: 10 piezas de bolas de doble cara que llenan un tablero redondo de 3 anillos sin cruzar sus nervios (5 niveles; en los dos últimos también hay que encontrar dónde van los nervios).
- **Smart Hexagon**: 12 piezas de doble cara en forma de trazo que llenan los huecos entre las clavijas de un tablero hexagonal (5 niveles).
- **IQ Puzzler Pro** (2D): 12 piezas de bolas que llenan un tablero de 11×5; de 9 a 3 piezas puestas al empezar (5 niveles).
- **Katamino**: llenar un tablero de 5 columnas con pentominós; cada PENTA suma una pieza y una fila. 512 retos en 5 desafíos (del Pequeño Slam al Desafío) que se eligen en una tabla; los resueltos quedan marcados.
- **Rush Hour**: deslizar coches y camiones en un 6×6 hasta sacar el rojo; niveles por movimientos mínimos (de 4 a más de 30).
- **Zip**: un camino que pasa por todas las casillas tocando los números en orden (de 5×5 a 7×7).
- **Hashi**: unir islas con puentes de 1 o 2 que no se cruzan (de 6×6 a 10×10).
- **KenKen**: del 1 al N sin repetir por fila y columna, con jaulas de sumas, restas, productos y divisiones (de 4×4 a 7×7).
- **Akari**: bombillas que iluminan todo el tablero sin verse entre ellas (de 7×7 a 10×10).
- **Solitario**: el clásico de saltar bolas hasta dejar una, en tablero inglés (33) o europeo (37) a elegir en Ajustes.

Todos los tableros se generan en el dispositivo, tienen solución única y su nivel lo garantiza un
solucionador lógico que usa técnicas humanas.

Publicado con GitHub Pages. En iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

El progreso se guarda en el dispositivo y se conserva al actualizar: cuando hay una versión nueva,
la app avisa ("Hay una versión nueva · Actualizar") y no hace falta volver a añadirla a la pantalla
de inicio (borrar el icono borra también su progreso).

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

Las 358 colocaciones válidas de Smart Circuit están en `js/games/smart-circuit/engine/arrangements-data.js`
(`node scripts/build-circuit-arrangements.mjs` las regenera).

Las 274 soluciones de Smart Circle (con los nervios en su posición de partida; las demás son las mismas giradas) están en `js/games/smart-circle/engine/solutions-data.js`, generadas por `node scripts/build-circle-solutions.mjs`.

Las 8.124 soluciones de Smart Hexagon se guardan como 677, una por cada grupo de soluciones que son la misma girada o volteada, en `js/games/smart-hexagon/engine/solutions-data.js` (`node scripts/build-hexagon-solutions.mjs`, unos 3 minutos).

Los 512 PENTAS de Katamino (filas de piezas, con solución comprobada y la dificultad medida por el número de soluciones) están en `js/games/katamino/engine/sets-data.js`, generados por `node scripts/build-katamino-sets.mjs` (unos 20 segundos).

Los SmartGames (Dices, Circuit, Circle, Hexagon e IQ Puzzler Pro) van juntos en el selector, en una fila "Smart Games" que se despliega (`group` en su `meta.js`).

Los retos de Rush Hour de los niveles Difícil y Experto, que tardarían varios segundos en generarse en el momento, están ya calculados en `js/games/rush-hour/engine/bank-data.js` (`node scripts/build-rush-hour-bank.mjs`, ver el script). Los demás niveles y juegos se generan en el dispositivo.

Los iconos de la app salen de `icons/icon.svg`: `node scripts/make-icons.cjs` regenera los PNG.

Cómo añadir un juego nuevo: [js/games/README.md](js/games/README.md).
