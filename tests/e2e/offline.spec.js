// La app instalada funciona sin conexión: el service worker guarda todos sus archivos.
// La prueba levanta su propio servidor y lo apaga de verdad: en Chromium, setOffline y route no
// alcanzan a lo que pide el propio service worker, y un archivo sin guardar pasaría inadvertido.
import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { openApp, startGame } from './helpers.js';

const ROOT = new URL('../..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

function serve(){
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    if (path.endsWith('/')) path += 'index.html';
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

test('sin conexión abre y empieza una partida sin que falte ningún archivo', async ({ page }) => {
  const server = await serve();
  const url = `http://localhost:${server.address().port}/`;
  await openApp(page, url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });

  const failed = [];
  page.on('requestfailed', r => failed.push(r.url()));
  await page.reload();
  await expect(page.locator('#games .game-row').first()).toBeVisible();
  const play = await startGame(page, 'hashi');
  await expect(play.locator('.hs-island').first()).toBeVisible();
  expect(failed).toEqual([]);
});
