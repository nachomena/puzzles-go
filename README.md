# Puzzles Go

Juegos de lógica como web app instalable que funciona sin conexión, en español e inglés (el idioma del móvil, o el
que se elija en los ajustes del selector). Todos los que tienen dificultades usan las mismas tres: Fácil, Difícil y Experto.

- **Star Battle** 10×10, 2 estrellas.
- **Sudoku** 9×9. El Experto siempre exige X-Wing o Swordfish.
- **Kakuro** de 6×6 a 12×12: sumas en casillas negras y tramos sin números repetidos.
- **Bucle** (Slitherlink) de 5×5 a 10×10: un único lazo entre los puntos según los números de las casillas.
- **Engranajes** (invento propio) de 5×5 a 8×8: engranajes en un panel hexagonal que llevan el giro de la manivela al cerrojo, en una sola cadena sin círculos, con números que cuentan los engranajes de alrededor.
- **Killer Sudoku** 9×9 con jaulas de suma y casi sin números puestos. El Difícil siempre exige la regla del 45; el Experto, aplicarla a varias filas, columnas o cajas a la vez.
- **Dados**: 12 piezas que forman 4 caras de dado con sumas por fila y columna.
- **Circuito**: 10 piezas de doble cara que unen los puntos con caminos en un tablero de 8×4.
- **Círculo**: 10 piezas de bolas de doble cara que llenan un tablero redondo de 3 anillos sin cruzar sus nervios (en Difícil y Experto también hay que encontrar dónde van los nervios).
- **Hexágono**: 12 piezas de doble cara en forma de trazo que llenan los huecos entre las clavijas de un tablero hexagonal.
- **Encaje**: 12 piezas de bolas que llenan un tablero de 11×5; de 8 a 3 piezas puestas al empezar.
- **Pentominós**: llenar un tablero de 5 columnas con pentominós; cada reto suma una pieza y una fila. 512 retos en 5 desafíos (de Iniciación a Desafío) que se eligen en una tabla; los resueltos quedan marcados.
- **Atasco**: deslizar coches y camiones en un 6×6 hasta sacar el rojo; niveles por movimientos mínimos (de 8 a más de 30).
- **Trazo**: un camino que pasa por todas las casillas tocando los números en orden (de 6×6 a 7×7).
- **Puentes**: unir islas con puentes de 1 o 2 que no se cruzan (de 7×7 a 10×10).
- **Calcudoku**: del 1 al N sin repetir por fila y columna, con jaulas de sumas, restas, productos y divisiones (de 5×5 a 7×7).
- **Luces**: bombillas que iluminan todo el tablero sin verse entre ellas (de 7×7 a 10×10).
- **Binario** (las reglas de 0h h1): rojo y azul, sin tres iguales seguidos, mitad y mitad en cada línea y sin dos filas o columnas iguales (de 8×8 a 12×12).
- **Solitario**: el clásico de saltar bolas hasta dejar una, en tablero inglés (33) o europeo (37) a elegir en Ajustes.

Todos los tableros se generan en el dispositivo, tienen solución única y su nivel lo garantiza un
solucionador lógico que usa técnicas humanas.

Publicado con GitHub Pages. En iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

El progreso se guarda en el dispositivo y se conserva al actualizar: cuando hay una versión nueva,
la app avisa ("Hay una versión nueva · Actualizar") y no hace falta volver a añadirla a la pantalla
de inicio (borrar el icono borra también su progreso).

## Desarrollo

Sin paso de compilación: HTML, CSS y ES modules nativos. La única dependencia es Playwright, para las
pruebas en el navegador (la app no la usa).

```sh
npm install        # Playwright y el gancho de pre-commit (.githooks)
npm start          # servidor local en http://localhost:8000 (los módulos no cargan con file://)
npm test           # pruebas de motores, reglas e infraestructura (node:test)
npm run test:e2e   # pruebas en el navegador (Playwright): cada juego, acciones y uso sin conexión
npm run check      # sintaxis e imports de todo el JS, y sw.js al día
```

