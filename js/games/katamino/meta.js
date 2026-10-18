/* Datos mínimos de Pentominós para el selector y el menú: se cargan sin el motor ni la interfaz.
   Los 512 retos vienen en cinco series (engine/sets-data.js); los niveles Fácil, Difícil y Experto juntan
   una o dos series cada uno. Las estadísticas y la partida guardan la serie (su id de siempre: `small`,
   `slam`…), así que el progreso de antes se conserva. */
import { t, lang } from '../../i18n/index.js';
import { LEVEL_ORDER } from '../../core/levels.js';

/** Series de cada nivel, en orden, con cuántos retos tiene cada una. */
const SERIES = Object.freeze({ small: 42, slam: 118, grand: 96, super: 96, challenge: 160 });
const PARTS = Object.freeze({ easy: ['small', 'slam'], hard: ['grand', 'super'], expert: ['challenge'] });

const level = (L, target) => Object.freeze({
  name: t(`levels.${L}`), target, parts: Object.freeze(PARTS[L]), total: PARTS[L].reduce((n, p) => n + SERIES[p], 0)
});
const LEVELS = Object.freeze({ easy: level('easy', 1), hard: level('hard', 2), expert: level('expert', 3) });

/** Nivel de una serie: 'grand' → 'hard'. */
export const levelOf = part => LEVEL_ORDER.find(L => PARTS[L].includes(part));

/** Serie de una partida guardada (las de antes del cambio a tres niveles la guardaban en `L`). */
export const partOf = cur => cur.p?.part ?? (SERIES[cur.L] ? cur.L : null);

/** Clave de estadísticas de un reto: serie, fila y tamaño (p. ej. "grand:B:7"). */
export const pentaKey = (part, label, n) => `${part}:${label}:${n}`;

/** Retos resueltos de un nivel (de todas sus series). */
export const solvedIn = (L, stats) =>
  Object.keys(stats).filter(k => LEVELS[L].parts.includes(k.split(':')[0]) && stats[k].solved > 0).length;

/**
 * Nombre de una fila: con el número de serie delante si el nivel tiene dos ("2B"), y "N° 12" si va
 * numerada (las del Experto).
 */
export function rowName(part, label){
  if (/^\d+$/.test(label)) return t('games.katamino.row', { n: label });
  const parts = LEVELS[levelOf(part)].parts;
  return parts.length > 1 ? `${parts.indexOf(part) + 1}${label}` : label;
}

/** "7 piezas": el tamaño de un reto (lo que el juego original llama PENTA). */
export const piecesName = n => t('games.katamino.pieces', { n });

/** "Difícil 2B" (nivel y fila) de una partida. */
const where = cur => { const part = partOf(cur); return `${LEVELS[levelOf(part)].name} ${rowName(part, cur.p.label)}`; };

export default Object.freeze({
  id: 'katamino',
  name: t('games.katamino.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.katamino.tagline'),
  icon: 'katamino',
  storageKey: 'puzzlesgo.katamino.v1',
  /** Dentro de cada nivel se elige serie, fila y reto (picker.js). `target` solo numera los niveles. */
  levels: LEVELS,
  levelOrder: LEVEL_ORDER,
  /** Partida guardada con la serie como nivel (antes de los tres niveles): se pasa a su nivel. */
  upgradeSession: cur => SERIES[cur.L] && cur.p ? { ...cur, L: levelOf(cur.L), p: { ...cur.p, part: cur.L } } : cur,
  /** Bajo cada nivel: cuántos retos llevas resueltos. */
  levelMeta: (L, stats) => t('games.katamino.solvedOf', { a: solvedIn(L, stats), n: LEVELS[L].total }),
  /** Partida a medias, en la confirmación de empezar otra. */
  sessionLabel: cur => `${where(cur)} · ${piecesName(cur.p.n)}`,
  /** Lo mismo, corto, para el botón de continuar (fila y número de piezas). */
  resumeLabel: cur => `${where(cur)} · ${cur.p.n}`,
  /** Progreso: cada reto se juega una vez, así que se comparan los del mismo tamaño (de todos los niveles). */
  progressRow: key => { const n = Number(key.split(':')[2]); return n ? { key: `n${n}`, name: piecesName(n), order: n } : null; },
  /** Y en el detalle, ese tamaño en cada nivel y fila donde se ha resuelto, con su récord. */
  progressBreakdown: (rowKey, stats) => {
    const n = rowKey.slice(1), order = Object.keys(SERIES);
    const items = Object.entries(stats)
      .map(([k, s]) => ({ k: k.split(':'), s }))
      .filter(({ k, s }) => k.length === 3 && k[2] === n && SERIES[k[0]] && s.solved)
      .sort((a, b) => order.indexOf(a.k[0]) - order.indexOf(b.k[0]) || a.k[1].localeCompare(b.k[1], lang, { numeric: true }))
      .map(({ k, s }) => ({ name: `${LEVELS[levelOf(k[0])].name} ${rowName(k[0], k[1])}`, best: s.best }));
    return { title: t('games.katamino.breakdown', { n }), items };
  }
});
