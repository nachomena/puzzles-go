// Acciones de la partida: reiniciar con confirmación y deshacer de un toque.
import { test, expect } from '@playwright/test';
import { openApp, startGame } from './helpers.js';

test('reiniciar pide confirmación y solo borra al aceptar', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'akari');
  const marks = play.locator('.ak-mark, .ak-bulb');

  await play.locator('[data-action="reset"]').click();
  await expect(page.locator('#toast')).toHaveText('El tablero ya está vacío');
  await expect(page.locator('#confirm')).not.toHaveClass(/is-on/);

  await play.locator('.cell:not(.ak-black)').first().click();
  await expect(marks).toHaveCount(1);
  await play.locator('[data-action="reset"]').click();
  await expect(page.locator('#confirmTitle')).toHaveText('¿Reiniciar la partida?');
  await page.locator('[data-action="confirm-alternate"]').click();
  await expect(marks).toHaveCount(1);

  await play.locator('[data-action="reset"]').click();
  await page.locator('[data-action="confirm-accept"]').click();
  await expect(marks).toHaveCount(0);
});

test('Star Battle: deshacer la estrella vuelve a la X', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const cell = play.locator('.cell').first();
  await cell.click();
  await cell.click();
  await expect(cell).toHaveClass(/cell--star/);
  await play.locator('[data-action="undo"]').click();
  await expect(cell).toHaveClass(/cell--x/);
});

test('Star Battle: estrella de prueba con sus X; la herramienta normal la deja como estrella', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'star-battle');
  const cells = play.locator('.cell');
  await play.locator('[data-tool="try"]').click();
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveClass(/cell--try/);
  await expect(cells.nth(1)).toHaveClass(/cell--auto/);   // pone sus X automáticas
  await cells.nth(0).click();
  await expect(cells.nth(0)).not.toHaveClass(/cell--star/);
  await expect(cells.nth(1)).not.toHaveClass(/cell--auto/);
  await cells.nth(0).click();
  await play.locator('[data-tool="star"]').click();
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveClass(/cell--star/);
  await expect(cells.nth(0)).not.toHaveClass(/cell--try/);
});

test('Binario: deshacer el azul vuelve al rojo', async ({ page }) => {
  await openApp(page);
  const play = await startGame(page, 'binario');
  const cell = play.locator('.cell:not(.is-given)').first();
  await cell.click();
  await cell.click();
  await expect(cell.locator('.bn-2')).toHaveCount(1);
  await play.locator('[data-action="undo"]').click();
  await expect(cell.locator('.bn-1')).toHaveCount(1);
});
