/**
 * E2E smoke tests for Fleet landing page — /fleet-landing.
 *
 * Verifies: no JS crashes, non-empty render, heading and CTA visible.
 */

import { test, expect } from '@playwright/test';

const URL = '/fleet-landing';

test.describe('Fleet — /fleet-landing', () => {
  test('renders without JS errors', async ({ page }) => {
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

  test('page title is non-empty', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('main heading is visible', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('no error boundary shown', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

test.describe('Fleet — /fleet-landing deeper content', () => {
  test('CTA button or link is visible', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const cta = page.locator('button, a[href]').first();
    await expect(cta).toBeVisible({ timeout: 8000 });
  });

  test('page body contains fleet-related content', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body).toMatch(/fleet|frota|veículo|vehicle/i);
  });

  test('at least one image or icon is present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const count = await page.locator('img, svg').count();
    expect(count).toBeGreaterThan(0);
  });
});
