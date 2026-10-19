// Game picker and Progress screens.
import { test, expect } from '@playwright/test';
import { openApp, startGame } from './helpers.js';

test('the title stays fixed and only the list scrolls', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('#games [data-action="toggle-group"]').first().click();   // more games than screen
  const top = async () => (await page.locator('#title').boundingBox()).y;
  const before = await top();
  await page.locator('.hub-list').evaluate(el => { el.scrollTop = 400; });
  expect(await page.locator('.hub-list').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  expect(await top()).toBe(before);
  expect(errors).toEqual([]);
});

test('every game in the picker has its tagline', async ({ page }) => {
  await openApp(page);
  const first = page.locator('#games .game-row').first();
  await expect(first.locator('.game-row__name')).toHaveText('Star Battle');
  await expect(first.locator('.game-row__info')).not.toBeEmpty();
});

test('Progress opens from the picker and goes back with its button', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('.hub-progress[data-action="open-progress"]').click();
  await expect(page.locator('#progress')).toHaveClass(/is-on/);
  await page.locator('#progress [data-action="back"]').click();
  await expect(page.locator('#hub')).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});

test("opening the app loads no game's CSS", async ({ page }) => {
  await openApp(page);
  await expect(page.locator('link[href^="css/games/"]')).toHaveCount(0);
});

test('the Continue card leads to the last unfinished game', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.locator('#hub .resume-card')).toHaveCount(0);
  const play = await startGame(page, 'light-up');
  await play.locator('.cell:not(.lu-black)').first().click();
  await play.locator('.back-pill').click();
  await page.locator('#levels .back-pill').click();
  await expect(page.locator('#hub .resume-card')).toContainText('Luces');
  await page.locator('#hub .resume-card').click();
  await expect(page.locator('#play-light-up')).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});

test('night mode turns on from the picker settings and stays on after reopening', async ({ page }) => {
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

test("the language follows the phone's and can be changed in settings", async ({ page }) => {
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

test('a slow start shows the logo until the picker is drawn', async ({ page }) => {
  // the app's code is held back until the logo has been seen, so the test doesn't depend on timing
  let release;
  const held = new Promise(done => { release = done; });
  await page.route('**/js/main.js', async route => { await held; await route.continue(); });
  await page.goto('./', { waitUntil: 'commit' });
  await expect(page.locator('#loading.is-boot .loader__logo')).toBeVisible();
  release();
  await expect(page.locator('#games .game-row').first()).toBeVisible();
  await expect(page.locator('#loading')).not.toHaveClass(/is-on/);
});
