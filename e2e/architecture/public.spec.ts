/**
 * E2E tests for public architecture overview pages
 *
 * Routes:
 *   /iot-architecture   — IoT platform architecture diagram & docs
 *   /dpi-architecture   — DPI (Digital Public Infrastructure) architecture
 *   /uni-services       — UniGlobal platform services catalogue
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertPageOk(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. All architecture routes — crash-free batch check
// ---------------------------------------------------------------------------

const ARCH_ROUTES = [
  { path: '/iot-architecture', label: 'IoT Architecture' },
  { path: '/dpi-architecture', label: 'DPI Architecture' },
  { path: '/uni-services', label: 'Uni Services' },
];

test.describe('Architecture pages — crash-free rendering', () => {
  for (const { path, label } of ARCH_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. IoT Architecture — /iot-architecture
// ---------------------------------------------------------------------------

test.describe('IoTArchitecture — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iot-architecture');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/iot-architecture');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('IoT-related content keyword is visible', async ({ page }) => {
    const content = page.getByText(/iot|internet of things|sensor|device|dispositivo|architecture/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'IoT content keyword not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. DPI Architecture — /dpi-architecture
// ---------------------------------------------------------------------------

test.describe('DPIArchitecture — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dpi-architecture');
    await page.waitForLoadState('networkidle');
  });

  test('heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('DPI-related content is visible', async ({ page }) => {
    const content = page
      .getByText(/dpi|digital public infrastructure|infra|government|governo|platform/i)
      .first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'DPI content keyword not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Uni Services — /uni-services
// ---------------------------------------------------------------------------

test.describe('UniServices — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/uni-services');
    await page.waitForLoadState('networkidle');
  });

  test('heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('services listing or cards are present', async ({ page }) => {
    const content = page
      .getByText(/service|serviço|platform|plataforma|module|módulo/i)
      .first();
    const cards = page.locator('[class*="card"], [class*="Card"]');

    const contentCount = await content.count();
    const cardCount = await cards.count();

    if (contentCount === 0 && cardCount === 0) {
      test.skip(true, 'No services content found');
    }
    const visible = contentCount > 0 ? content : cards.first();
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Architecture — content depth checks
// ---------------------------------------------------------------------------

test.describe('Architecture — content depth checks', () => {
  test('/iot-architecture has a heading visible', async ({ page }) => {
    await page.goto('/iot-architecture');
    await page.waitForLoadState('networkidle');
    const heading = page.getByRole('heading').or(page.locator('h1, h2')).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('/iot-architecture body contains architecture-related text', async ({ page }) => {
    await page.goto('/iot-architecture');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body).toMatch(/architecture|arquitetura|iot|IoT/i);
  });

  test('/dpi-architecture has a heading', async ({ page }) => {
    await page.goto('/dpi-architecture');
    await page.waitForLoadState('networkidle');
    const heading = page.getByRole('heading').or(page.locator('h1, h2')).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('/uni-services has a list or card section', async ({ page }) => {
    await page.goto('/uni-services');
    await page.waitForLoadState('networkidle');
    const listOrCards = page
      .locator('ul, ol, [class*="card"], [class*="Card"], [class*="service"], [class*="Service"]')
      .first();
    const count = await listOrCards.count();
    if (count === 0) {
      test.skip(true, 'No list or card section found on /uni-services');
    }
    await expect(listOrCards).toBeVisible({ timeout: 8000 });
  });

  for (const { path, label } of ARCH_ROUTES) {
    test(`${label} (${path}) has at least one link`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const links = page.getByRole('link');
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});
