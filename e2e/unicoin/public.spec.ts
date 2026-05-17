/**
 * E2E smoke tests for Unicoin public pages.
 *
 * Covers: /unicoin-landing and /unicoin hub.
 * Both are public-facing pages (no auth required for initial render).
 */

import { test, expect } from '@playwright/test';

async function smokeCheck(page: import('@playwright/test').Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const appErrors = errors.filter(
    (e) =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('cloudflare'),
  );
  expect(appErrors, `JS errors on ${path}`).toHaveLength(0);

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// /unicoin-landing
// ---------------------------------------------------------------------------

test.describe('Unicoin — /unicoin-landing', () => {
  test('renders without JS errors', async ({ page }) => {
    await smokeCheck(page, '/unicoin-landing');
  });

  test('page title is non-empty', async ({ page }) => {
    await page.goto('/unicoin-landing');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('main heading is visible', async ({ page }) => {
    await page.goto('/unicoin-landing');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('no crash error boundary shown', async ({ page }) => {
    await page.goto('/unicoin-landing');
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /unicoin
// ---------------------------------------------------------------------------

test.describe('Unicoin — /unicoin hub', () => {
  test('renders without JS errors', async ({ page }) => {
    await smokeCheck(page, '/unicoin');
  });

  test('page renders or redirects to auth', async ({ page }) => {
    await page.goto('/unicoin');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

test.describe('Unicoin — deeper content checks', () => {
  test('/unicoin-landing heading contains unicoin/crypto-related text', async ({ page }) => {
    await page.goto('/unicoin-landing');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
    const headingText = await heading.innerText().catch(() => '');
    expect(headingText).toMatch(/unicoin|crypto|coin|token|blockchain/i);
  });

  test('/unicoin-landing has at least one CTA link or button', async ({ page }) => {
    await page.goto('/unicoin-landing');
    await page.waitForLoadState('networkidle');

    const buttonCount = await page.getByRole('button').count();
    const linkCount = await page.getByRole('link').count();
    expect(buttonCount + linkCount).toBeGreaterThan(0);

    const firstCta = buttonCount > 0
      ? page.getByRole('button').first()
      : page.getByRole('link').first();
    await expect(firstCta).toBeVisible({ timeout: 8000 });
  });

  test('/unicoin body has meaningful text when not redirected', async ({ page }) => {
    await page.goto('/unicoin');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const headingCount = await page.getByRole('heading').count();
    if (headingCount === 0) {
      test.skip(true, '/unicoin redirected to auth — skipping content check');
    }
    expect(body.trim().length).toBeGreaterThan(10);
  });
});
