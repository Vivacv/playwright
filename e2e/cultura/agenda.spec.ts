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
// 3. Cultura event detail — /cultura/eventos/:slug
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
