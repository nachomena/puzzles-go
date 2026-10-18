// Game actions: restart with confirmation and one-tap undo.
import { test, expect } from '@playwright/test';
import { openApp, startGame } from './helpers.js';

test('restart asks for confirmation and only clears on accept', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'light-up');
  const marks = play.locator('.lu-mark, .lu-bulb');

  await play.locator('[data-action="reset"]').click();
  await expect(page.locator('#toast')).toHaveText('El tablero ya está vacío');
  await expect(page.locator('#confirm')).not.toHaveClass(/is-on/);

  await play.locator('.cell:not(.lu-black)').first().click();
  await expect(marks).toHaveCount(1);
  await play.locator('[data-action="reset"]').click();
  await expect(page.locator('#confirmTitle')).toHaveText('¿Reiniciar la partida?');
  await page.locator('[data-action="confirm-alternate"]').click();
  await expect(marks).toHaveCount(1);

  await play.locator('[data-action="reset"]').click();
  await page.locator('[data-action="confirm-accept"]').click();
  await expect(marks).toHaveCount(0);
});

test('Star Battle: undoing the star goes back to the X', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const cell = play.locator('.cell').first();
  await cell.click();
  await cell.click();
  await expect(cell).toHaveClass(/cell--star/);
  await play.locator('[data-action="undo"]').click();
  await expect(cell).toHaveClass(/cell--x/);
});

test('Star Battle: test star with its X marks; the normal tool turns it into a star', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const cells = play.locator('.cell');
  await play.locator('[data-tool="try"]').click();
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveClass(/cell--try/);
  await expect(cells.nth(1)).toHaveClass(/cell--auto/);   // places its automatic X marks
  await cells.nth(0).click();
  await expect(cells.nth(0)).not.toHaveClass(/cell--star/);
  await expect(cells.nth(1)).not.toHaveClass(/cell--auto/);
  await cells.nth(0).click();
  await play.locator('[data-tool="star"]').click();
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveClass(/cell--star/);
  await expect(cells.nth(0)).not.toHaveClass(/cell--try/);
});

test('Binary: undoing blue goes back to red', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'binary');
  const cell = play.locator('.cell:not(.is-given)').first();
  await cell.click();
  await cell.click();
  await expect(cell.locator('.bn-2')).toHaveCount(1);
  await play.locator('[data-action="undo"]').click();
  await expect(cell.locator('.bn-1')).toHaveCount(1);
});

test('help: the button stays in view, the page behind is locked and each opening starts at the top', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'gridlock');
  const help = page.locator('#help'), body = help.locator('.sheet__body'), done = help.locator('[data-action="close"]');
  await play.locator('[data-target="help"]').click();
  await expect(help).toHaveClass(/is-on/);
  await expect(done).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

  await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
  expect(await body.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await done.click();
  await expect(help).not.toHaveClass(/is-on/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');

  await play.locator('[data-target="help"]').click();
  expect(await body.evaluate(el => el.scrollTop)).toBe(0);
});
