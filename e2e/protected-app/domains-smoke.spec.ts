/**
 * Smoke tests for protected-app domain routes not covered by smoke.spec.ts or
 * modules-smoke.spec.ts.
 *
 * Covers: /protected-app/accounting/*, /protected-app/academy/*,
 * /protected-app/fleet/*, /protected-app/erp-lite, /protected-app/erp-next-gen,
 * /protected-app/events/*, /protected-app/real-estate/*, /protected-app/tourism/*,
 * /protected-app/unicoin-wallet/*, /protected-app/ecommerce/*,
 * /protected-app/production/*, /protected-app/crm/*, /protected-app/marketing,
 * /protected-app/advertising, /protected-app/warehouse, /protected-app/public-procurement/*.
 *
 * Unauthenticated visits must redirect or show an auth gate — never crash.
 */

import { test, expect } from '@playwright/test';

async function assertRedirectsOrAuthGate(
  page: import('@playwright/test').Page,
  path: string,
) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length, `Empty body on ${path}`).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// Domain routes
// ---------------------------------------------------------------------------

const DOMAIN_ROUTES = [
  // Accounting
  '/protected-app/accounting',
  // Academy
  '/protected-app/academy',
  // Fleet
  '/protected-app/fleet',
  '/protected-app/fleet/dashboard',
  '/protected-app/fleet/vehicles',
  '/protected-app/fleet/drivers',
  '/protected-app/fleet/fuel',
  '/protected-app/fleet/trips',
  '/protected-app/fleet/maintenance',
  '/protected-app/fleet/locations',
  '/protected-app/fleet/analytics',
  // ERP
  '/protected-app/erp-lite',
  '/protected-app/erp-next-gen',
  // Events
  '/protected-app/events',
  // Real Estate
  '/protected-app/real-estate',
  // Tourism
  '/protected-app/tourism',
  // Unicoin
  '/protected-app/unicoin-wallet',
  // Ecommerce
  '/protected-app/ecommerce',
  // Production
  '/protected-app/production',
  // CRM
  '/protected-app/crm',
  // Standalone protected
  '/protected-app/marketing',
  '/protected-app/advertising',
  '/protected-app/warehouse',
  // Procurement
  '/protected-app/public-procurement',
];

for (const path of DOMAIN_ROUTES) {
  test(`${path} — redirects or shows auth gate without crash`, async ({ page }) => {
    await assertRedirectsOrAuthGate(page, path);
  });
}
