// Selector de juegos y pantallas de Progreso.
import { test, expect } from '@playwright/test';
import { openApp } from './helpers.js';

test('el título queda fijo y solo se desplaza la lista', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('#games [data-action="toggle-group"]').first().click();   // más juegos que pantalla
  const top = async () => (await page.locator('#title').boundingBox()).y;
  const before = await top();
  await page.locator('.hub-list').evaluate(el => { el.scrollTop = 400; });
  expect(await page.locator('.hub-list').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  expect(await top()).toBe(before);
  expect(errors).toEqual([]);
});

test('los iconos de los juegos se alinean con el botón de Progreso', async ({ page }) => {
  await openApp(page);
  const centre = async loc => { const b = await loc.boundingBox(); return Math.round(b.x + b.width / 2); };
  const progress = await centre(page.locator('.hub-progress svg'));
  for (const icon of await page.locator('.game-card__icon svg').all()) expect(await centre(icon)).toBe(progress);
});

test('Progreso se abre desde el selector y vuelve con su botón', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('.hub-progress').click();
  await expect(page.locator('#progress')).toHaveClass(/is-on/);
  await page.locator('#progress [data-action="back"]').click();
  await expect(page.locator('#hub')).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});

test('al abrir la app no se carga el CSS de ningún juego', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('link[href^="css/games/"]')).toHaveCount(0);
});
