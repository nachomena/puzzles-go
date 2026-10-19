/* Contract each game fulfils to plug into the app. Documented in js/games/README.md.

   @typedef {object} GameDefinition
   @property {string} id            short identifier (used in DOM ids)
   @property {string} name          visible name
   @property {string} icon          sprite symbol (#i-<icon>)
   @property {string} storageKey    localStorage key
   @property {Object<string,{name:string,target:number}>} levels
   @property {string[]} levelOrder
   @property {string[]} tools       tools; the first one is the default
   @property {object} defaultSettings
   @property {{key:string,title:string,desc:string,options?:{value:string,label:string}[]}[]} settings
                                    settings: switches, or selects if they have `options`
   @property {boolean} [hint]       false = no hint button (there is one by default)
   @property {boolean} [confirmReset]  false = restart without asking (piece games: clearing them all is common)
   @property {{key:string,name:string}[]} [statsRows]  statistics rows (the levels by default)
   @property {(session:object) => string} [statsKey]   row where a win is recorded (its level by default)
   @property {(session:object) => string} [statsName]  name of that row on the win screen
   @property {string} [menuLabel]   title above the level list ("New game" by default)
   @property {(L:string, stats:object) => string} [levelMeta]  text under each level in the menu (the record by default)
   @property {(session:object) => string} [sessionLabel]       name of the unfinished game (its level by default)
   @property {(session:object) => string} [resumeLabel]        short version for the "Continue" button
   @property {(session:object) => object} [upgradeSession]     moves a saved game to the current levels before loading it
   @property {{ render:(L:string, data:{stats:object,cur:object|null}) => string,
                puzzle:(L:string, dataset:DOMStringMap) => object|null,
                same:(session:object, puzzle:object) => boolean }} [picker]
                                    choosing a level opens a table of boards (its buttons have
                                    data-action="pick-puzzle") instead of starting a game
   @property {URL} workerUrl        worker that calls serveGenerator(generate)
   @property {(target:number) => Generator} generate   the engine's generator
   @property {(p:object, L:string) => boolean} isValidPuzzle
   @property {(s:object) => object|null} restoreSession   validates/updates a saved game
   @property {(p:object) => string} sizeLabel
   @property {string} controls      markup under the board
   @property {string} help          help markup
   @property {typeof import('./game-controller.js').GameController} Controller */

const REQUIRED = ['id', 'name', 'icon', 'storageKey', 'levels', 'levelOrder', 'tools', 'defaultSettings',
  'settings', 'workerUrl', 'generate', 'isValidPuzzle', 'restoreSession', 'sizeLabel', 'controls', 'help', 'Controller'];

/** Validates the definition and freezes it. Fails early if anything is missing. */
export function defineGame(def){
  const missing = REQUIRED.filter(k => def[k] === undefined);
  if (missing.length) throw new Error(`Game "${def.id}": missing ${missing.join(', ')}`);
  const badLevel = def.levelOrder.find(L => !def.levels[L]);
  if (badLevel) throw new Error(`Game "${def.id}": unknown level ${badLevel}`);
  return Object.freeze(def);
}
