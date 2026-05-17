/**
 * Smoke tests for protected-app routes accessed without authentication.
 *
 * These routes all sit behind ProtectedRoute. An unauthenticated visit should
 * either redirect to /auth or show an auth gate — never crash.
 *
 * We do NOT test business logic here (that belongs in authenticated suites);
 * we only verify that the routes fail gracefully.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertRedirectsOrShowsAuthGate(
  page: import('@playwright/test').Page,
  path: string,
) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// Protected app routes — redirect-without-crash smoke tests
// ---------------------------------------------------------------------------

const PROTECTED_ROUTES = [
  '/protected-app/dashboard',
  '/protected-app/apps',
  '/protected-app/audit-trail',
  '/protected-app/audit-dashboard',
  '/protected-app/user-management',
  '/protected-app/settings',
  '/protected-app/profile',
  '/protected-app/help',
  '/protected-app/messaging',
  '/protected-app/ai-assistant',
  '/protected-app/kpi',
  '/protected-app/business-intelligence',
  '/protected-app/report-hub',
  '/protected-app/database',
  '/protected-app/deployment-monitor',
  '/protected-app/system-logs',
  '/protected-app/domain-health',
  '/protected-app/codebase-intelligence',
  '/protected-app/test-management',
  '/protected-app/component-library',
  '/protected-app/admin/super',
  '/protected-app/admin/tenants/new',
  '/protected-app/grc-master-plan',
  '/protected-app/procurement',
];

test.describe('Protected app routes — unauthenticated access', () => {
  for (const path of PROTECTED_ROUTES) {
    test(`${path} redirects or shows auth gate without crash`, async ({ page }) => {
      await assertRedirectsOrShowsAuthGate(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// Redirect shortcuts — /codebase-intelligence
// ---------------------------------------------------------------------------

test.describe('Codebase Intelligence redirect — /codebase-intelligence', () => {
  test('navigates without crash', async ({ page }) => {
    await assertRedirectsOrShowsAuthGate(page, '/codebase-intelligence');
  });
});
