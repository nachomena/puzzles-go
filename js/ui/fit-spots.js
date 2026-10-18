/* "Show where it fits" (piece games): with a piece picked, every place on the board where it fits as
   it is rotated and flipped is marked with a dot. Tapping a dot shows it there (preview) and tapping it
   again places it. Each game works out its places; the shared part is here. */
import { t } from '../i18n/index.js';

/** The Settings sheet option (on by default in the games that use it). */
export const SPOTS_SETTING = Object.freeze({
  key: 'spots', title: t('settings.spots'), desc: t('settings.spotsDesc')
});

/** Text for each game's help. */
export const SPOTS_HELP = t('settings.spotsHelp');

/**
 * SVG markup of the dots (in each game's board units).
 * @param {{x:number,y:number}[]} points  centre of each place
 * @param {number} chosen  index of the place being looked at (-1 = none)
 * @param {number} r  dot radius
 */
export const spotsMarkup = (points, chosen, r) => points.map(({ x, y }, i) =>
  `<circle class="fit-spot${i === chosen ? ' is-on' : ''}" data-spot="${i}" cx="${x.toFixed(4)}" cy="${y.toFixed(4)}" r="${(i === chosen ? r * 1.5 : r).toFixed(4)}"/>`).join('');

/**
 * What each game remembers: the current places and the one being looked at.
 * `samePose(a, b)` compares two of the game's poses.
 */
export class FitSpots {
  constructor(samePose){ this.samePose = samePose; this.list = []; this.chosen = null; }
  /** Saves the computed places; if the one being looked at is gone, it is forgotten. */
  update(list){
    this.list = list;
    if (this.chosen && !list.some(p => this.samePose(p, this.chosen))) this.chosen = null;
    return list;
  }
  get chosenIndex(){ return this.chosen ? this.list.findIndex(p => this.samePose(p, this.chosen)) : -1; }
  clear(){ this.chosen = null; }
  /** Tap on dot i: returns the pose to place (second tap) or null (first tap). */
  tap(i){
    const pose = this.list[i];
    if (!pose) return null;
    if (this.chosen && this.samePose(this.chosen, pose)){ this.chosen = null; return pose; }
    this.chosen = pose;
    return null;
  }
}
