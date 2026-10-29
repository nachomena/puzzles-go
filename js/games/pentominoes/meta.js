/* Minimal Pentominoes data for the picker and the menu: loaded without the engine or the interface.
   The 512 puzzles come in five sets (engine/sets-data.js); the Easy, Hard and Expert levels group one or
   two sets each. Statistics and the saved game store the set (its usual id: `small`, `slam`…), so earlier
   progress is kept. */
import { t, lang } from '../../i18n/index.js';
import { LEVEL_ORDER } from '../../core/levels.js';

/** Sets of each level, in order, with how many puzzles each one has. */
const SERIES = Object.freeze({ small: 42, slam: 118, grand: 96, super: 96, challenge: 160 });
const PARTS = Object.freeze({ easy: ['small', 'slam'], hard: ['grand', 'super'], expert: ['challenge'] });

const level = (L, target) => Object.freeze({
  name: t(`levels.${L}`), target, parts: Object.freeze(PARTS[L]), total: PARTS[L].reduce((n, p) => n + SERIES[p], 0)
});
const LEVELS = Object.freeze({ easy: level('easy', 1), hard: level('hard', 2), expert: level('expert', 3) });

/** Level of a set: 'grand' → 'hard'. */
export const levelOf = part => LEVEL_ORDER.find(L => PARTS[L].includes(part));

/** Set of a saved game (those from before the change to three levels stored it in `L`). */
export const partOf = cur => cur.p?.part ?? (SERIES[cur.L] ? cur.L : null);

/** Row labels as shown: the last four rows of a set keep their old ids (so their progress is kept). */
const SHOWN = Object.freeze({ '♠': 'AA', '♥': 'AB', '♦': 'AC', '♣': 'AD' });
export const shownLabel = label => SHOWN[label] ?? label;

/** Statistics key of a puzzle: set, row and size (e.g. "grand:B:7"). */
export const challengeKey = (part, label, n) => `${part}:${label}:${n}`;

/** Puzzles solved in a level (across all its sets). */
export const solvedIn = (L, stats) =>
  Object.keys(stats).filter(k => LEVELS[L].parts.includes(k.split(':')[0]) && stats[k].solved > 0).length;

/**
 * Name of a row: with the set number in front if the level has two ("2B"), and "No. 12" if it is
 * numbered (the Expert ones).
 */
export function rowName(part, label){
  if (/^\d+$/.test(label)) return t('games.pentominoes.row', { n: label });
  const parts = LEVELS[levelOf(part)].parts;
  return parts.length > 1 ? `${parts.indexOf(part) + 1}${shownLabel(label)}` : shownLabel(label);
}

/** "7 pieces": the size of a puzzle. */
export const piecesName = n => t('games.pentominoes.pieces', { n });

/** "Hard 2B" (level and row) of a game. */
const where = cur => { const part = partOf(cur); return `${LEVELS[levelOf(part)].name} ${rowName(part, cur.p.label)}`; };

export default Object.freeze({
  id: 'pentominoes',
  name: t('games.pentominoes.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.pentominoes.tagline'),
  icon: 'pentominoes',
  storageKey: 'puzzlesgo.katamino.v1',
  /** Inside each level the set, row and puzzle are chosen (picker.js). `target` only numbers the levels. */
  levels: LEVELS,
  levelOrder: LEVEL_ORDER,
  /** Saved game with the set as its level (before the three levels): it is moved to its level. */
  upgradeSession: cur => SERIES[cur.L] && cur.p ? { ...cur, L: levelOf(cur.L), p: { ...cur.p, part: cur.L } } : cur,
  /** Under each level: how many puzzles you have solved. */
  levelMeta: (L, stats) => t('games.pentominoes.solvedOf', { a: solvedIn(L, stats), n: LEVELS[L].total }),
  /** Unfinished game, in the confirmation to start another one. */
  sessionLabel: cur => `${where(cur)} · ${piecesName(cur.p.n)}`,
  /** The same, short, for the continue button (row and number of pieces). */
  resumeLabel: cur => `${where(cur)} · ${cur.p.n}`,
  /** Progress: each puzzle is played once, so the ones of the same size are compared (across all levels). */
  progressRow: key => { const n = Number(key.split(':')[2]); return n ? { key: `n${n}`, name: piecesName(n), order: n } : null; },
  /** And in the detail, that size in each level and row where it has been solved, with its record. */
  progressBreakdown: (rowKey, stats) => {
    const n = rowKey.slice(1), order = Object.keys(SERIES);
    const items = Object.entries(stats)
      .map(([k, s]) => ({ k: k.split(':'), s }))
      .filter(({ k, s }) => k.length === 3 && k[2] === n && SERIES[k[0]] && s.solved)
      .sort((a, b) => order.indexOf(a.k[0]) - order.indexOf(b.k[0]) || a.k[1].localeCompare(b.k[1], lang, { numeric: true }))
      .map(({ k, s }) => ({ name: `${LEVELS[levelOf(k[0])].name} ${rowName(k[0], k[1])}`, best: s.best }));
    return { title: t('games.pentominoes.breakdown', { n }), items };
  }
});
