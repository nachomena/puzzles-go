/* "Mostrar dónde cabe" (juegos de piezas): con una pieza elegida se marca con un punto cada sitio
   del tablero donde cabe tal como está girada y volteada. Tocar un punto la muestra ahí (vista
   previa) y tocarlo otra vez la coloca. Cada juego calcula sus sitios; aquí va lo común. */

/** Ajuste de la hoja de Ajustes (encendido por defecto en los juegos que lo usan). */
export const SPOTS_SETTING = Object.freeze({
  key: 'spots', title: 'Mostrar dónde cabe',
  desc: 'Al elegir una pieza, marca los sitios del tablero donde cabe tal como está girada. Toca uno para verla ahí y otra vez para colocarla.'
});

/** Texto para la ayuda de cada juego. */
export const SPOTS_HELP = 'Con una pieza elegida, los puntos marcan dónde cabe tal como está girada: toca uno para verla ahí y otra vez para colocarla. Se puede desactivar en Ajustes.';

/**
 * Marcado SVG de los puntos (en las unidades del tablero de cada juego).
 * @param {{x:number,y:number}[]} points  centro de cada sitio
 * @param {number} chosen  índice del sitio que se está mirando (-1 = ninguno)
 * @param {number} r  radio del punto
 */
export const spotsMarkup = (points, chosen, r) => points.map(({ x, y }, i) =>
  `<circle class="fit-spot${i === chosen ? ' is-on' : ''}" data-spot="${i}" cx="${x.toFixed(4)}" cy="${y.toFixed(4)}" r="${(i === chosen ? r * 1.5 : r).toFixed(4)}"/>`).join('');

/**
 * Lo que recuerda cada partida: los sitios del momento y el que se está mirando.
 * `samePose(a, b)` compara dos posturas del juego.
 */
export class FitSpots {
  constructor(samePose){ this.samePose = samePose; this.list = []; this.chosen = null; }
  /** Guarda los sitios calculados; si el que se miraba ya no está, se olvida. */
  update(list){
    this.list = list;
    if (this.chosen && !list.some(p => this.samePose(p, this.chosen))) this.chosen = null;
    return list;
  }
  get chosenIndex(){ return this.chosen ? this.list.findIndex(p => this.samePose(p, this.chosen)) : -1; }
  clear(){ this.chosen = null; }
  /** Toque en el punto i: devuelve la postura a colocar (segundo toque) o null (primer toque). */
  tap(i){
    const pose = this.list[i];
    if (!pose) return null;
    if (this.chosen && this.samePose(this.chosen, pose)){ this.chosen = null; return pose; }
    this.chosen = pose;
    return null;
  }
}
