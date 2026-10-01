/* Catálogo de juegos. El selector solo necesita los datos de meta.js; el resto del juego
   (motor, controlador, plantillas) se importa al abrirlo por primera vez.
   Para añadir un juego: crea su carpeta (ver README.md) y añade aquí su entrada. */
import starBattle from './star-battle/meta.js';
import sudoku from './sudoku/meta.js';
import smartDices from './smart-dices/meta.js';
import smartCircuit from './smart-circuit/meta.js';

export const CATALOG = [
  { meta: starBattle, load: () => import('./star-battle/index.js') },
  { meta: sudoku,     load: () => import('./sudoku/index.js') },
  { meta: smartDices,   load: () => import('./smart-dices/index.js') },
  { meta: smartCircuit, load: () => import('./smart-circuit/index.js') }
];
