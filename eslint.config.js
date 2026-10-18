// ESLint for errors only (unused or undefined names, unreachable code…), no style rules: the code is
// formatted by hand. Run with `npm run lint` (also part of `npm run check` and CI).
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      // a parameter can document a signature (abstract steps, callbacks) and a catch can ignore its error
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  // the app: browser modules and Web Workers
  { files: ['js/**/*.js'], languageOptions: { globals: { ...globals.browser, ...globals.worker } } },
  // startup diagnostics: a classic script, not a module
  { files: ['js/boot-check.js'], languageOptions: { sourceType: 'script', globals: globals.browser } },
  { files: ['sw.js'], languageOptions: { globals: globals.serviceworker } },
  { files: ['scripts/**', 'tests/**', '*.config.js'], languageOptions: { globals: globals.node } },
  { files: ['scripts/**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
  // Playwright scripts: the callbacks of page.evaluate run in the page
  { files: ['tests/e2e/**', 'scripts/make-icons.cjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } }
];
