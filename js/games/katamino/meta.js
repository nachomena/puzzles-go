/* Datos mínimos de Katamino para el selector y el menú: se cargan sin el motor ni la interfaz. */
const LEVELS = Object.freeze({
  small:     Object.freeze({ name: 'Pequeño Slam', target: 1, total: 42 }),
  slam:      Object.freeze({ name: 'Slam',         target: 2, total: 118 }),
  grand:     Object.freeze({ name: 'Gran Slam',    target: 3, total: 96 }),
  super:     Object.freeze({ name: 'Súper Slam',   target: 4, total: 96 }),
  challenge: Object.freeze({ name: 'Desafío',      target: 5, total: 160 })
});

/** Clave de estadísticas de un PENTA: desafío, fila y tamaño (p. ej. "grand:B:7"). */
export const pentaKey = (L, label, n) => `${L}:${label}:${n}`;

/** PENTAS resueltos de un desafío. */
export const solvedIn = (L, stats) =>
  Object.keys(stats).filter(k => k.startsWith(L + ':') && stats[k].solved > 0).length;

/** "B" o "N°12" (las filas del Desafío van numeradas). */
export const rowName = label => /^\d+$/.test(label) ? `N°${label}` : label;

export default Object.freeze({
  id: 'katamino',
  name: 'Katamino',
  icon: 'katamino',
  storageKey: 'puzzlesgo.katamino.v1',
  /** Cada nivel es un desafío; dentro se elige fila y PENTA (picker.js). `target` solo numera los niveles. */
  levels: LEVELS,
  levelOrder: Object.freeze(['small', 'slam', 'grand', 'super', 'challenge']),
  menuLabel: 'Desafíos',
  /** Bajo cada desafío: cuántos PENTAS llevas resueltos. */
  levelMeta: (L, stats) => `${solvedIn(L, stats)} de ${LEVELS[L].total} resueltos`,
  /** Partida a medias, en la confirmación de empezar otra. */
  sessionLabel: cur => `${LEVELS[cur.L].name} ${rowName(cur.p.label)} · PENTA ${cur.p.n}`,
  /** Lo mismo, corto, para el botón de continuar (fila y número del PENTA). */
  resumeLabel: cur => `${LEVELS[cur.L].name} ${rowName(cur.p.label)} · ${cur.p.n}`,
  /** Progreso: cada PENTA se juega una vez, así que se comparan los del mismo tamaño (de todos los desafíos). */
  progressRow: key => { const n = Number(key.split(':')[2]); return n ? { key: `n${n}`, name: `PENTA ${n}`, order: n } : null; },
  /** Y en el detalle, ese PENTA en cada desafío y fila donde se ha resuelto, con su récord. */
  progressBreakdown: (rowKey, stats) => {
    const n = rowKey.slice(1), order = Object.keys(LEVELS);
    const items = Object.entries(stats)
      .map(([k, s]) => ({ k: k.split(':'), s }))
      .filter(({ k, s }) => k.length === 3 && k[2] === n && LEVELS[k[0]] && s.solved)
      .sort((a, b) => order.indexOf(a.k[0]) - order.indexOf(b.k[0]) || a.k[1].localeCompare(b.k[1], 'es', { numeric: true }))
      .map(({ k, s }) => ({ name: `${LEVELS[k[0]].name} ${rowName(k[1])}`, best: s.best }));
    return { title: `PENTA ${n} en cada desafío`, items };
  }
});
