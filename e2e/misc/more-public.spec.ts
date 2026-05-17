/**
 * E2E smoke tests for miscellaneous public routes not covered elsewhere.
 *
 * Covers: /auth-enhanced, /precos-agricolas, /prix-agricoles,
 * /qr-checkout-scanner, /qr-water, /qr-validator-login, /qr-validator-logout,
 * /condominium, /whatsapp-agency, /ecommerce-landing, /fitness-landing,
 * /tourism/subscriptions.
 */

import { test, expect } from '@playwright/test';

async function assertNoCrash(page: import('@playwright/test').Page, path: string) {
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

  const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// /auth-enhanced
// ---------------------------------------------------------------------------

test.describe('/auth-enhanced', () => {
  test('renders without JS errors', async ({ page }) => {
    await assertNoCrash(page, '/auth-enhanced');
  });
});

// ---------------------------------------------------------------------------
// Agricultural prices — alternate language routes
// ---------------------------------------------------------------------------

test.describe('/precos-agricolas (PT)', () => {
  test('renders without JS errors', async ({ page }) => {
    await assertNoCrash(page, '/precos-agricolas');
  });

  test('heading or price content visible', async ({ page }) => {
    await page.goto('/precos-agricolas');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

test.describe('/prix-agricoles (FR)', () => {
  test('renders without JS errors', async ({ page }) => {
    await assertNoCrash(page, '/prix-agricoles');
  });

  test('heading visible', async ({ page }) => {
    await page.goto('/prix-agricoles');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// QR routes not covered in qr/public.spec.ts
// ---------------------------------------------------------------------------

test.describe('/qr-checkout-scanner', () => {
  test('renders without crash', async ({ page }) => {
    await assertNoCrash(page, '/qr-checkout-scanner');
  });
});

test.describe('/qr-water', () => {
  test('renders without crash', async ({ page }) => {
    await assertNoCrash(page, '/qr-water');
  });
});

test.describe('/qr-validator-login', () => {
  test('renders without crash', async ({ page }) => {
    await assertNoCrash(page, '/qr-validator-login');
  });
});

test.describe('/qr-validator-logout', () => {
  test('renders without crash', async ({ page }) => {
    await assertNoCrash(page, '/qr-validator-logout');
  });
});

// ---------------------------------------------------------------------------
// /condominium — public condominium landing
// ---------------------------------------------------------------------------

test.describe('/condominium', () => {
  test('renders without JS errors', async ({ page }) => {
    await assertNoCrash(page, '/condominium');
  });

  test('heading or content visible', async ({ page }) => {
    await page.goto('/condominium');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// /whatsapp-agency
// ---------------------------------------------------------------------------

test.describe('/whatsapp-agency', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await page.goto('/whatsapp-agency');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /ecommerce-landing
// ---------------------------------------------------------------------------

test.describe('/ecommerce-landing', () => {
  test('renders without JS errors', async ({ page }) => {
    await assertNoCrash(page, '/ecommerce-landing');
  });

  test('main heading visible', async ({ page }) => {
    await page.goto('/ecommerce-landing');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// /fitness-landing
// ---------------------------------------------------------------------------

test.describe('/fitness-landing', () => {
  test('renders without JS errors', async ({ page }) => {
    await assertNoCrash(page, '/fitness-landing');
  });

  test('main heading visible', async ({ page }) => {
    await page.goto('/fitness-landing');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// /tourism/subscriptions
// ---------------------------------------------------------------------------

test.describe('/tourism/subscriptions', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await page.goto('/tourism/subscriptions');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});
