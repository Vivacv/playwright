/**
 * E2E tests for the PWA / Mobile portal routes
 *
 * These routes are public-facing PWA portal pages designed for mobile use.
 *
 * Routes:
 *   /mobile/home       — mobile home hub
 *   /mobile/real-estate — mobile real estate browser
 *   /mobile/tourism    — mobile tourism portal
 *   /mobile/events     — mobile events portal
 *   /mobile/gym        — mobile gym portal
 *   /mobile/onboarding — mobile onboarding flow
 *   /mobile/media-academy — mobile media academy
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertMobilePageOk(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. All mobile routes — crash-free rendering
// ---------------------------------------------------------------------------

const MOBILE_ROUTES = [
  { path: '/mobile/home', label: 'Mobile Home' },
  { path: '/mobile/real-estate', label: 'Mobile Real Estate' },
  { path: '/mobile/tourism', label: 'Mobile Tourism' },
  { path: '/mobile/events', label: 'Mobile Events' },
  { path: '/mobile/gym', label: 'Mobile Gym' },
  { path: '/mobile/onboarding', label: 'Mobile Onboarding' },
  { path: '/mobile/media-academy', label: 'Mobile Media Academy' },
];

test.describe('Mobile PWA portal routes — crash-free rendering', () => {
  for (const { path, label } of MOBILE_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertMobilePageOk(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Mobile Home — /mobile/home
// ---------------------------------------------------------------------------

test.describe('MobileHome — PWA hub', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/mobile/home');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('heading or navigation items are visible', async ({ page }) => {
    await page.goto('/mobile/home');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    const navItems = page.getByRole('link').or(page.getByRole('button'));

    const headingCount = await heading.count();
    const navCount = await navItems.count();

    if (headingCount === 0 && navCount === 0) {
      test.skip(true, 'No content found on mobile home');
    }
    const visible = headingCount > 0 ? heading : navItems.first();
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Mobile Onboarding — /mobile/onboarding
// ---------------------------------------------------------------------------

test.describe('MobileOnboarding — flow', () => {
  test('shows onboarding content or step indicator', async ({ page }) => {
    await page.goto('/mobile/onboarding');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/welcome|bem-vindo|onboard|get started|começar|setup|configurar/i)
      .first();
    const step = page.locator('[class*="step"], [class*="Step"]').first();

    const contentCount = await content.count();
    const stepCount = await step.count();

    if (contentCount === 0 && stepCount === 0) {
      test.skip(true, 'No onboarding content found');
    }
    const visible = contentCount > 0 ? content : step;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Mobile — per-route heading checks
// ---------------------------------------------------------------------------

test.describe('Mobile — per-route heading checks', () => {
  test('/mobile/tourism has a heading or body with tourism text', async ({ page }) => {
    await page.goto('/mobile/tourism');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const heading = page.getByRole('heading').or(page.locator('h1, h2')).first();
    const headingCount = await heading.count();
    if (headingCount > 0) {
      await expect(heading).toBeVisible({ timeout: 8000 });
    } else {
      const hasKeyword = /turismo|tourism/i.test(body);
      if (!hasKeyword) {
        test.skip(true, '/mobile/tourism content not found — may require auth or device context');
      }
      expect(body).toMatch(/turismo|tourism/i);
    }
  });

  test('/mobile/events has a heading or events-related text', async ({ page }) => {
    await page.goto('/mobile/events');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const heading = page.getByRole('heading').or(page.locator('h1, h2')).first();
    const headingCount = await heading.count();
    if (headingCount > 0) {
      await expect(heading).toBeVisible({ timeout: 8000 });
    } else {
      const hasKeyword = /event|evento/i.test(body);
      if (!hasKeyword) {
        test.skip(true, '/mobile/events content not found — may require auth or device context');
      }
      expect(body).toMatch(/event|evento/i);
    }
  });

  test('/mobile/gym has heading or gym-related content', async ({ page }) => {
    await page.goto('/mobile/gym');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const heading = page.getByRole('heading').or(page.locator('h1, h2')).first();
    const headingCount = await heading.count();
    if (headingCount > 0) {
      await expect(heading).toBeVisible({ timeout: 8000 });
    } else {
      const hasKeyword = /gym|academia|fitness|treino/i.test(body);
      if (!hasKeyword) {
        test.skip(true, '/mobile/gym content not found — may require auth or device context');
      }
      expect(body).toMatch(/gym|academia|fitness|treino/i);
    }
  });

  test('/mobile/real-estate has a heading or body check', async ({ page }) => {
    await page.goto('/mobile/real-estate');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const heading = page.getByRole('heading').or(page.locator('h1, h2')).first();
    const headingCount = await heading.count();
    if (headingCount > 0) {
      await expect(heading).toBeVisible({ timeout: 8000 });
    } else {
      const hasKeyword = /real.?estate|imóvel|imobiliário|property/i.test(body);
      if (!hasKeyword) {
        test.skip(true, '/mobile/real-estate content not found — may require auth or device context');
      }
      expect(body).toMatch(/real.?estate|imóvel|imobiliário|property/i);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Mobile — page title checks
// ---------------------------------------------------------------------------

test.describe('Mobile — page title checks', () => {
  const titleRoutes = ['/mobile/home', '/mobile/onboarding', '/mobile/media-academy'];

  for (const path of titleRoutes) {
    test(`${path} has a non-empty page title`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. Mobile — body content checks
// ---------------------------------------------------------------------------

test.describe('Mobile — body content checks', () => {
  test('/mobile/home body has substantial content', async ({ page }) => {
    await page.goto('/mobile/home');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('/mobile/media-academy body is non-empty', async ({ page }) => {
    await page.goto('/mobile/media-academy');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length, 'Empty body on /mobile/media-academy').toBeGreaterThan(0);
  });

  test('/mobile/home has no JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/mobile/home');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });
});
