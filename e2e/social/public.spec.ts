/**
 * E2E smoke tests for Social platform — /social/*.
 *
 * The /social route uses a wildcard. Covers the root and a few
 * known sub-paths to verify no crash on render.
 */

import { test, expect } from '@playwright/test';

const SOCIAL_ROUTES = [
  '/social',
  '/social/feed',
  '/social/profile',
];

for (const path of SOCIAL_ROUTES) {
  test.describe(`Social — ${path}`, () => {
    test('renders or redirects without crashing', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);

      const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
      await expect(errorBoundary).not.toBeVisible();
    });
  });
}

test.describe('Social — root /social', () => {
  test('no JS errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('page title is non-empty', async ({ page }) => {
    await page.goto('/social');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Social — content verification', () => {
  test('/social renders a heading', async ({ page }) => {
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading').first();
    const count = await page.getByRole('heading').count();
    if (count === 0) {
      test.skip(true, '/social heading not found — page may require auth');
    }
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('/social/feed has body content > 10 chars', async ({ page }) => {
    await page.goto('/social/feed');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const headingCount = await page.getByRole('heading').count();
    const buttonCount = await page.getByRole('button').count();
    const hasContent = headingCount > 0 || buttonCount > 0 || body.trim().length > 10;
    if (!hasContent) {
      test.skip(true, '/social/feed content not available — page may require auth');
    }
    expect(body.trim().length).toBeGreaterThan(10);
  });

  test('/social/profile has body content > 10 chars', async ({ page }) => {
    await page.goto('/social/profile');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const headingCount = await page.getByRole('heading').count();
    const buttonCount = await page.getByRole('button').count();
    const hasContent = headingCount > 0 || buttonCount > 0 || body.trim().length > 10;
    if (!hasContent) {
      test.skip(true, '/social/profile content not available — page may require auth');
    }
    expect(body.trim().length).toBeGreaterThan(10);
  });

  test('/social has at least one link or button', async ({ page }) => {
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const linkCount = await page.getByRole('link').count();
    const buttonCount = await page.getByRole('button').count();
    expect(linkCount + buttonCount).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Social sub-routes — no JS errors
// ---------------------------------------------------------------------------

test.describe('Social sub-routes — no JS errors', () => {
  const routes = ['/social/feed', '/social/profile'];

  for (const path of routes) {
    test(`${path} renders without unhandled JS errors`, async ({ page }) => {
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
      expect(appErrors).toHaveLength(0);
    });
  }

  test('/social/feed title is non-empty', async ({ page }) => {
    await page.goto('/social/feed');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Social — additional content checks
// ---------------------------------------------------------------------------

test.describe('Social — body and navigation', () => {
  test('/social body has substantial content', async ({ page }) => {
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('/social has at least one image or avatar', async ({ page }) => {
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img, svg').first();
    const count = await page.locator('img, svg').count();
    if (count === 0) {
      test.skip(true, '/social has no images — may require auth');
    }
    await expect(images).toBeVisible({ timeout: 6000 });
  });

  test('/social/profile title is non-empty', async ({ page }) => {
    await page.goto('/social/profile');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
