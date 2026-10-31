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

test('Star Battle: a trial star puts its X marks and tapping it again removes it', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const cells = play.locator('.cell');
  await play.locator('[data-tool="try"]').click();
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveClass(/cell--try/);
  await expect(cells.nth(1)).toHaveClass(/cell--auto/);   // places its automatic X marks
  await cells.nth(0).click();
  await expect(cells.nth(0)).not.toHaveClass(/cell--try/);
  await expect(cells.nth(1)).not.toHaveClass(/cell--auto/);
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

test('Star Battle: with every star placed but one breaking a rule, it warns and marks it even with errors off', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const { N, solution } = await page.evaluate(() => JSON.parse(localStorage.getItem('puzzlesgo.star-battle.v1')).cur.p);
  // the solution with one star moved to another cell of its row: still 20 stars, but not the solution
  const stars = solution.slice(), row = Math.floor(stars[0] / N);
  stars[0] = [...Array(N).keys()].map(c => row * N + c).find(i => !solution.includes(i));
  await play.locator('[data-tool="try"]').click();
  for (const i of stars) await play.locator('.cell').nth(i).click();
  await expect(page.locator('#toast')).toHaveText(/No puede haber más de 2 estrellas|no pueden tocarse/);
  await expect(play.locator('.cell.is-bad').first()).toBeVisible();
  await expect(page.locator('#win')).not.toHaveClass(/is-on/);
});

test('a hint keeps pulsing until the next touch', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  await play.locator('[data-action="hint"]').click();
  const flashed = play.locator('.cell.is-flash');
  await expect(flashed).toHaveCount(1);
  await page.waitForTimeout(3000);   // the old flash lasted 1.5 s
  await expect(flashed).toHaveCount(1);
  await play.locator('.hud').click();
  await expect(flashed).toHaveCount(0);
});

test('Star Battle: tapping a trial star, with either tool, undoes it and everything after it', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const cells = play.locator('.cell');
  await cells.nth(99).click();                      // an X from before the guess stays
  await play.locator('[data-tool="try"]').click();
  await cells.nth(0).click();                       // the guess
  await play.locator('[data-tool="star"]').click();
  await cells.nth(55).click(); await cells.nth(55).click();   // a star after it
  await expect(cells.nth(55)).toHaveClass(/cell--star/);
  await cells.nth(0).click();                       // the guess, with the normal tool: back to before it
  await expect(cells.nth(0)).not.toHaveClass(/cell--try/);
  await expect(cells.nth(55)).not.toHaveClass(/cell--star/);
  await expect(cells.nth(99)).toHaveClass(/cell--x/);
  await play.locator('[data-action="undo"]').click();   // undo brings it all back
  await expect(cells.nth(0)).toHaveClass(/cell--try/);
  await expect(cells.nth(55)).toHaveClass(/cell--star/);
});

// one test per game, so each has its own time to generate a board on a busy machine
for (const id of ['killer-sudoku', 'calcudoku']){
  test(`${id} starts with plain cages; the setting tints them`, async ({ page }) => {
    const errors = await openApp(page);
    const play = await startGame(page, id);
    const board = play.locator('.board');
    await expect(board).not.toHaveClass(/is-tinted/);
    await play.locator('[data-action="open"][data-target="settings"]').click();
    const toggle = page.locator('#settingsList .toggle', { hasText: 'Colorear jaulas' }).locator('input');
    await toggle.check({ force: true });
    await expect(board).toHaveClass(/is-tinted/);
    expect(await board.locator('.cell').first().evaluate(el => el.style.getPropertyValue('--cage'))).toMatch(/^hsl\(/);
    await toggle.uncheck({ force: true });
    await expect(board).not.toHaveClass(/is-tinted/);
    expect(errors).toEqual([]);
  });
}
