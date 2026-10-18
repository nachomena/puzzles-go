// Generates the Pentominoes challenges (rows of pieces that keep adding up: challenge n uses the first n)
// and saves them in js/games/pentominoes/engine/sets-data.js. Usage: node scripts/build-pentomino-sets.mjs
// (about 20 seconds; the same seed always gives the same result).
// A row's difficulty is the mean of log2(solutions) of its challenges: fewer solutions, harder.
import { writeFileSync } from 'node:fs';
import { countSolutions } from '../js/games/pentominoes/engine/solver.js';
import { PIECES } from '../js/games/pentominoes/engine/pieces.js';

const piecesOf = mask => [...Array(12).keys()].filter(p => mask >> p & 1);
const bits = mask => piecesOf(mask).length;

console.log('Counting the solutions of each group of pieces…');
const COUNT = new Map();
for (let mask = 1; mask < 4096; mask++){
  const k = bits(mask);
  if (k < 3 || k > 11) continue;
  const c = countSolutions(piecesOf(mask));
  if (c) COUNT.set(mask, c);
}

// Seeded pseudo-random generator (mulberry32)
let seed = 20261008;
const rand = () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const pick = a => a[(rand() * a.length) | 0];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = (rand() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

const tileable = k => [...COUNT.keys()].filter(m => bits(m) === k);
const score = (seq, from) => {
  let s = 0, mask = 0, k = 0;
  seq.forEach((p, i) => { mask |= 1 << p; if (i + 1 >= from){ s += Math.log2(COUNT.get(mask) / 4); k++; } });
  return s / k;
};

/** Random rows from `from` to `to` pieces (the first `from` sorted). */
function sampleRows(from, to, tries = 60000){
  const starts = tileable(from), out = new Map();
  for (let t = 0; t < tries; t++){
    let mask = pick(starts);
    const seq = piecesOf(mask);
    let ok = true;
    for (let k = from; k < to && ok; k++){
      const next = [...Array(12).keys()].filter(p => !(mask >> p & 1) && COUNT.has(mask | 1 << p));
      if (!next.length){ ok = false; break; }
      const p = pick(next);
      seq.push(p); mask |= 1 << p;
    }
    if (ok) out.set(seq.join(','), seq);
  }
  return [...out.values()].map(seq => ({ seq, score: score(seq, from) })).sort((a, b) => a.score - b.score);
}

const used = new Set();
/**
 * `rows` rows with a difficulty between percentiles `lo` and `hi` (0 = the hardest), without repeating
 * rows from other series and without overusing the same starting group.
 */
function chooseRows(from, to, rows, lo, hi){
  const all = sampleRows(from, to);
  const band = shuffle(all.slice(Math.floor(all.length * lo), Math.ceil(all.length * hi)));
  const starts = new Map(), maxStart = Math.ceil(rows / Math.min(rows, tileable(from).length));
  const picked = [];
  for (const r of band){
    if (picked.length === rows) break;
    const key = r.seq.join(','), start = r.seq.slice(0, from).join(',');
    if (used.has(key) || (starts.get(start) || 0) >= maxStart) continue;
    // nor two rows that end with the same group of pieces
    const end = [...r.seq].sort((a, b) => a - b).join(',');
    if (picked.some(p => [...p.seq].sort((a, b) => a - b).join(',') === end)) continue;
    used.add(key); starts.set(start, (starts.get(start) || 0) + 1);
    picked.push(r);
  }
  if (picked.length < rows) throw new Error(`Only ${picked.length}/${rows} rows for ${from}→${to}`);
  // from easiest to hardest within the block
  return picked.sort((a, b) => b.score - a.score).map(r => r.seq);
}

/** Groups of 9 pieces with a single solution (the "9 pieces" block of the expert series). */
function chooseSingles(k, rows){
  const hardest = shuffle(tileable(k).filter(m => COUNT.get(m) === 4));
  if (hardest.length < rows) throw new Error('Not enough single-solution groups');
  // the cell's piece (the last one) at random; the starting ones, sorted
  return hardest.slice(0, rows).map(m => {
    const ps = piecesOf(m), last = ps.splice((rand() * ps.length) | 0, 1)[0];
    return [...ps, last];
  });
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const labels = (start, n) => [...Array(n)].map((_, i) => LETTERS[start + i]);
const block = (from, to, seqs, names) => ({ from, to, rows: seqs.map((s, i) => [names[i], s.map(p => PIECES[p].name).join('')]) });

const SETS = {
  small: [block(3, 8, chooseRows(3, 8, 7, .55, 1), labels(0, 7))],
  slam: [
    block(5, 9, chooseRows(5, 9, 14, .35, .75), labels(0, 14)),
    block(6, 8, chooseRows(6, 8, 16, .25, .6), [...labels(14, 12), '♠', '♥', '♦', '♣'])
  ],
  grand: [block(4, 11, chooseRows(4, 11, 12, .25, .7), labels(0, 12))],
  super: [
    block(5, 11, chooseRows(5, 11, 12, .05, .35), labels(0, 12)),
    block(9, 9, chooseSingles(9, 12), labels(12, 12))
  ],
  challenge: [block(7, 10, chooseRows(7, 10, 40, 0, .15), [...Array(40)].map((_, i) => String(i + 1)))]
};

// Check: every challenge has a solution
const BY_NAME = Object.fromEntries(PIECES.map((p, i) => [p.name, i]));
let total = 0;
for (const [id, blocks] of Object.entries(SETS)){
  let n = 0;
  for (const b of blocks) for (const [, s] of b.rows) for (let k = b.from; k <= b.to; k++){
    const mask = [...s.slice(0, k)].reduce((m, c) => m | 1 << BY_NAME[c], 0);
    if (!COUNT.has(mask) && k < 12) throw new Error(`${id} ${s} puzzle ${k} has no solution`);
    n++;
  }
  console.log(id, n, 'puzzles');
  total += n;
}

const rowsJs = rows => rows.map(([l, s]) => `['${l}', '${s}']`).join(', ');
writeFileSync(new URL('../js/games/pentominoes/engine/sets-data.js', import.meta.url),
`/* Generated by scripts/build-pentomino-sets.mjs — do not edit by hand. ${total} puzzles.
   Per set, blocks of rows: puzzle n of a row uses its first n pieces (letters of PIECES) and each row is
   played from puzzle \`from\` to \`to\`. */
export const SETS = {
${Object.entries(SETS).map(([id, blocks]) => `  ${id}: [\n${blocks.map(b => `    { from: ${b.from}, to: ${b.to}, rows: [${rowsJs(b.rows)}] }`).join(',\n')}\n  ]`).join(',\n')}
};
`);
console.log('Total', total);
