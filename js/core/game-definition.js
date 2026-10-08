/* Contrato que cumple cada juego para enchufarse a la app. Documentado en js/games/README.md.

   @typedef {object} GameDefinition
   @property {string} id            identificador corto (se usa en ids del DOM)
   @property {string} name          nombre visible
   @property {string} icon          símbolo del sprite (#i-<icon>)
   @property {string} storageKey    clave de localStorage
   @property {Object<string,{name:string,target:number}>} levels
   @property {string[]} levelOrder
   @property {string[]} tools       herramientas; la primera es la de por defecto
   @property {object} defaultSettings
   @property {{key:string,title:string,desc:string,options?:{value:string,label:string}[]}[]} settings
                                    ajustes: interruptores, o desplegables si traen `options`
   @property {boolean} [hint]       false = sin botón de pista (por defecto lo hay)
   @property {{key:string,name:string}[]} [statsRows]  filas de estadísticas (por defecto, los niveles)
   @property {(session:object) => string} [statsKey]   fila en la que se apunta una victoria (por defecto, su nivel)
   @property {(session:object) => string} [statsName]  nombre de esa fila en la pantalla de victoria
   @property {string} [menuLabel]   título sobre la lista de niveles (por defecto, "Nueva partida")
   @property {(L:string, stats:object) => string} [levelMeta]  texto bajo cada nivel del menú (por defecto, el récord)
   @property {(session:object) => string} [sessionLabel]       nombre de la partida a medias (por defecto, el nivel)
   @property {(session:object) => string} [resumeLabel]        versión corta para el botón "Continuar"
   @property {{ render:(L:string, data:{stats:object,cur:object|null}) => string,
                puzzle:(L:string, dataset:DOMStringMap) => object|null,
                same:(session:object, puzzle:object) => boolean }} [picker]
                                    al elegir un nivel se abre una tabla de tableros (sus botones llevan
                                    data-action="pick-puzzle") en vez de empezar una partida
   @property {URL} workerUrl        worker que llama a serveGenerator(generate)
   @property {(target:number) => Generator} generate   generador del motor
   @property {(p:object, L:string) => boolean} isValidPuzzle
   @property {(s:object) => object|null} restoreSession   valida/actualiza una partida guardada
   @property {(p:object) => string} sizeLabel
   @property {string} controls      marcado bajo el tablero
   @property {string} help          marcado de la ayuda
   @property {typeof import('./game-controller.js').GameController} Controller */

const REQUIRED = ['id', 'name', 'icon', 'storageKey', 'levels', 'levelOrder', 'tools', 'defaultSettings',
  'settings', 'workerUrl', 'generate', 'isValidPuzzle', 'restoreSession', 'sizeLabel', 'controls', 'help', 'Controller'];

/** Valida la definición y la congela. Falla pronto si falta algo. */
export function defineGame(def){
  const missing = REQUIRED.filter(k => def[k] === undefined);
  if (missing.length) throw new Error(`Juego "${def.id}": faltan ${missing.join(', ')}`);
  const badLevel = def.levelOrder.find(L => !def.levels[L]);
  if (badLevel) throw new Error(`Juego "${def.id}": nivel desconocido ${badLevel}`);
  return Object.freeze(def);
}
