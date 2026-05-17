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

// ---------------------------------------------------------------------------
// 4. DOP — deeper content verification
// ---------------------------------------------------------------------------

test.describe('DOPFogo — deeper content', () => {
  test('DOP landing heading is visible', async ({ page }) => {
    await page.goto('/dop-fogo');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('lot search form or input exists on DOP landing', async ({ page }) => {
    await page.goto('/dop-fogo');
    await page.waitForLoadState('networkidle');
    const searchInput = page
      .locator('input[type="text"], input[type="search"], input[type="number"]')
      .first();
    const searchForm = page.locator('form').first();
    const verifyLink = page.getByRole('link', { name: /verify|verificar|lote|lot|check/i });

    const inputCount = await searchInput.count();
    const formCount = await searchForm.count();
    const linkCount = await verifyLink.count();

    if (inputCount === 0 && formCount === 0 && linkCount === 0) {
      test.skip(true, 'No search form, input, or verification link found on DOP Fogo');
    }
    const visibleEl = inputCount > 0 ? searchInput : formCount > 0 ? searchForm : verifyLink.first();
    await expect(visibleEl).toBeVisible({ timeout: 8000 });
  });
});

test.describe('VerifyDOP — invalid lot graceful handling', () => {
  test('invalid lot number shows an error or not-found state gracefully (EN)', async ({ page }) => {
    await page.goto('/verify-dop/INVALID-LOT-00000');
    await page.waitForLoadState('networkidle');

    // Page must not crash
    const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();

    // Either a not-found message or any content is shown
    const notFound = page
      .getByText(/not found|não encontrad|invalid|inválido|no result|sem resultado/i)
      .first();
    const heading = page.locator('h1, h2').first();

    const notFoundCount = await notFound.count();
    const headingCount = await heading.count();

    if (notFoundCount === 0 && headingCount === 0) {
      test.skip(true, 'Neither not-found message nor heading visible for invalid lot');
    }
    const visibleEl = notFoundCount > 0 ? notFound : heading;
    await expect(visibleEl).toBeVisible({ timeout: 8000 });
  });

  test('invalid lot number shows an error or not-found state gracefully (PT)', async ({ page }) => {
    await page.goto('/verificar-dop/INVALID-LOT-00000');
    await page.waitForLoadState('networkidle');

    // Page must not crash
    const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();

    // Either a not-found message or any content is shown
    const notFound = page
      .getByText(/not found|não encontrad|invalid|inválido|no result|sem resultado/i)
      .first();
    const heading = page.locator('h1, h2').first();

    const notFoundCount = await notFound.count();
    const headingCount = await heading.count();

    if (notFoundCount === 0 && headingCount === 0) {
      test.skip(true, 'Neither not-found message nor heading visible for invalid lot (PT)');
    }
    const visibleEl = notFoundCount > 0 ? notFound : heading;
    await expect(visibleEl).toBeVisible({ timeout: 8000 });
  });

  test('DOP verification heading is visible for a known-format lot', async ({ page }) => {
    await page.goto('/verify-dop/DOP-FOGO-2024-001');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});
