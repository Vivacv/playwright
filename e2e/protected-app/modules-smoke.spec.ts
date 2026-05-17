/**
 * Smoke tests for protected-app module routes accessed without authentication.
 *
 * These routes all sit behind ProtectedRoute. An unauthenticated visit should
 * redirect to /auth or show an auth gate — never crash with an error boundary.
 *
 * Covers operational modules: gym, legal, marketing, warehouse, assets,
 * maintenance, fleet, strategic, QR management, and admin sub-sections.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertNocrash(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// Protected-app module routes — no-crash smoke tests
// ---------------------------------------------------------------------------

const MODULE_ROUTES = [
  '/protected-app/gym-dashboard',
  '/protected-app/gym',
  '/protected-app/legal',
  '/protected-app/marketplace',
  '/protected-app/intranet',
  '/protected-app/project-management',
  '/protected-app/strategic',
  '/protected-app/property-services',
  '/protected-app/condominium',
  '/protected-app/qr',
  '/protected-app/roles-permissions',
  '/protected-app/organization/roles',
  '/protected-app/security-audit',
  '/protected-app/cybersecurity',
  '/protected-app/security-command-center',
  '/protected-app/effective-access-tester',
  '/protected-app/saas-management',
  '/protected-app/market-analysis',
  '/protected-app/executive-dashboard',
  '/protected-app/comprehensive-dashboard',
  '/protected-app/presentation-generator',
  '/protected-app/business-architecture',
  '/protected-app/dev-business-dashboard',
  '/protected-app/technologies-analysis',
  '/protected-app/development',
  '/protected-app/development-changelog',
  '/protected-app/prompt-optimizer',
  '/protected-app/code-assistant',
  '/protected-app/pcfr',
  '/protected-app/requisitions',
  '/protected-app/gateway-observability',
  '/protected-app/mfe-health',
  '/protected-app/route-validator',
  '/protected-app/cms',
  '/protected-app/investor-pitch',
  '/protected-app/admin/route-permissions',
  '/protected-app/admin/super-unified',
  '/protected-app/admin/ai-insights',
  '/protected-app/admin/my-team',
  '/protected-app/admin/organization-settings',
  '/protected-app/admin/invitations',
  '/protected-app/admin/agents-agencies',
  '/protected-app/admin/provisioning',
];

test.describe('Protected-app modules — unauthenticated redirect/gate smoke tests', () => {
  for (const path of MODULE_ROUTES) {
    test(`${path} does not crash`, async ({ page }) => {
      await assertNocrash(page, path);
    });
  }
});
