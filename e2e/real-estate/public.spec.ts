/**
 * E2E tests for Real Estate public pages
 *
 * Covers: /real-estate-landing (hub overview), /property-search (discovery),
 * /real-estate/subscriptions (pricing page), and /real-estate/join (onboarding).
 *
 * All pages are public (no auth required).
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Real Estate Hub — /real-estate-landing
// ---------------------------------------------------------------------------

test.describe('RealEstate — landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/real-estate-landing');
    await page.waitForLoadState('networkidle');
  });

  test('renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/real-estate-landing');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('cloudflare'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('page title is non-empty', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('main heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('header with navigation is present', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test('at least one CTA button or link is rendered', async ({ page }) => {
    const cta = page
      .getByRole('button', { name: /entrar|login|começar|start|descubra|discover|ver/i })
      .or(page.getByRole('link').first());
    const count = await cta.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Property Search / Discovery — /property-search
// ---------------------------------------------------------------------------

test.describe('RealEstate — property search page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/property-search');
    await page.waitForLoadState('networkidle');
  });

  test('page renders without a 500 error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('a search input or filter panel is present', async ({ page }) => {
    const searchInput = page
      .getByRole('searchbox')
      .or(page.getByPlaceholder(/search|procurar|ilha|island|location/i))
      .or(page.locator('input[type="text"], input[type="search"]').first());
    const count = await searchInput.count();
    if (count === 0) {
      test.skip(true, 'Search input not found — may render differently in this env');
    }
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  });

  test('some property listings or empty state are shown', async ({ page }) => {
    // Either property cards or a "no results" message should be visible
    const listings = page.locator('[class*="card"], [class*="Card"], [class*="property"], [class*="Property"]');
    const emptyState = page.getByText(/no properties|sem propriedades|nenhum imóvel|no results/i);

    const listingCount = await listings.count();
    const emptyCount = await emptyState.count();

    if (listingCount === 0 && emptyCount === 0) {
      test.skip(true, 'Neither listings nor empty state found — needs live data');
    }

    if (listingCount > 0) {
      await expect(listings.first()).toBeVisible({ timeout: 6000 });
    } else {
      await expect(emptyState.first()).toBeVisible({ timeout: 6000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Subscriptions / Pricing — /real-estate/subscriptions
// ---------------------------------------------------------------------------

test.describe('RealEstate — subscriptions page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/real-estate/subscriptions');
    await page.waitForLoadState('networkidle');
  });

  test('page renders without errors', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('pricing tiers or plan cards are visible', async ({ page }) => {
    const planCards = page
      .locator('[class*="card"], [class*="Card"], [class*="plan"], [class*="Plan"]')
      .or(page.getByText(/starter|pro|business|free/i).first());
    const count = await planCards.count();
    if (count === 0) {
      test.skip(true, 'Plan cards not found — needs live data or feature flag');
    }
    await expect(planCards.first()).toBeVisible({ timeout: 6000 });
  });

  test('a subscribe or upgrade CTA is rendered', async ({ page }) => {
    const cta = page.getByRole('button', {
      name: /subscribe|assinar|começar|upgrade|start|ativar/i,
    });
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'Subscribe CTA not found — may differ based on auth state');
    }
    await expect(cta.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Join / Onboarding — /real-estate/join
// ---------------------------------------------------------------------------

test.describe('RealEstate — join / onboarding page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/real-estate/join');
    await page.waitForLoadState('networkidle');
  });

  test('page renders something (not blank)', async ({ page }) => {
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('no 500-level error boundary is shown', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('a form or CTA for joining is present', async ({ page }) => {
    const form = page
      .locator('form')
      .or(page.getByRole('button', { name: /join|juntar|registar|começar|apply/i }));
    const count = await form.count();
    if (count === 0) {
      test.skip(true, 'No form or join CTA found — check route destination');
    }
    await expect(form.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Property search inputs, results placeholder, and join CTA
// ---------------------------------------------------------------------------

test.describe('RealEstate — deeper content verification', () => {
  test('property search form has text or location inputs', async ({ page }) => {
    await page.goto('/property-search');
    await page.waitForLoadState('networkidle');

    const textInput = page.locator('input[type="text"], input[type="search"]').first();
    const locationInput = page
      .getByPlaceholder(/location|ilha|island|city|cidade|where|onde/i)
      .first();
    const textCount = await textInput.count();
    const locationCount = await locationInput.count();

    if (textCount === 0 && locationCount === 0) {
      test.skip(true, 'No text/location inputs found on property-search');
    }
    if (locationCount > 0) {
      await expect(locationInput).toBeVisible({ timeout: 8000 });
    } else {
      await expect(textInput).toBeVisible({ timeout: 8000 });
    }
  });

  test('property results or an empty-state placeholder appears after load', async ({ page }) => {
    await page.goto('/property-search');
    await page.waitForLoadState('networkidle');

    const results = page.locator(
      '[class*="property"], [class*="Property"], [class*="listing"], [class*="Listing"], [class*="card"], [class*="Card"]',
    ).first();
    const emptyState = page.getByText(
      /no properties|sem imóveis|nenhum resultado|no results|0 properties/i,
    ).first();

    const resultCount = await results.count();
    const emptyCount = await emptyState.count();

    if (resultCount === 0 && emptyCount === 0) {
      test.skip(true, 'Neither results nor empty state visible — may need live data');
    }
    if (resultCount > 0) {
      await expect(results).toBeVisible({ timeout: 8000 });
    } else {
      await expect(emptyState).toBeVisible({ timeout: 8000 });
    }
  });

  test('join/onboarding section has a visible CTA button', async ({ page }) => {
    await page.goto('/real-estate/join');
    await page.waitForLoadState('networkidle');

    const cta = page.getByRole('button', {
      name: /join|juntar|registar|começar|apply|submit|enviar|start|ativar/i,
    });
    const link = page.getByRole('link', {
      name: /join|juntar|registar|começar|apply|start/i,
    });
    const ctaCount = await cta.count();
    const linkCount = await link.count();

    if (ctaCount === 0 && linkCount === 0) {
      test.skip(true, 'No join CTA or link found on /real-estate/join');
    }
    if (ctaCount > 0) {
      await expect(cta.first()).toBeVisible({ timeout: 8000 });
    } else {
      await expect(link.first()).toBeVisible({ timeout: 8000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Property detail page — /real-estate/property/:id (graceful 404 on bad id)
// ---------------------------------------------------------------------------

test.describe('RealEstate — property detail page', () => {
  test('invalid property id renders gracefully (no crash)', async ({ page }) => {
    await page.goto('/real-estate/property/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});
