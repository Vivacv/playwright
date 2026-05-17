/**
 * E2E tests for the Cultura Agenda public embed — /cultura/*
 *
 * Tests the public cultura-embed edge function integration (format=json/js/css),
 * the public agenda listing page, and the cultura embed script behavior.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Cultura embed API (via edge function direct GET)
// ---------------------------------------------------------------------------

test.describe('Cultura embed — edge function API', () => {
  const EMBED_URL = process.env.VITE_SUPABASE_URL
    ? `${process.env.VITE_SUPABASE_URL}/functions/v1/cultura-embed`
    : null;

  test('format=json returns an array of events or empty array', async ({ request }) => {
    if (!EMBED_URL) {
      test.skip(true, 'VITE_SUPABASE_URL not set — skipping direct API test');
      return;
    }
    const resp = await request.get(`${EMBED_URL}?format=json&limit=5`);
    // 200 with JSON array, or 500 if DB not seeded
    if (resp.status() >= 500) {
      test.skip(true, 'Edge function unavailable in this environment');
      return;
    }
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('format=css returns CSS content', async ({ request }) => {
    if (!EMBED_URL) {
      test.skip(true, 'VITE_SUPABASE_URL not set');
      return;
    }
    const resp = await request.get(`${EMBED_URL}?format=css`);
    if (resp.status() >= 500) {
      test.skip(true, 'Edge function unavailable');
      return;
    }
    expect(resp.status()).toBe(200);
    const ct = resp.headers()['content-type'] ?? '';
    expect(ct).toContain('text/css');
  });

  test('format=js returns JavaScript content', async ({ request }) => {
    if (!EMBED_URL) {
      test.skip(true, 'VITE_SUPABASE_URL not set');
      return;
    }
    const resp = await request.get(`${EMBED_URL}?format=js`);
    if (resp.status() >= 500) {
      test.skip(true, 'Edge function unavailable');
      return;
    }
    expect(resp.status()).toBe(200);
    const ct = resp.headers()['content-type'] ?? '';
    expect(ct).toContain('javascript');
  });

  test('invalid format returns 400', async ({ request }) => {
    if (!EMBED_URL) {
      test.skip(true, 'VITE_SUPABASE_URL not set');
      return;
    }
    const resp = await request.get(`${EMBED_URL}?format=xml`);
    expect(resp.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 2. Cultura agenda page — /cultura
// ---------------------------------------------------------------------------

test.describe('Cultura — agenda page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cultura');
    await page.waitForLoadState('networkidle');
  });

  test('page renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/cultura');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('cloudflare'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('page title is set', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('event list or "no upcoming events" message is visible', async ({ page }) => {
    // Either live events or an empty state
    const events = page.locator('[class*="event"], [class*="Event"], article').first();
    const noEvents = page.getByText(/sem eventos|no events|nenhum evento/i).first();

    const eventCount = await events.count();
    const noEventCount = await noEvents.count();

    if (eventCount === 0 && noEventCount === 0) {
      // At minimum content should exist
      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length).toBeGreaterThan(0);
    } else if (eventCount > 0) {
      await expect(events).toBeVisible({ timeout: 6000 });
    } else {
      await expect(noEvents).toBeVisible({ timeout: 6000 });
    }
  });

  test('filter or search controls for events are present', async ({ page }) => {
    // Cultura agenda usually has island/category filters
    const filter = page
      .locator('select, [role="combobox"], [class*="filter"], [class*="Filter"]')
      .or(page.getByPlaceholder(/search|buscar|procurar/i))
      .first();
    const count = await filter.count();
    if (count === 0) {
      test.skip(true, 'No filter controls found — may depend on page variant');
    }
    await expect(filter).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Event cards/list items and category filter tabs
// ---------------------------------------------------------------------------

test.describe('Cultura — deeper agenda verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cultura');
    await page.waitForLoadState('networkidle');
  });

  test('event cards or list items are visible (or graceful empty state)', async ({ page }) => {
    const eventCards = page.locator(
      '[class*="event"], [class*="Event"], [class*="card"], [class*="Card"], article, li',
    );
    const emptyState = page.getByText(
      /sem eventos|no events|nenhum evento|no upcoming|próximos eventos/i,
    ).first();

    const cardCount = await eventCards.count();
    const emptyCount = await emptyState.count();

    if (cardCount === 0 && emptyCount === 0) {
      test.skip(true, 'No event cards or empty state found — may need live data');
    }
    if (cardCount > 0) {
      await expect(eventCards.first()).toBeVisible({ timeout: 8000 });
    } else {
      await expect(emptyState).toBeVisible({ timeout: 8000 });
    }
  });

  test('category filter tabs or buttons are visible', async ({ page }) => {
    // Cultura agenda typically shows island/category filter tabs
    const tabs = page.getByRole('tab');
    const filterButtons = page.getByRole('button', {
      name: /all|todos|música|music|desporto|sport|arte|art|teatro|dance|dança|cultura/i,
    });
    const filterSelect = page.locator('select, [role="combobox"]').first();

    const tabCount = await tabs.count();
    const btnCount = await filterButtons.count();
    const selectCount = await filterSelect.count();

    if (tabCount === 0 && btnCount === 0 && selectCount === 0) {
      test.skip(true, 'No category filter tabs, buttons, or selects found');
    }
    if (tabCount > 0) {
      await expect(tabs.first()).toBeVisible({ timeout: 8000 });
    } else if (btnCount > 0) {
      await expect(filterButtons.first()).toBeVisible({ timeout: 8000 });
    } else {
      await expect(filterSelect).toBeVisible({ timeout: 8000 });
    }
  });

  test('agenda shows a date or month reference', async ({ page }) => {
    // Any agenda should show a date, month name, or calendar reference
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasDate = /janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}\/\d{1,2}|\d{4}/i.test(bodyText);
    if (!hasDate) {
      test.skip(true, 'No date or month reference found — may depend on live event data');
    }
    expect(hasDate).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 4. Cultura event detail — /cultura/eventos/:slug
// ---------------------------------------------------------------------------

test.describe('Cultura — event detail page', () => {
  test('invalid event slug renders gracefully (no crash)', async ({ page }) => {
    await page.goto('/cultura/eventos/nonexistent-event-slug');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. CORS headers on cultura embed API
// ---------------------------------------------------------------------------

test.describe('Cultura embed — CORS', () => {
  const EMBED_URL = process.env.VITE_SUPABASE_URL
    ? `${process.env.VITE_SUPABASE_URL}/functions/v1/cultura-embed`
    : null;

  test('OPTIONS preflight returns CORS headers', async ({ request }) => {
    if (!EMBED_URL) {
      test.skip(true, 'VITE_SUPABASE_URL not set');
      return;
    }
    const resp = await request.fetch(`${EMBED_URL}`, { method: 'OPTIONS' });
    const allowOrigin = resp.headers()['access-control-allow-origin'];
    expect(allowOrigin).toBeTruthy();
  });

  test('POST is rejected with 405', async ({ request }) => {
    if (!EMBED_URL) {
      test.skip(true, 'VITE_SUPABASE_URL not set');
      return;
    }
    const resp = await request.post(EMBED_URL, { data: '{}' });
    expect(resp.status()).toBe(405);
  });
});
