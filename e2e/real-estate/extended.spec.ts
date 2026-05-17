/**
 * E2E smoke tests for Real Estate routes not covered by public.spec.ts.
 *
 * Covers: /real-estate-hub, /real-estate/blockchain, /real-estate/portfolio,
 * /real-estate/discovery, /real-estate/credit-portal, /real-estate/bank-portal,
 * /real-estate/shared-document/:token.
 *
 * Auth-gated routes are expected to redirect to /auth or show an auth gate.
 * Tests only verify no crash.
 */

import { test, expect } from '@playwright/test';

async function assertNoCrash(page: import('@playwright/test').Page, path: string) {
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

  const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// /real-estate-hub
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate-hub', () => {
  test('renders without crash', async ({ page }) => {
    await assertNoCrash(page, '/real-estate-hub');
  });

  test('heading or redirect visible', async ({ page }) => {
    await page.goto('/real-estate-hub');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    const body = await page.locator('body').innerText().catch(() => '');
    const hasHeading = await heading.isVisible().catch(() => false);
    expect(hasHeading || body.length > 0).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// /real-estate/blockchain
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate/blockchain', () => {
  test('renders without crash', async ({ page }) => {
    await assertNoCrash(page, '/real-estate/blockchain');
  });
});

// ---------------------------------------------------------------------------
// /real-estate/portfolio
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate/portfolio', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await assertNoCrash(page, '/real-estate/portfolio');
  });
});

// ---------------------------------------------------------------------------
// /real-estate/discovery
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate/discovery', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await assertNoCrash(page, '/real-estate/discovery');
  });
});

// ---------------------------------------------------------------------------
// /real-estate/credit-portal
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate/credit-portal', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await assertNoCrash(page, '/real-estate/credit-portal');
  });
});

// ---------------------------------------------------------------------------
// /real-estate/bank-portal
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate/bank-portal', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await assertNoCrash(page, '/real-estate/bank-portal');
  });
});

// ---------------------------------------------------------------------------
// /real-estate/shared-document/:token — placeholder token
// ---------------------------------------------------------------------------

test.describe('RealEstate — /real-estate/shared-document/:token', () => {
  test('renders or shows not-found without crash', async ({ page }) => {
    await page.goto('/real-estate/shared-document/dummy-share-token-123');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});
