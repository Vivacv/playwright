/**
 * E2E smoke tests for WhatsApp Commerce (/loja) routes.
 *
 * Covers: /loja, /loja/auth, /loja/demo, /loja/dashboard,
 * /loja/backoffice, /loja/admin, /loja/onboarding, /loja/tracking.
 *
 * These are semi-public/auth-gated routes. Tests verify no crash on load.
 */

import { test, expect } from '@playwright/test';

async function assertNoCrash(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// /loja — storefront entry
// ---------------------------------------------------------------------------

test.describe('Loja — /loja', () => {
  test('renders without crashing', async ({ page }) => {
    await assertNoCrash(page, '/loja');
  });

  test('no JS errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/loja');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// /loja/auth
// ---------------------------------------------------------------------------

test.describe('Loja — /loja/auth', () => {
  test('renders login/auth form without crashing', async ({ page }) => {
    await assertNoCrash(page, '/loja/auth');
  });
});

// ---------------------------------------------------------------------------
// /loja/demo
// ---------------------------------------------------------------------------

test.describe('Loja — /loja/demo', () => {
  test('renders without crashing', async ({ page }) => {
    await assertNoCrash(page, '/loja/demo');
  });
});

// ---------------------------------------------------------------------------
// Auth-gated loja routes (redirect or render)
// ---------------------------------------------------------------------------

const GATED_ROUTES = [
  '/loja/dashboard',
  '/loja/backoffice',
  '/loja/admin',
  '/loja/onboarding',
  '/loja/tracking',
];

for (const path of GATED_ROUTES) {
  test.describe(`Loja — ${path}`, () => {
    test('redirects or renders without crash', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);

      const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
      await expect(errorBoundary).not.toBeVisible();
    });
  });
}
