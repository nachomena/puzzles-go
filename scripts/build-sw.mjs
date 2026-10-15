// Escribe en sw.js la lista de archivos que se guardan para jugar sin conexión y una VERSION que
// es la huella de su contenido: cualquier cambio en un archivo da otra versión y el iPhone la descarga.
// Uso: node scripts/build-sw.mjs          actualiza sw.js (lo hace el gancho de pre-commit)
//      node scripts/build-sw.mjs --check  falla si sw.js no está al día (CI)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
const SW = join(root, 'sw.js');
const START = '// <generado por scripts/build-sw.mjs>', END = '// </generado>';

const walk = dir => readdirSync(dir).sort().flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const assets = ['index.html', 'manifest.webmanifest',
  ...['css', 'js', 'fonts', 'icons'].flatMap(d => walk(join(root, d))).filter(p => !p.endsWith('.md')).map(p => relative(root, p))];

const sw = readFileSync(SW, 'utf8');
const [head, rest] = sw.split(START), [, tail] = (rest ?? '').split(END);
if (tail === undefined) throw new Error(`sw.js necesita las marcas «${START}» y «${END}»`);

// la huella incluye también el resto de sw.js, para que un cambio en su lógica cuente como versión nueva
const hash = createHash('sha256').update(head + tail);
for (const a of assets) hash.update(a + '\0').update(readFileSync(join(root, a)));
const version = 'pzg-' + hash.digest('hex').slice(0, 10);

const lines = [];
for (const f of ['./', ...assets.map(a => './' + a)].map(f => `'${f}'`)){
  const last = lines.length - 1;
  if (last >= 0 && lines[last].length + f.length < 110) lines[last] += ', ' + f;
  else lines.push(f);
}
const block = `${START}\nconst VERSION = '${version}';\nconst FILES = [\n  ${lines.join(',\n  ')}\n];\n${END}`;
const next = head + block + tail;

if (process.argv.includes('--check')){
  if (next !== sw){
    console.error('sw.js no está al día: ejecuta  npm run build:sw');
    process.exit(1);
  }
  console.log(`sw.js al día (${version}, ${assets.length + 1} archivos).`);
} else if (next !== sw){
  writeFileSync(SW, next);
  console.log(`sw.js → ${version} (${assets.length + 1} archivos).`);
}
