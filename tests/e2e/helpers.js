import { expect } from '@playwright/test';

export const GAMES = ['star-battle', 'sudoku', 'killer-sudoku', 'kakuro', 'loop', 'gears', 'dice', 'circuit', 'circle', 'hexagon',
  'fit', 'pentominoes', 'gridlock', 'trail', 'bridges', 'calcudoku', 'light-up', 'binary', 'peg-solitaire'];

/** Opens the app and fails the test if the page throws any error. */
export async function openApp(page, url = './'){
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url);
  await expect(page.locator('#games .game-row').first()).toBeVisible();
  return errors;
}

/** From the picker, enters the game (expanding its group if needed) and starts its first level. */
export async function startGame(page, id){
  const card = page.locator(`#games [data-game="${id}"]`);
  if (!(await card.count())) await page.locator('#games [data-action="toggle-group"]').first().click();
  await card.click();
  const level = page.locator('#levelList [data-action="start-level"]').first();
  const play = page.locator(`#play-${id}`);
  await expect(level.or(play.and(page.locator('.is-on')))).toBeVisible();
  if (await level.isVisible()) await level.click();
  const pick = page.locator('#pick.is-on [data-action="pick-puzzle"]').first();
  await expect(pick.or(play.and(page.locator('.is-on')))).toBeVisible({ timeout: 30_000 });
  if (await pick.isVisible()) await pick.click();
  await expect(play).toHaveClass(/is-on/, { timeout: 30_000 });
  return play;
}

