// Every game opens, generates a board, shows its bar and its help, and you can go back.
import { test, expect } from '@playwright/test';
import { GAMES, openApp, startGame } from './helpers.js';

for (const id of GAMES){
  test(`${id}: starts a game`, async ({ page }) => {
    const errors = await openApp(page);
    const play = await startGame(page, id);
    await expect(play.locator('.dock .back-pill')).toBeVisible();
    await expect(play.locator('.dock [data-action="reset"]')).toBeVisible();
    // only this game's stylesheet has been loaded
    const sheets = await page.locator('link[href^="css/games/"]').evaluateAll(ls => ls.map(l => l.getAttribute('href')));
    expect(sheets).toEqual(id === 'sudoku' ? [] : [`css/games/${id}.css`]);

    await play.locator('[data-target="help"]').click();
    await expect(page.locator('#help')).toHaveClass(/is-on/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#help')).not.toHaveClass(/is-on/);

    await play.locator('.back-pill').click();
    await expect(page.locator('#levels.is-on, #pick.is-on, #hub.is-on')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
