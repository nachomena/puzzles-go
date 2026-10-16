import { expect } from '@playwright/test';

export const GAMES = ['star-battle', 'sudoku', 'killer-sudoku', 'kakuro', 'slitherlink', 'gears', 'smart-dices', 'smart-circuit', 'smart-circle', 'smart-hexagon',
  'iq-puzzler', 'katamino', 'rush-hour', 'zip', 'hashi', 'kenken', 'akari', 'binario', 'peg-solitaire'];

/** Abre la app y falla la prueba si la página lanza algún error. */
export async function openApp(page, url = './'){
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url);
  await expect(page.locator('#games .game-card').first()).toBeVisible();
  return errors;
}

/** Desde el selector, entra al juego (desplegando su grupo si hace falta) y empieza su primer nivel. */
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

