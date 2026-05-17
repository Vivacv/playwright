/**
 * E2E smoke tests for Agency CRM routes.
 *
 * Covers:
 * - /whatsapp-agency — public marketing landing (no auth required)
 * - /agency-crm — domain shell entry (auth handled internally)
 *
 * Tests verify no crash, non-empty body, and no error boundary.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// /whatsapp-agency — public landing
// ---------------------------------------------------------------------------

test.describe('AgencyCRM — /whatsapp-agency (public)', () => {
  test('renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/whatsapp-agency');
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
    await page.goto('/whatsapp-agency');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('main heading visible', async ({ page }) => {
    await page.goto('/whatsapp-agency');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('no error boundary shown', async ({ page }) => {
    await page.goto('/whatsapp-agency');
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /agency-crm — domain shell (auth gated internally)
// ---------------------------------------------------------------------------

test.describe('AgencyCRM — /agency-crm domain shell', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await page.goto('/agency-crm');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('no unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/agency-crm');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });
});
