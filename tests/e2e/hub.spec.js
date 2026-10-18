// Selector de juegos y pantallas de Progreso.
import { test, expect } from '@playwright/test';
import { openApp, startGame } from './helpers.js';

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

test('cada juego del selector lleva su frase', async ({ page }) => {
  await openApp(page);
  const first = page.locator('#games .game-row').first();
  await expect(first.locator('.game-row__name')).toHaveText('Star Battle');
  await expect(first.locator('.game-row__info')).not.toBeEmpty();
});

test('Progreso se abre desde el selector y vuelve con su botón', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('.hub-progress[data-action="open-progress"]').click();
  await expect(page.locator('#progress')).toHaveClass(/is-on/);
  await page.locator('#progress [data-action="back"]').click();
  await expect(page.locator('#hub')).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});

test('al abrir la app no se carga el CSS de ningún juego', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('link[href^="css/games/"]')).toHaveCount(0);
});

test('la tarjeta Continuar lleva a la última partida a medias', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.locator('#hub .resume-card')).toHaveCount(0);
  const play = await startGame(page, 'akari');
  await play.locator('.cell:not(.ak-black)').first().click();
  await play.locator('.back-pill').click();
  await page.locator('#levels .back-pill').click();
  await expect(page.locator('#hub .resume-card')).toContainText('Luces');
  await page.locator('#hub .resume-card').click();
  await expect(page.locator('#play-akari')).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});

test('el modo noche se enciende desde los ajustes del selector y se queda al volver a abrir', async ({ page }) => {
  await openApp(page);
  await page.locator('[data-action="open-app-settings"]').click();
  const toggle = page.locator('#app-settings [data-night-toggle]');
  await toggle.check();
  await expect(page.locator('html')).toHaveClass(/is-night/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/is-night/);
  await expect(page.locator('[data-night-toggle]').first()).toBeChecked();
  await page.locator('[data-action="open-app-settings"]').click();
  await toggle.uncheck();
  await expect(page.locator('html')).not.toHaveClass(/is-night/);
});

test('el idioma sigue al del móvil y se puede cambiar en los ajustes', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#hub .menu__label')).toHaveText('Elige un juego');
  await page.locator('[data-action="open-app-settings"]').click();
  await page.locator('[data-lang-select]').selectOption('en');
  await expect(page.locator('#hub .menu__label')).toHaveText('Choose a game');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#games')).toContainText('Bridges');
  await page.locator('[data-action="open-app-settings"]').click();
  await page.locator('[data-lang-select]').selectOption('auto');
  await expect(page.locator('#hub .menu__label')).toHaveText('Elige un juego');
});
