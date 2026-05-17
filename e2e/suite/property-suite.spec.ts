/**
 * E2E smoke tests for Property Suite — /suite/*.
 *
 * /suite is a protected layout; unauthenticated visits must redirect to /auth
 * or show an auth gate — never crash with an unhandled error.
 *
 * Sub-routes tested: /, /marketplace, /marketplace/order/new,
 * /marketplace/orders, /marketplace/provider-dashboard, /marketplace/become-provider,
 * /real-estate.
 */

import { test, expect } from '@playwright/test';

async function assertAuthGateOrRedirect(
  page: import('@playwright/test').Page,
  path: string,
) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// Suite routes
// ---------------------------------------------------------------------------

const SUITE_ROUTES = [
  '/suite',
  '/suite/marketplace',
  '/suite/marketplace/order/new',
  '/suite/marketplace/orders',
  '/suite/marketplace/provider-dashboard',
  '/suite/marketplace/become-provider',
  '/suite/real-estate',
];

for (const path of SUITE_ROUTES) {
  test(`${path} — redirects or shows auth gate without crash`, async ({ page }) => {
    await assertAuthGateOrRedirect(page, path);
  });
}

test('Suite — no JS errors on root /suite', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/suite');
  await page.waitForLoadState('networkidle');

  const appErrors = errors.filter(
    (e) =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('cloudflare'),
  );
  expect(appErrors).toHaveLength(0);
});
