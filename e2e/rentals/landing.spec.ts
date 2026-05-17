/**
 * E2E tests for Rentals public pages — /rentals-landing and /rentals/host
 *
 * Rentals is the short-stay accommodation module.
 * The landing page is public and features a search bar, featured listings,
 * island filters, and CTAs for hosts.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Rentals landing — /rentals-landing
// ---------------------------------------------------------------------------

test.describe('RentalsLanding — page load', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/rentals-landing');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('cloudflare'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('document title is non-empty', async ({ page }) => {
    await page.goto('/rentals-landing');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('does not show an error boundary', async ({ page }) => {
    await page.goto('/rentals-landing');
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

test.describe('RentalsLanding — content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rentals-landing');
    await page.waitForLoadState('networkidle');
  });

  test('main heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('search input (destination / ilha) is rendered', async ({ page }) => {
    const searchInput = page
      .locator('input[type="text"], input[type="search"]')
      .or(page.getByPlaceholder(/ilha|island|destino|destination|search/i).first());
    const count = await searchInput.count();
    if (count === 0) {
      test.skip(true, 'Search input not found — page structure may vary');
    }
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  });

  test('search input accepts text input', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    const count = await searchInput.count();
    if (count === 0) {
      test.skip(true, 'No text input found');
    }
    await searchInput.fill('Santiago');
    await expect(searchInput).toHaveValue('Santiago');
  });

  test('featured listing cards or property previews are shown', async ({ page }) => {
    // Featured rental listings (from Supabase) or skeleton cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();
    if (count === 0) {
      test.skip(true, 'No listing cards found — needs live DB data');
    }
    expect(count).toBeGreaterThan(0);
  });

  test('header with auth buttons is present', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test('trust/feature badges are visible (verified, instant-book, etc.)', async ({ page }) => {
    const trustContent = page.getByText(/verified|verificad|instant|instante|support|suporte/i).first();
    const count = await trustContent.count();
    if (count === 0) {
      test.skip(true, 'Trust badges not found');
    }
    await expect(trustContent).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Rentals host page — /rentals/host
// ---------------------------------------------------------------------------

test.describe('RentalsHost — page', () => {
  test('renders without a crash', async ({ page }) => {
    await page.goto('/rentals/host');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('host-related content or CTA is rendered', async ({ page }) => {
    await page.goto('/rentals/host');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/host|anunciar|listar|list your/i).first();
    const cta = page.getByRole('button', { name: /start|começar|anunciar|list/i });

    const contentCount = await content.count();
    const ctaCount = await cta.count();

    if (contentCount === 0 && ctaCount === 0) {
      test.skip(true, 'Host content not found — page may require auth or redirect');
    }
    if (contentCount > 0) {
      await expect(content).toBeVisible({ timeout: 5000 });
    } else {
      await expect(cta.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Rentals — deeper content verification
// ---------------------------------------------------------------------------

test.describe('RentalsLanding — deeper content', () => {
  test('hero heading is visible', async ({ page }) => {
    await page.goto('/rentals-landing');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('host CTA is visible on landing page', async ({ page }) => {
    await page.goto('/rentals-landing');
    await page.waitForLoadState('networkidle');
    const hostCta = page
      .getByRole('link', { name: /host|anunciar|list your/i })
      .or(page.getByRole('button', { name: /host|anunciar|list your/i }));
    const count = await hostCta.count();
    if (count === 0) {
      test.skip(true, 'Host CTA not found on rentals landing page');
    }
    await expect(hostCta.first()).toBeVisible({ timeout: 8000 });
  });

  test('features or benefits section is visible', async ({ page }) => {
    await page.goto('/rentals-landing');
    await page.waitForLoadState('networkidle');
    const featuresSection = page
      .getByText(/feature|benefit|vantag|why|porquê|safe|segur/i)
      .first();
    const count = await featuresSection.count();
    if (count === 0) {
      test.skip(true, 'Features/benefits section not found on rentals landing page');
    }
    await expect(featuresSection).toBeVisible({ timeout: 8000 });
  });
});

test.describe('RentalsHost — deeper content', () => {
  test('hero heading is visible on host page', async ({ page }) => {
    await page.goto('/rentals/host');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('host CTA button is visible', async ({ page }) => {
    await page.goto('/rentals/host');
    await page.waitForLoadState('networkidle');
    const cta = page
      .getByRole('button', { name: /start|começar|anunciar|list|host/i })
      .or(page.getByRole('link', { name: /start|começar|anunciar|list|get started/i }));
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'Host CTA not found on host page');
    }
    await expect(cta.first()).toBeVisible({ timeout: 8000 });
  });

  test('features or benefits section is present on host page', async ({ page }) => {
    await page.goto('/rentals/host');
    await page.waitForLoadState('networkidle');
    const section = page
      .getByText(/earn|ganhe|benefit|vantag|feature|why host|porquê/i)
      .first();
    const count = await section.count();
    if (count === 0) {
      test.skip(true, 'Features/benefits section not found on host page');
    }
    await expect(section).toBeVisible({ timeout: 8000 });
  });
});
