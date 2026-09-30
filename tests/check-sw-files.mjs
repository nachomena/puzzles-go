// Comprueba que el service worker precachea todos los recursos de la app (para jugar sin conexión).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const assets = ['css', 'js', 'fonts', 'icons'].flatMap(d => walk(join(root, d))).map(p => './' + relative(root, p));
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const missing = assets.filter(a => !sw.includes(`'${a}'`));
if (missing.length){
  console.error('Faltan en FILES de sw.js:\n  ' + missing.join('\n  '));
  process.exit(1);
}
console.log(`sw.js precachea los ${assets.length} recursos.`);
