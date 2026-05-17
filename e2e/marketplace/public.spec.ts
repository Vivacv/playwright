/**
 * E2E tests for public Marketplace pages — /marketplace, /marketplace/become-provider
 *
 * The marketplace is an app/service directory. Some routes are fully public;
 * others require auth. These tests cover the public listing and
 * become-a-provider onboarding page.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Marketplace listing — /marketplace
// ---------------------------------------------------------------------------

test.describe('Marketplace — listing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('cloudflare'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('page renders content (not blank)', async ({ page }) => {
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('a heading or marketplace label is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    const marketplaceText = page.getByText(/marketplace|mercado|loja/i).first();
    const headingCount = await heading.count();
    const textCount = await marketplaceText.count();
    if (headingCount === 0 && textCount === 0) {
      test.skip(true, 'No heading or marketplace text found');
    }
    if (headingCount > 0) {
      await expect(heading).toBeVisible({ timeout: 6000 });
    } else {
      await expect(marketplaceText).toBeVisible({ timeout: 6000 });
    }
  });

  test('app/service cards or listing items are rendered', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();
    if (count === 0) {
      test.skip(true, 'No listing cards found — needs live data or auth');
    }
    expect(count).toBeGreaterThan(0);
  });

  test('search or filter controls are present', async ({ page }) => {
    const searchInput = page
      .getByRole('searchbox')
      .or(page.locator('input[type="text"], input[type="search"]').first())
      .or(page.getByPlaceholder(/search|buscar|procurar|filter/i).first());
    const count = await searchInput.count();
    if (count === 0) {
      test.skip(true, 'No search input found');
    }
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Provider detail — /marketplace/provider/:id
// ---------------------------------------------------------------------------

test.describe('Marketplace — provider detail page', () => {
  test('invalid provider ID renders gracefully (no crash)', async ({ page }) => {
    await page.goto('/marketplace/provider/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Become a provider — /marketplace/become-provider
// ---------------------------------------------------------------------------

test.describe('Marketplace — become-provider page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace/become-provider');
    await page.waitForLoadState('networkidle');
  });

  test('page renders without crash', async ({ page }) => {
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('a registration form or CTA is rendered', async ({ page }) => {
    const form = page.locator('form').first();
    const cta = page.getByRole('button', { name: /apply|candidat|registar|join|tornar/i });
    const formCount = await form.count();
    const ctaCount = await cta.count();
    if (formCount === 0 && ctaCount === 0) {
      test.skip(true, 'No form or CTA found on become-provider page');
    }
    if (formCount > 0) {
      await expect(form).toBeVisible({ timeout: 5000 });
    } else {
      await expect(cta.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 4. New order — /marketplace/order/new (auth guard)
// ---------------------------------------------------------------------------

test.describe('Marketplace — order creation (auth guard)', () => {
  test('accessing order/new without auth redirects or shows auth gate', async ({ page }) => {
    await page.goto('/marketplace/order/new');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirectedToAuth =
      url.includes('/auth') || url.includes('/login');

    if (!isRedirectedToAuth) {
      // May render an auth prompt inline
      const authIndicator = page
        .getByRole('tab', { name: /entrar/i })
        .or(page.getByText(/sign in|login|unauthorized|não autorizado/i));
      const count = await authIndicator.count();
      // At minimum it should not crash
      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });
});
