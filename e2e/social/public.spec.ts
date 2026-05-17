/**
 * E2E smoke tests for Social platform — /social/*.
 *
 * The /social route uses a wildcard. Covers the root and a few
 * known sub-paths to verify no crash on render.
 */

import { test, expect } from '@playwright/test';

const SOCIAL_ROUTES = [
  '/social',
  '/social/feed',
  '/social/profile',
];

for (const path of SOCIAL_ROUTES) {
  test.describe(`Social — ${path}`, () => {
    test('renders or redirects without crashing', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);

      const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
      await expect(errorBoundary).not.toBeVisible();
    });
  });
}

test.describe('Social — root /social', () => {
  test('no JS errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('page title is non-empty', async ({ page }) => {
    await page.goto('/social');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
