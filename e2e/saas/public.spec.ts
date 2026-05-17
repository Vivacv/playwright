/**
 * E2E smoke tests for SaaS public pages.
 *
 * Covers: /saas, /saas/getting-started, /saas/pricing, /saas/checkout/success,
 * and vertical pricing pages (/saas/real-estate/pricing, /saas/tourism/pricing,
 * /saas/water/pricing, /saas/academy/pricing, /saas/pm/pricing).
 *
 * All are public (no auth). Tests: no crash, non-empty body, CORS-safe.
 */

import { test, expect } from '@playwright/test';

async function smokeCheck(page: import('@playwright/test').Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const appErrors = errors.filter(
    (e) =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('cloudflare'),
  );
  expect(appErrors, `JS errors on ${path}`).toHaveLength(0);

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// /saas — main SaaS hub
// ---------------------------------------------------------------------------

test.describe('SaaS — /saas hub', () => {
  test('renders without JS errors', async ({ page }) => {
    await smokeCheck(page, '/saas');
  });

  test('page title is non-empty', async ({ page }) => {
    await page.goto('/saas');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('main heading visible', async ({ page }) => {
    await page.goto('/saas');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// /saas/getting-started
// ---------------------------------------------------------------------------

test.describe('SaaS — /saas/getting-started', () => {
  test('renders without JS errors', async ({ page }) => {
    await smokeCheck(page, '/saas/getting-started');
  });

  test('body is non-empty', async ({ page }) => {
    await page.goto('/saas/getting-started');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// /saas/pricing
// ---------------------------------------------------------------------------

test.describe('SaaS — /saas/pricing', () => {
  test('renders without JS errors', async ({ page }) => {
    await smokeCheck(page, '/saas/pricing');
  });

  test('pricing content is visible', async ({ page }) => {
    await page.goto('/saas/pricing');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// /saas/checkout/success
// ---------------------------------------------------------------------------

test.describe('SaaS — /saas/checkout/success', () => {
  test('renders without crashing', async ({ page }) => {
    await page.goto('/saas/checkout/success');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Vertical pricing pages
// ---------------------------------------------------------------------------

const VERTICAL_PRICING = [
  '/saas/real-estate/pricing',
  '/saas/tourism/pricing',
  '/saas/water/pricing',
  '/saas/academy/pricing',
  '/saas/pm/pricing',
];

for (const path of VERTICAL_PRICING) {
  test.describe(`SaaS vertical — ${path}`, () => {
    test('renders without crashing', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length).toBeGreaterThan(0);

      const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
      await expect(errorBoundary).not.toBeVisible();
    });
  });
}
