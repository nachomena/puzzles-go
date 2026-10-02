# Añadir un juego

Cada juego vive en su carpeta y se enchufa a la app con una definición. La carcasa (`js/app/app.js`)
no sabe nada de ningún juego concreto: selector, menú de niveles, ajustes, ayuda, generación en
segundo plano, historial, cronómetro, estadísticas y pantalla de victoria son comunes.

## Pasos

1. Crea `js/games/<id>/` con, como mínimo:
   - `meta.js` — datos ligeros: `id`, `name`, `tagline`, `icon`, `storageKey`, `levels` y `levelOrder`.
     El selector y el menú de niveles se pintan solo con esto; el resto del juego se importa al
     abrirlo, en segundo plano, y empieza a generar tableros.
   - `engine/` — motor puro (sin DOM) con `generate(target)`: una **función generadora** que cede
     (`yield`) a menudo y devuelve `{ level, ...tablero }` o `null`. `level` es el nivel real del tablero.
   - `worker.js` — dos líneas: `serveGenerator(generate)` (ver `core/generator-worker.js`).
   - `controller.js` — clase que **extiende `GameController`** (`core/game-controller.js`) e implementa
     sus pasos: `createSession`, `mountBoard`, `renderBoard`, `snapshot`, `restore`, `hasInput`,
     `clearInput`, `isSolved`, `hint` y, si hace falta, `normalize`, `onSetting`, `celebrate`,
     `actions` y `onKey`. Deshacer, reiniciar, cronómetro y victoria ya los hereda.
   - `templates.js` — marcado de los controles bajo el tablero y de la ayuda. Usa las piezas de
     `ui/templates.js` (`iconButton`, `toolPicker`, `undoRedo`…). Los botones declaran lo que hacen con
     `data-action="…"`: las acciones comunes las resuelve la carcasa y las propias van en `actions`.
   - `index.js` — `export default defineGame({ ...meta, ... })` con todos los campos del contrato
     (`core/game-definition.js`). `defineGame` falla al arrancar si falta alguno.
     Opcional: `hint: false` quita el botón de pista. En `settings`, un ajuste con `options`
     (`[{ value, label }]`) se muestra como desplegable en vez de interruptor.
2. Añade `{ meta, load: () => import('./<id>/index.js') }` a `CATALOG` en `js/games/catalog.js`.
3. Si necesita estilos, crea `css/games/<id>.css` y enlázalo en `index.html`.
4. Iconos nuevos: añade un `<symbol id="i-…">` al sprite de `index.html`.
5. Añade sus archivos a `FILES` en `sw.js` y sube `VERSION` (`npm run check:sw`).
6. Pruebas en `tests/<id>-*.test.js`.

## Reutilizable

- `ui/grid-board.js` — tablero N×N con paredes entre regiones, repintado incremental, destello,
  ola de victoria y `cellAt(x, y)`. Star Battle y Sudoku heredan de él.
- `ui/cell-drag.js` — tocar y arrastrar sobre una rejilla.
- `lib/bits.js` — `popcount`, `bitIndices`, `someCombination`.
