/**
 * E2E smoke tests for Water platform landing page — /water-landing.
 *
 * Verifies: no JS crashes, non-empty render, heading visible.
 */

import { test, expect } from '@playwright/test';

const URL = '/water-landing';

test.describe('Water — /water-landing', () => {
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

  test('no crash error boundary shown', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('body contains meaningful text', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(10);
  });
});

test.describe('Water — /water-landing deeper content', () => {
  test('main heading contains relevant text', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
    const headingText = await heading.innerText().catch(() => '');
    expect(headingText).toMatch(/água|water|gestão|management/i);
  });

  test('CTA button or contact link is present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const ctaButton = page.getByRole('button').first();
    const ctaLink = page.getByRole('link').first();

    const buttonCount = await page.getByRole('button').count();
    const linkCount = await page.getByRole('link').count();
    expect(buttonCount + linkCount).toBeGreaterThan(0);

    if (buttonCount > 0) {
      await expect(ctaButton).toBeVisible({ timeout: 8000 });
    } else {
      await expect(ctaLink).toBeVisible({ timeout: 8000 });
    }
  });

  test('features or services section loads with multiple paragraphs or cards', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const paragraphCount = await page.locator('p').count();
    const cardCount = await page.locator('[class*="card"], [class*="feature"], [class*="service"], section').count();
    expect(paragraphCount + cardCount).toBeGreaterThan(1);
  });
});