`sw.js` no se edita a mano: al hacer commit, el gancho de pre-commit (`scripts/build-sw.mjs`) escribe la
lista de archivos que se guardan para jugar sin conexión y una `VERSION` que es la huella de su contenido,
así cada cambio publicado llega solo al iPhone. `npm run build:sw` hace lo mismo a mano.

GitHub Actions (`.github/workflows/ci.yml`) pasa `check`, `test` y `test:e2e` en cada push y pull request.

El CSS de cada juego (`css/games/<id>.css`) se carga al abrirlo; lo que comparten varios juegos va en
`css/components.css`. Las fuentes de `fonts/` son un recorte de Archivo y Archivo Black con solo los
caracteres que usa la app (`python3 scripts/build-fonts.py` las rehace).

## Estructura

```
index.html              carcasa: selector de juegos, menú de niveles, capas comunes y sprite de iconos
css/
  tokens.css            colores, fuentes y medidas (variables CSS)
  base.css · components.css · menu.css · play.css · overlays.css · progress.css
  games/<juego>.css     estilos propios de cada juego (se cargan al abrirlo)
js/
  main.js               punto de entrada
  config.js             constantes comunes (tiempos, historial, reserva)
  app/app.js            carcasa: navegación, reparto de acciones, cronómetro, teclado
  i18n/                 idiomas: es.js y en.js (todos los textos, con las mismas claves) y t()
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
  e2e/                  pruebas en el navegador (Playwright)
scripts/                generadores de datos, de sw.js y de las fuentes; comprobación del JS
```

Las 6.288 colocaciones válidas de Dados están precalculadas en
`js/games/smart-dices/engine/arrangements-data.js` (`node scripts/build-dice-arrangements.mjs` las regenera).

Las 358 colocaciones válidas de Circuito están en `js/games/smart-circuit/engine/arrangements-data.js`
(`node scripts/build-circuit-arrangements.mjs` las regenera).

Las 274 soluciones de Círculo (con los nervios en su posición de partida; las demás son las mismas giradas) están en `js/games/smart-circle/engine/solutions-data.js`, generadas por `node scripts/build-circle-solutions.mjs`.

Las 8.124 soluciones de Hexágono se guardan como 677, una por cada grupo de soluciones que son la misma girada o volteada, en `js/games/smart-hexagon/engine/solutions-data.js` (`node scripts/build-hexagon-solutions.mjs`, unos 3 minutos).

Los 512 retos de Pentominós (filas de piezas, con solución comprobada y la dificultad medida por el número de soluciones) están en `js/games/katamino/engine/sets-data.js`, generados por `node scripts/build-katamino-sets.mjs` (unos 20 segundos).

Los juegos de piezas (Dados, Circuito, Círculo, Hexágono y Encaje) van juntos en el selector, en una fila "Piezas" que se despliega (`group` en su `meta.js`).

Los retos de Kakuro Experto (12×12) también vienen calculados, en `js/games/kakuro/engine/bank-data.js` (`node scripts/build-kakuro-bank.mjs`, unos minutos); cada uno sale en 4 versiones (traspuesto y con los números cambiados por 10 − n), que conservan la solución única.

Los retos de Engranajes de todos los niveles vienen calculados en `js/games/gears/engine/bank-data.js` (`node scripts/build-gears-bank.mjs`, unos 15 minutos): en el ordenador el solucionador demuestra la solución única sin el límite de pasos del teléfono, y el Experto queda con menos números. Cada uno sale en 2 versiones (al revés de arriba abajo o girado media vuelta con la manivela y el cerrojo cambiados).

Los retos de Atasco de los niveles Difícil y Experto, que tardarían varios segundos en generarse en el momento, están ya calculados en `js/games/rush-hour/engine/bank-data.js` (`node scripts/build-rush-hour-bank.mjs`, ver el script). Los demás niveles y juegos se generan en el dispositivo.

Los iconos de la app salen de `icons/icon.svg`: `node scripts/make-icons.cjs` regenera los PNG.

Cómo añadir un juego nuevo: [js/games/README.md](js/games/README.md).
