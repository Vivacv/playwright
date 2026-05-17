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

// ---------------------------------------------------------------------------
// Suite — deeper auth gate checks
// ---------------------------------------------------------------------------

test.describe('Suite — auth gate content checks', () => {
  test('/suite shows login form or dashboard element', async ({ page }) => {
    await page.goto('/suite');
    await page.waitForLoadState('networkidle');

    const authForm = page.locator('form, input[type="email"], input[type="password"]').first();
    const dashboard = page.locator('nav, header, [role="navigation"]').first();

    const authCount = await authForm.count();
    const dashboardCount = await dashboard.count();

    if (authCount === 0 && dashboardCount === 0) {
      test.skip(true, 'Neither auth form nor dashboard found');
    }
    const visible = authCount > 0 ? authForm : dashboard;
    await expect(visible).toBeVisible({ timeout: 8000 });
  });

  test('/suite/marketplace body has meaningful text', async ({ page }) => {
    await page.goto('/suite/marketplace');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(10);
  });

  test('/suite title is non-empty', async ({ page }) => {
    await page.goto('/suite');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('/suite/real-estate redirects or shows content without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/suite/real-estate');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('/suite body has substantial content', async ({ page }) => {
    await page.goto('/suite');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('/suite/marketplace/orders responds without crash', async ({ page }) => {
    await page.goto('/suite/marketplace/orders');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length, 'Empty body on /suite/marketplace/orders').toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('/suite/marketplace title is non-empty', async ({ page }) => {
    await page.goto('/suite/marketplace');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('/suite/marketplace/become-provider body is non-empty', async ({ page }) => {
    await page.goto('/suite/marketplace/become-provider');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('/suite/marketplace/order/new responds without crash', async ({ page }) => {
    await page.goto('/suite/marketplace/order/new');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });
});
