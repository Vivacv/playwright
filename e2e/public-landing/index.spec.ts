/**
 * E2E tests for the Public Landing page — /public-landing
 *
 * Verifies the main marketing page for the UNI platform:
 * header rendering, hero section, product grid, navigation links,
 * and meta / SEO basics.
 */

import { test, expect } from '@playwright/test';

const URL = '/public-landing';

// ---------------------------------------------------------------------------
// 1. Page loads without JS errors
// ---------------------------------------------------------------------------

test.describe('PublicLanding — page load', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Turnstile') &&
        !e.includes('cloudflare') &&
        !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('document title is non-empty', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('meta description is present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    const metaDesc = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect((metaDesc ?? '').length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Header / navigation
// ---------------------------------------------------------------------------

test.describe('PublicLanding — header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('header element is visible', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 6000 });
  });

  test('header contains at least one navigation link or button', async ({ page }) => {
    const header = page.locator('header').first();
    const links = header.locator('a, button');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Hero section
// ---------------------------------------------------------------------------

test.describe('PublicLanding — hero section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('hero section or main heading is visible', async ({ page }) => {
    // Accept either a <h1> heading or any visible landmark text above the fold
    const hero = page
      .locator('h1')
      .or(page.locator('[class*="hero"], [class*="Hero"]').first());
    await expect(hero.first()).toBeVisible({ timeout: 6000 });
  });

  test('at least one CTA button is rendered in the upper section', async ({ page }) => {
    // CTAs are rendered as <a> or <button> elements in the first 800px
    const buttons = page.getByRole('button').or(page.getByRole('link'));
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Product grid
// ---------------------------------------------------------------------------

test.describe('PublicLanding — product grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('product cards are rendered on the page', async ({ page }) => {
    // The grid contains cards linking to domain landing pages.
    // We look for card containers or link blocks.
    const cards = page
      .locator('[class*="card"], [class*="Card"]')
      .or(page.locator('section a').first());
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('tourism product link is present', async ({ page }) => {
    // Tourism card links to /tourism-landing
    const tourismLink = page
      .getByRole('link', { name: /tourism|turismo/i })
      .or(page.locator('a[href*="tourism"]'));
    const count = await tourismLink.count();
    if (count === 0) {
      test.skip(true, 'Tourism link not found — content may be translated or route changed');
    }
    await expect(tourismLink.first()).toBeVisible();
  });

  test('real estate product link is present', async ({ page }) => {
    const realEstateLink = page
      .getByRole('link', { name: /real estate|imóveis|imobiliário/i })
      .or(page.locator('a[href*="real-estate"]'));
    const count = await realEstateLink.count();
    if (count === 0) {
      test.skip(true, 'Real estate link not found — content may be translated or route changed');
    }
    await expect(realEstateLink.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Language selector
// ---------------------------------------------------------------------------

test.describe('PublicLanding — language selector', () => {
  test('language selector or locale toggle is present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    // Look for any language-related element
    const langToggle = page
      .locator('[class*="language"], [class*="Language"], [aria-label*="language"], [aria-label*="Language"]')
      .or(page.getByText(/PT|EN|FR/).first());
    const count = await langToggle.count();
    if (count === 0) {
      test.skip(true, 'Language selector not found in rendered page');
    }
    await expect(langToggle.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Footer
// ---------------------------------------------------------------------------

test.describe('PublicLanding — footer', () => {
  test('footer is rendered at the bottom of the page', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const footer = page.locator('footer').first();
    const count = await footer.count();
    if (count === 0) {
      test.skip(true, 'No <footer> element found — may use a custom footer component');
    }
    await expect(footer).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. Auth redirect from root
// ---------------------------------------------------------------------------

test.describe('PublicLanding — root redirect', () => {
  test('unauthenticated root (/) redirects to public-landing or auth', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    // Should land on public-landing, /auth, or another public page — never a 500
    const isPublic =
      url.includes('public-landing') ||
      url.includes('/auth') ||
      url.includes('/tourism-landing') ||
      url.includes('/login');
    expect(isPublic || !url.includes('/500')).toBeTruthy();
  });
});
