/* Datos mínimos de Pentominós para el selector y el menú: se cargan sin el motor ni la interfaz. */
import { t, lang } from '../../i18n/index.js';

const level = (L, target, total) => Object.freeze({ name: t(`games.katamino.levels.${L}`), target, total });
const LEVELS = Object.freeze({
  small:     level('small', 1, 42),
  slam:      level('slam', 2, 118),
  grand:     level('grand', 3, 96),
  super:     level('super', 4, 96),
  challenge: level('challenge', 5, 160)
});

/** Clave de estadísticas de un reto: desafío, fila y tamaño (p. ej. "grand:B:7"). Los ids son los de siempre. */
export const pentaKey = (L, label, n) => `${L}:${label}:${n}`;

/** Retos resueltos de un desafío. */
export const solvedIn = (L, stats) =>
  Object.keys(stats).filter(k => k.startsWith(L + ':') && stats[k].solved > 0).length;

/** "B" o "N° 12" (las filas del Desafío van numeradas). */
export const rowName = label => /^\d+$/.test(label) ? t('games.katamino.row', { n: label }) : label;

/** "7 piezas": el tamaño de un reto (lo que el juego original llama PENTA). */
export const piecesName = n => t('games.katamino.pieces', { n });

export default Object.freeze({
  id: 'katamino',
  name: t('games.katamino.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.katamino.tagline'),
  icon: 'katamino',
  storageKey: 'puzzlesgo.katamino.v1',
  /** Cada nivel es un desafío; dentro se elige fila y reto (picker.js). `target` solo numera los niveles. */
  levels: LEVELS,
  levelOrder: Object.freeze(['small', 'slam', 'grand', 'super', 'challenge']),
  menuLabel: t('games.katamino.menuLabel'),
  /** Bajo cada desafío: cuántos retos llevas resueltos. */
  levelMeta: (L, stats) => t('games.katamino.solvedOf', { a: solvedIn(L, stats), n: LEVELS[L].total }),
  /** Partida a medias, en la confirmación de empezar otra. */
  sessionLabel: cur => `${LEVELS[cur.L].name} ${rowName(cur.p.label)} · ${piecesName(cur.p.n)}`,
  /** Lo mismo, corto, para el botón de continuar (fila y número de piezas). */
  resumeLabel: cur => `${LEVELS[cur.L].name} ${rowName(cur.p.label)} · ${cur.p.n}`,
  /** Progreso: cada reto se juega una vez, así que se comparan los del mismo tamaño (de todos los desafíos). */
  progressRow: key => { const n = Number(key.split(':')[2]); return n ? { key: `n${n}`, name: piecesName(n), order: n } : null; },
  /** Y en el detalle, ese tamaño en cada desafío y fila donde se ha resuelto, con su récord. */
  progressBreakdown: (rowKey, stats) => {
    const n = rowKey.slice(1), order = Object.keys(LEVELS);
    const items = Object.entries(stats)
      .map(([k, s]) => ({ k: k.split(':'), s }))
      .filter(({ k, s }) => k.length === 3 && k[2] === n && LEVELS[k[0]] && s.solved)
      .sort((a, b) => order.indexOf(a.k[0]) - order.indexOf(b.k[0]) || a.k[1].localeCompare(b.k[1], lang, { numeric: true }))
      .map(({ k, s }) => ({ name: `${LEVELS[k[0]].name} ${rowName(k[1])}`, best: s.best }));
    return { title: t('games.katamino.breakdown', { n }), items };
  }
});
