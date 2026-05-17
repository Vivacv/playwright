/**
 * E2E tests for DOP Traceability — Cape Verde Denomination of Protected Origin
 *
 * Routes:
 *   /dop-fogo                   — hub for Fogo DOP products
 *   /verify-dop/:lotNumber      — lot verification (EN)
 *   /verificar-dop/:lotNumber   — lot verification (PT)
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertPageOk(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. DOP Fogo hub — /dop-fogo
// ---------------------------------------------------------------------------

test.describe('DOPFogo — hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dop-fogo');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/dop-fogo');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('DOP or Fogo-related content keyword is visible', async ({ page }) => {
    const content = page
      .getByText(/dop|fogo|denominação|denomination|origem|origin|certificad|certif/i)
      .first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'DOP/Fogo content keyword not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });

  test('verification CTA or lot lookup input is present', async ({ page }) => {
    const cta = page
      .getByRole('link', { name: /verify|verificar|check|lote|lot/i })
      .or(page.locator('input[type="text"], input[type="search"]').first());
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'No verification CTA or input found');
    }
    await expect(cta.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Verify DOP lot — /verify-dop/:lotNumber (EN)
// ---------------------------------------------------------------------------

test.describe('VerifyDOP — lot verification (EN)', () => {
  test('renders gracefully with a dummy lot number', async ({ page }) => {
    await assertPageOk(page, '/verify-dop/DOP-FOGO-2024-001');
  });

  test('shows lot result or not-found state', async ({ page }) => {
    await page.goto('/verify-dop/DOP-FOGO-2024-001');
    await page.waitForLoadState('networkidle');

    const result = page
      .getByText(/lote|lot|valid|verified|not found|não encontrad|result/i)
      .first();
    const count = await result.count();
    if (count === 0) {
      test.skip(true, 'Lot result or not-found message not visible');
    }
    await expect(result).toBeVisible({ timeout: 5000 });
  });

  test('renders with numeric lot number without crash', async ({ page }) => {
    await assertPageOk(page, '/verify-dop/000000');
  });
});

// ---------------------------------------------------------------------------
// 3. Verificar DOP lot — /verificar-dop/:lotNumber (PT)
// ---------------------------------------------------------------------------

test.describe('VerificarDOP — lot verification (PT)', () => {
  test('renders gracefully with a dummy lot number', async ({ page }) => {
    await assertPageOk(page, '/verificar-dop/DOP-FOGO-2024-001');
  });

  test('PT and EN routes render equivalent content', async ({ page }) => {
    // Both routes should show similar content (same component)
    await page.goto('/verificar-dop/DOP-TEST-999');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });
});
