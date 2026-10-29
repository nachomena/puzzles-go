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
  await expect(page.locator('#hub [data-action="resume-last"]')).toHaveCount(0);
  const play = await startGame(page, 'light-up');
  await play.locator('.cell:not(.lu-black)').first().click();
  await play.locator('.back-pill').click();
  await page.locator('#levels .back-pill').click();
  await expect(page.locator('#hub [data-action="resume-last"]')).toContainText('Luces');
  await page.locator('#hub [data-action="resume-last"]').click();
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

test('free version: Hard needs Pro; the simulated purchase unlocks it', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('#games [data-game="sudoku"]').click();
  const hard = page.locator('#levelList [data-level="hard"]');
  await expect(hard).toHaveClass(/is-locked/);
  await expect(page.locator('#levelList [data-level="easy"]')).not.toHaveClass(/is-locked/);
  await hard.click();
  await expect(page.locator('#pro')).toHaveClass(/is-on/);
  await page.locator('#pro [data-action="buy-pro"]').click();
  await expect(page.locator('#pro')).not.toHaveClass(/is-on/);
  await expect(hard).not.toHaveClass(/is-locked/);
  await hard.click();
  await expect(page.locator('#play-sudoku')).toHaveClass(/is-on/, { timeout: 30_000 });
  await expect(page.locator('#play-sudoku')).toContainText('Difícil');
  expect(errors).toEqual([]);
});

test("the daily challenge opens today's game on its level, even without Pro, and goes back to the picker", async ({ page }) => {
  const errors = await openApp(page);
  const card = page.locator('#daily .daily-card');
  await expect(card).toContainText('Reto del día');
  await card.click();
  const play = page.locator('.screen.is-on[id^="play-"]');
  await expect(play).toHaveCount(1, { timeout: 30_000 });
  await expect(play).toContainText(/Difícil|Experto/);
  await play.locator('[data-action="back"]').click();
  await expect(page.locator('#hub')).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});

test('a solved daily challenge shows as done with its streak', async ({ page }) => {
  await page.addInitScript(() => {
    const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = new Date(), yesterday = new Date(Date.now() - 86400000);
    localStorage.setItem('puzzlesgo.daily', JSON.stringify({ done: { [key(yesterday)]: { id: 'sudoku', L: 'hard', time: 90 }, [key(today)]: { id: 'loop', L: 'hard', time: 60 } } }));
  });
  await openApp(page);
  await expect(page.locator('#daily .daily-card')).toHaveClass(/is-done/);
  await expect(page.locator('#daily .daily-card')).toContainText('racha de 2 días');
});

test('solving the daily challenge counts for the streak', async ({ page }) => {
  // on 9 Nov 2026 the challenge is Sudoku, Hard (core/daily.js)
  await page.clock.setFixedTime(new Date(2026, 10, 9, 10, 0));
  const errors = await openApp(page);
  await expect(page.locator('#daily .daily-card')).toContainText('Sudoku');
  await page.locator('#daily .daily-card').click();
  await expect(page.locator('#play-sudoku')).toHaveClass(/is-on/, { timeout: 30_000 });
  const { p, sel } = await page.evaluate(() => JSON.parse(localStorage.getItem('puzzlesgo.sudoku.v1')).cur);
  // walk the board with the arrows from the first cell, writing the solution in every empty one
  if (sel < 0) await page.keyboard.press('ArrowRight');   // with nothing selected, the first arrow picks the first cell
  else for (let k = 0; k < sel % 9 + Math.floor(sel / 9); k++) await page.keyboard.press(k < sel % 9 ? 'ArrowLeft' : 'ArrowUp');
  for (let i = 0; i < 81; i++){
    if (!p.givens[i]) await page.keyboard.press(String(p.solution[i]));
    if (i % 9 === 8){ await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown'); }
    else await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('#win')).toHaveClass(/is-on/, { timeout: 10_000 });
  await expect(page.locator('#winDaily')).toHaveText('Reto del día hecho · racha de 1 día');
  await page.locator('#win [data-action="to-menu"]').click();
  await expect(page.locator('#hub')).toHaveClass(/is-on/);
  await expect(page.locator('#daily .daily-card')).toHaveClass(/is-done/);
  expect(errors).toEqual([]);
});

test('Progress opens without Pro but asks for it; with Pro it is shown', async ({ page }) => {
  const errors = await openApp(page);
  await page.locator('.hub-progress[data-action="open-progress"]').click();
  const gate = page.locator('#progress .pro-gate__card');
  await expect(gate).toContainText('Progreso es parte de Pro');
  await gate.locator('[data-action="open-pro"]').click();
  await expect(page.locator('#pro')).toHaveClass(/is-on/);
  await page.locator('#pro [data-action="buy-pro"]').click();
  await expect(gate).toHaveCount(0);
  await expect(page.locator('#progress .pg-chips')).toBeVisible();
  expect(errors).toEqual([]);
});

test('with the daily challenge and an unfinished game, both cards share one row', async ({ page }) => {
  const errors = await openApp(page);
  const play = await startGame(page, 'light-up');
  await play.locator('.cell').first().click();
  await play.locator('[data-action="back"]').click();
  await page.locator('#levels [data-action="back"]').click();
  const pair = page.locator('#daily .hub-pair');
  await expect(pair.locator('.resume-card')).toHaveCount(2);
  await expect(page.locator('#resumeLast .resume-card')).toHaveCount(0);
  const [a, b] = await Promise.all([0, 1].map(i => pair.locator('.resume-card').nth(i).boundingBox()));
  expect(Math.abs(a.y - b.y)).toBeLessThan(1);
  await pair.locator('[data-action="resume-last"]').click();
  await expect(play).toHaveClass(/is-on/);
  expect(errors).toEqual([]);
});
