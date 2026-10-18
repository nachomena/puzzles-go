// The installed app works offline: the service worker stores all its files.
// The test starts its own server and really shuts it down: in Chromium, setOffline and route don't
// reach what the service worker itself requests, and an uncached file would go unnoticed.
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

test('offline it opens and starts a game with no missing file', async ({ page }) => {
  const server = await serve();
  const url = `http://localhost:${server.address().port}/`;
  await openApp(page, url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });

  const failed = [];
  page.on('requestfailed', r => failed.push(r.url()));
  await page.reload();
  await expect(page.locator('#games .game-row').first()).toBeVisible();
  const play = await startGame(page, 'bridges');
  await expect(play.locator('.br-island').first()).toBeVisible();
  expect(failed).toEqual([]);
});
