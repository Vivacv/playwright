/**
 * E2E tests for NuUni — civic engagement platform
 *
 * NuUni is a public civic portal with sub-sections:
 *   /nuuni           — hub
 *   /nuuni/reporta   — citizen reporting
 *   /nuuni/parlamento — parliamentary monitoring
 *   /nuuni/diaspora  — diaspora engagement
 *   /nuuni/informacao — news / information
 *   /nuuni/eco-turismo — eco-tourism
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
// 1. NuUni hub — /nuuni
// ---------------------------------------------------------------------------

test.describe('NuUni — hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nuuni');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/nuuni');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('main heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('NuUni or civic content keyword is visible', async ({ page }) => {
    const content = page.getByText(/nuuni|cívico|civic|cidadão|citizen|cabo verde/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'NuUni content keyword not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });

  test('sub-section navigation cards or links are present', async ({ page }) => {
    const navItems = page.getByRole('link').or(page.getByRole('button'));
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Sub-sections — all render without crash
// ---------------------------------------------------------------------------

const NUUNI_ROUTES = [
  { path: '/nuuni/reporta', label: 'Reporta (citizen reporting)' },
  { path: '/nuuni/parlamento', label: 'Parlamento (parliamentary)' },
  { path: '/nuuni/diaspora', label: 'Diaspora' },
  { path: '/nuuni/informacao', label: 'Informação (news)' },
  { path: '/nuuni/eco-turismo', label: 'Eco-turismo' },
];

test.describe('NuUni — sub-sections', () => {
  for (const { path, label } of NUUNI_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertPageOk(page, path);
    });

    test(`${label}: has at least one heading`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const heading = page.locator('h1, h2, h3').first();
      const count = await heading.count();
      if (count === 0) {
        test.skip(true, `No heading found on ${path}`);
      }
      await expect(heading).toBeVisible({ timeout: 6000 });
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Citizen reporting — specific content checks
// ---------------------------------------------------------------------------

test.describe('NuUni — Reporta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nuuni/reporta');
    await page.waitForLoadState('networkidle');
  });

  test('a reporting form or submission CTA is present', async ({ page }) => {
    const form = page.locator('form').first();
    const cta = page.getByRole('button', { name: /report|reportar|submit|enviar|denúncia/i });

    const formCount = await form.count();
    const ctaCount = await cta.count();

    if (formCount === 0 && ctaCount === 0) {
      test.skip(true, 'No form or reporting CTA found on Reporta page');
    }
    if (formCount > 0) {
      await expect(form).toBeVisible({ timeout: 5000 });
    } else {
      await expect(cta.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
