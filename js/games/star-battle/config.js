/* Configuración de Star Battle. */

export const BOARD = Object.freeze({ size: 10, stars: 2 });

/** Niveles de dificultad. `target` es el nivel del solucionador lógico que exige el tablero. */
export const LEVELS = Object.freeze({
  easy:   Object.freeze({ name: 'Fácil',   target: 1, desc: 'Solo reglas básicas' }),
  hard:   Object.freeze({ name: 'Difícil', target: 2, desc: 'Razonar con varias regiones' }),
  expert: Object.freeze({ name: 'Experto', target: 3, desc: 'Necesita probar hipótesis' })
});
export const LEVEL_ORDER = Object.freeze(['easy', 'hard', 'expert']);

/** Se mantiene la clave antigua para no perder partidas ni estadísticas guardadas. */
export const STORAGE_KEY = 'starbattlego.v2';

/** Estado de cada casilla en la partida. */
export const MARK = Object.freeze({ EMPTY: 0, X: 1, STAR: 2, AUTO_X: 3 });
export const TOOL = Object.freeze({ STAR: 'star', BRUSH: 'brush' });

export const DEFAULT_SETTINGS = Object.freeze({ autoX: true, errors: true, timer: true, tint: false });

export const SETTINGS = Object.freeze([
  { key: 'autoX',  title: 'X automáticas',     desc: 'Pone X alrededor de cada estrella que colocas.' },
  { key: 'errors', title: 'Resaltar errores',  desc: 'Las estrellas que rompen una regla se ponen rojas.' },
  { key: 'timer',  title: 'Cronómetro',        desc: 'Muestra el tiempo de la partida.' },
  { key: 'tint',   title: 'Colorear regiones', desc: 'Tiñe cada región con un tono distinto.' }
]);
