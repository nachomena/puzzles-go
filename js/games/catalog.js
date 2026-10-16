/* Catálogo de juegos. El selector solo necesita los datos de meta.js; el resto del juego
   (motor, controlador, plantillas y su hoja de estilos `css`) se carga al abrirlo por primera vez.
   Para añadir un juego: crea su carpeta (ver README.md) y añade aquí su entrada. */
import starBattle from './star-battle/meta.js';
import sudoku from './sudoku/meta.js';
import killerSudoku from './killer-sudoku/meta.js';
import kakuro from './kakuro/meta.js';
import slitherlink from './slitherlink/meta.js';
import smartDices from './smart-dices/meta.js';
import smartCircuit from './smart-circuit/meta.js';
import smartCircle from './smart-circle/meta.js';
import smartHexagon from './smart-hexagon/meta.js';
import iqPuzzler from './iq-puzzler/meta.js';
import katamino from './katamino/meta.js';
import rushHour from './rush-hour/meta.js';
import zip from './zip/meta.js';
import hashi from './hashi/meta.js';
import kenken from './kenken/meta.js';
import akari from './akari/meta.js';
import binario from './binario/meta.js';
import pegSolitaire from './peg-solitaire/meta.js';

export const CATALOG = [
  { meta: starBattle, load: () => import('./star-battle/index.js'), css: 'css/games/star-battle.css' },
  { meta: sudoku,     load: () => import('./sudoku/index.js') },
  { meta: killerSudoku, load: () => import('./killer-sudoku/index.js'), css: 'css/games/killer-sudoku.css' },
  { meta: kakuro,       load: () => import('./kakuro/index.js'), css: 'css/games/kakuro.css' },
  { meta: slitherlink,  load: () => import('./slitherlink/index.js'), css: 'css/games/slitherlink.css' },
  { meta: smartDices,   load: () => import('./smart-dices/index.js'), css: 'css/games/smart-dices.css' },
  { meta: smartCircuit, load: () => import('./smart-circuit/index.js'), css: 'css/games/smart-circuit.css' },
  { meta: smartCircle,  load: () => import('./smart-circle/index.js'), css: 'css/games/smart-circle.css' },
  { meta: smartHexagon, load: () => import('./smart-hexagon/index.js'), css: 'css/games/smart-hexagon.css' },
  { meta: iqPuzzler,    load: () => import('./iq-puzzler/index.js'), css: 'css/games/iq-puzzler.css' },
  { meta: katamino,     load: () => import('./katamino/index.js'), css: 'css/games/katamino.css' },
  { meta: rushHour,     load: () => import('./rush-hour/index.js'), css: 'css/games/rush-hour.css' },
  { meta: zip,          load: () => import('./zip/index.js'), css: 'css/games/zip.css' },
  { meta: hashi,        load: () => import('./hashi/index.js'), css: 'css/games/hashi.css' },
  { meta: kenken,       load: () => import('./kenken/index.js'), css: 'css/games/kenken.css' },
  { meta: akari,        load: () => import('./akari/index.js'), css: 'css/games/akari.css' },
  { meta: binario,      load: () => import('./binario/index.js'), css: 'css/games/binario.css' },
  { meta: pegSolitaire, load: () => import('./peg-solitaire/index.js'), css: 'css/games/peg-solitaire.css' }
];
