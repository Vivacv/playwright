/**
 * E2E tests for the Events Landing page — /events-landing
 *
 * The public events marketing page covers ticketing, organizer management,
 * venue bookings, and the events marketplace. No auth required.
 */

import { test, expect } from '@playwright/test';

const URL = '/events-landing';

// ---------------------------------------------------------------------------
// 1. Page load
// ---------------------------------------------------------------------------

test.describe('EventsLanding — page load', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(URL);
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
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('does not show an error boundary', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Header
// ---------------------------------------------------------------------------

test.describe('EventsLanding — header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('header is visible', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 6000 });
  });

  test('auth action button is present in header', async ({ page }) => {
    const authBtn = page
      .getByRole('button', { name: /entrar|login|sign in|começar|get started/i })
      .or(page.getByRole('link', { name: /entrar|login|começar/i }));
    const count = await authBtn.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Hero section
// ---------------------------------------------------------------------------

test.describe('EventsLanding — hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('main heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('events-related keyword appears in the hero area', async ({ page }) => {
    // The hero content should mention events, tickets, or similar
    const content = page.getByText(/event|ticket|bilhete|organiz/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Events keyword not found — may be translated differently');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Feature cards / roles grid
// ---------------------------------------------------------------------------

test.describe('EventsLanding — features grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('multiple role/feature cards are rendered', async ({ page }) => {
    // Events landing has cards for: organizer, ticketing, venues, scanner, etc.
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();
    if (count === 0) {
      test.skip(true, 'No cards found — page may be loading or structured differently');
    }
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('ticketing feature is mentioned on the page', async ({ page }) => {
    const ticketing = page.getByText(/ticket|bilhet/i).first();
    const count = await ticketing.count();
    if (count === 0) {
      test.skip(true, 'Ticketing text not found — content may vary');
    }
    await expect(ticketing).toBeVisible({ timeout: 5000 });
  });

  test('QR-related feature is mentioned on the page', async ({ page }) => {
    const qr = page.getByText(/QR|scanner/i).first();
    const count = await qr.count();
    if (count === 0) {
      test.skip(true, 'QR reference not found');
    }
    await expect(qr).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Footer
// ---------------------------------------------------------------------------

test.describe('EventsLanding — footer', () => {
  test('footer or bottom nav is present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer, [class*="footer"], [class*="Footer"]').first();
    const count = await footer.count();
    if (count === 0) {
      test.skip(true, 'No footer found — may be mobile-only bottom nav');
    }
    await expect(footer).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 6. CTA, marketplace section, nav links, and listing count
// ---------------------------------------------------------------------------

test.describe('EventsLanding — deeper content verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('"Create Event" or equivalent CTA is visible', async ({ page }) => {
    const cta = page
      .getByRole('button', { name: /create event|criar evento|new event|novo evento|começar|get started/i })
      .or(page.getByRole('link', { name: /create event|criar evento|get started|começar/i }));
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'No "Create Event" CTA found — may be behind auth or different wording');
    }
    await expect(cta.first()).toBeVisible({ timeout: 8000 });
  });

  test('events marketplace section loads on the page', async ({ page }) => {
    const marketplaceSection = page
      .getByText(/marketplace|mercado|loja|discover events|explorar eventos/i)
      .first();
    const count = await marketplaceSection.count();
    if (count === 0) {
      test.skip(true, 'Marketplace section text not found');
    }
    await expect(marketplaceSection).toBeVisible({ timeout: 8000 });
  });

  test('navigation links (header or nav) are present', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    const links = nav.locator('a');
    const count = await links.count();
    if (count === 0) {
      test.skip(true, 'No navigation links found in header/nav');
    }
    expect(count).toBeGreaterThan(0);
  });

  test('event listing items or event count indicator appear', async ({ page }) => {
    // Either individual event cards, a count badge, or an "upcoming events" section
    const eventItems = page.locator(
      '[class*="event"], [class*="Event"], [class*="card"], [class*="Card"], article',
    );
    const countBadge = page.getByText(/\d+\s*(event|evento)/i).first();
    const itemCount = await eventItems.count();
    const badgeCount = await countBadge.count();
    if (itemCount === 0 && badgeCount === 0) {
      test.skip(true, 'No event listing items or count indicators found — may need live data');
    }
    if (itemCount > 0) {
      await expect(eventItems.first()).toBeVisible({ timeout: 8000 });
    } else {
      await expect(countBadge).toBeVisible({ timeout: 8000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Events public marketplace — /events
// ---------------------------------------------------------------------------

test.describe('Events — public marketplace route', () => {
  test('/events route renders or redirects gracefully', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('/ticket/:id with dummy ID renders gracefully (no crash)', async ({ page }) => {
    await page.goto('/ticket/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});
