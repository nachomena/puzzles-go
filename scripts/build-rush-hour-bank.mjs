// Genera retos difíciles de Rush Hour (niveles 4 y 5, que en el momento tardarían varios segundos) y
// los guarda en js/games/rush-hour/engine/bank-data.js. Uso:
//   node scripts/build-rush-hour-bank.mjs <nivel> <cuántos> <archivo de salida .json>   (genera)
//   node scripts/build-rush-hour-bank.mjs --join a.json b.json ...                       (une y escribe)
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { generateLive } from '../js/games/rush-hour/engine/generator.js';
import { solve } from '../js/games/rush-hour/engine/board.js';
import { runToEnd } from '../js/lib/iter.js';

/** Un reto en texto: por vehículo "<largo><h|v><línea><posición>", p. ej. "2h20" = el rojo. */
const encode = p => p.cars.map((c, i) => `${c.len}${c.dir}${c.line}${p.pos[i]}`).join('');

if (process.argv[2] === '--join'){
  const all = { 4: new Set(), 5: new Set() };
  for (const f of process.argv.slice(3)) for (const [L, list] of Object.entries(JSON.parse(readFileSync(f, 'utf8')))) list.forEach(s => all[L].add(s));
  writeFileSync(new URL('../js/games/rush-hour/engine/bank-data.js', import.meta.url),
`/* Generado por scripts/build-rush-hour-bank.mjs — no editar a mano.
   Retos difíciles ya calculados (en el momento tardarían varios segundos). Cada reto es una cadena
   con 4 caracteres por vehículo: largo, dirección (h/v), línea y posición; el primero es el rojo. */
export const BANK = {
${Object.entries(all).map(([L, set]) => `  ${L}: [\n${[...set].map(s => `    '${s}'`).join(',\n')}\n  ]`).join(',\n')}
};
`);
  console.log(Object.fromEntries(Object.entries(all).map(([L, s]) => [L, s.size])));
} else {
  const [L, count, out] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
  const data = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {};
  data[L] ||= [];
  while (data[L].length < count){
    const p = runToEnd(generateLive(L));
    if (!p) continue;
    const s = solve(p.cars, p.pos);
    if (!s || s.length !== p.min) throw new Error('reto sin verificar');
    data[L].push(encode(p));
    writeFileSync(out, JSON.stringify(data));
    if (data[L].length % 10 === 0) console.log(L, data[L].length);
  }
}
