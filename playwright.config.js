// Browser tests (npm run test:e2e). Serves the folder as is, like GitHub Pages.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    ...devices['iPhone 13'],
    defaultBrowserType: 'chromium',
    locale: 'es-ES',   // the app follows the phone's language: the tests run in Spanish
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore'   // the server's log of every request
  }
});
