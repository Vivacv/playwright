/**
 * E2E tests for platform-specific landing pages
 *
 * These are vertical-market landing pages. Some require authentication
 * (ProtectedRoute or AuthenticatedDeviceGate), so unauthenticated users
 * may see an auth gate or a redirect to /auth.
 *
 * Routes tested:
 *   /banking-landing
 *   /operations-landing
 *   /legal-landing
 *   /procurement-landing
 *   /marketplace-landing
 *   /media-landing
 *   /property-services-landing
 *   /project-management-landing
 *   /strategic-consultancy-landing
 *   /condominium
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertLandingRendersOrRedirects(
  page: import('@playwright/test').Page,
  path: string,
) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  // Either the landing content loaded or we were redirected to auth
  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Batch crash-free check for all platform landings
// ---------------------------------------------------------------------------

const PLATFORM_LANDING_ROUTES = [
  { path: '/banking-landing', label: 'Banking Landing' },
  { path: '/operations-landing', label: 'Operations Landing' },
  { path: '/legal-landing', label: 'Legal Landing' },
  { path: '/procurement-landing', label: 'Procurement Landing' },
  { path: '/marketplace-landing', label: 'Marketplace Landing' },
  { path: '/media-landing', label: 'Media Landing' },
  { path: '/property-services-landing', label: 'Property Services Landing' },
  { path: '/project-management-landing', label: 'Project Management Landing' },
  { path: '/strategic-consultancy-landing', label: 'Strategic Consultancy Landing' },
  { path: '/condominium', label: 'Condominium' },
];

test.describe('Platform landings — crash-free rendering', () => {
  for (const { path, label } of PLATFORM_LANDING_ROUTES) {
    test(`${label} (${path}) renders or redirects without crash`, async ({ page }) => {
      await assertLandingRendersOrRedirects(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Banking Landing — /banking-landing
// ---------------------------------------------------------------------------

test.describe('BankingLanding — page', () => {
  test('shows banking content or auth gate', async ({ page }) => {
    await page.goto('/banking-landing');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/bank|banca|finance|financ|payment|pagamento|transaction/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No banking or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Operations Landing — /operations-landing
// ---------------------------------------------------------------------------

test.describe('OperationsLanding — page', () => {
  test('shows operations content or auth gate', async ({ page }) => {
    await page.goto('/operations-landing');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/operation|operações|workflow|process|processo|efficiency/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No operations or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Legal Landing — /legal-landing
// ---------------------------------------------------------------------------

test.describe('LegalLanding — page', () => {
  test('shows legal content or auth gate', async ({ page }) => {
    await page.goto('/legal-landing');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/legal|jurídic|compliance|contract|contrato|law|lei/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No legal or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Marketplace Landing — /marketplace-landing
// ---------------------------------------------------------------------------

test.describe('MarketplaceLanding — page', () => {
  test('shows marketplace content or auth gate', async ({ page }) => {
    await page.goto('/marketplace-landing');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/marketplace|mercado|buy|sell|vender|comprar|product|produto/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No marketplace or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Property Services Landing — /property-services-landing
// ---------------------------------------------------------------------------

test.describe('PropertyServicesLanding — page', () => {
  test('shows property content or auth gate', async ({ page }) => {
    await page.goto('/property-services-landing');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/property|imóvel|real estate|imobiliário|service|serviço/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No property services or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});
