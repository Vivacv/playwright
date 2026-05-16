/**
 * Global auth setup for the uni-global-cv E2E suite.
 *
 * This script launches a headless browser, logs in as the admin user,
 * and persists the resulting storage state (cookies + localStorage) to
 * e2e/.auth/admin.json so that individual spec files can reuse the
 * session without re-authenticating on every test.
 *
 * Usage
 * -----
 * Run once before the test suite (or as a Playwright globalSetup):
 *
 *   npx playwright test --config=e2e/playwright.config.ts --global-setup=e2e/auth/setup.ts
 *
 * Or wire it directly in playwright.config.ts:
 *
 *   export default defineConfig({
 *     globalSetup: require.resolve('./auth/setup'),
 *     ...
 *   });
 *
 * Environment variables
 * ---------------------
 *   E2E_ADMIN_EMAIL     Login e-mail    (default: admin@test.local)
 *   E2E_ADMIN_PASSWORD  Login password  (default: test-password)
 *   BASE_URL            App base URL    (default: http://localhost:5173)
 *
 * The generated file e2e/.auth/admin.json is git-ignored.
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:5173';

  // Navigate to the login page.
  await page.goto(`${baseURL}/login`);

  // Fill in credentials.  The selectors use accessible label matching so they
  // stay in sync with minor markup changes.
  await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL ?? 'admin@test.local');
  await page.getByLabel(/password/i).fill(process.env.E2E_ADMIN_PASSWORD ?? 'test-password');

  // Submit the form.
  await page.getByRole('button', { name: /entrar|login|sign in/i }).click();

  // Wait for a successful redirect to the authenticated area.
  // We swallow timeouts here so a misconfigured env doesn't crash the entire
  // setup — the specs that rely on auth will fail with a clearer message.
  await page.waitForURL(/dashboard|admin/, { timeout: 10_000 }).catch(() => {
    // eslint-disable-next-line no-console
    console.warn(
      '[auth/setup] Warning: redirect to authenticated route timed out. ' +
        'Check that BASE_URL, E2E_ADMIN_EMAIL, and E2E_ADMIN_PASSWORD are correct.',
    );
  });

  // Ensure the target directory exists before writing the state file.
  const authDir = path.resolve('e2e/.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Persist cookies and storage so tests can call `test.use({ storageState })`.
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });

  await browser.close();
}

export default globalSetup;
