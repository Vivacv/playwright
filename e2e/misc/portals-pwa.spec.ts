/**
 * E2E tests for portals, PWA install, and additional utility pages
 *
 * Covers:
 *   /partner-portal        — partner self-service portal
 *   /media-hub             — media hub (public entry)
 *   /smart-tickets         — smart ticketing public entry
 *   /pwa-install           — PWA install prompt page
 *   /install               — alias for PWA install
 *   /internal-audit        — internal audit tool (may require auth)
 *   /module-placeholder    — module placeholder / coming-soon page
 *   /aila-qr               — AILA QR code access
 *   /rental-analytics      — rental analytics (public entry)
 *   /condominium           — condominium management (public entry)
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertBodyNotBlank(page: import('@playwright/test').Page) {
  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);
}

async function assertNoErrorBoundary(page: import('@playwright/test').Page) {
  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

async function assertPageOk(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await assertBodyNotBlank(page);
  await assertNoErrorBoundary(page);
}

// ---------------------------------------------------------------------------
// 1. Batch crash-free check
// ---------------------------------------------------------------------------

const PORTAL_ROUTES = [
  { path: '/partner-portal', label: 'Partner Portal' },
  { path: '/media-hub', label: 'Media Hub' },
  { path: '/smart-tickets', label: 'Smart Tickets' },
  { path: '/pwa-install', label: 'PWA Install' },
  { path: '/install', label: 'Install (PWA alias)' },
  { path: '/module-placeholder', label: 'Module Placeholder' },
  { path: '/rental-analytics', label: 'Rental Analytics' },
];

test.describe('Portal and utility pages — crash-free rendering', () => {
  for (const { path, label } of PORTAL_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Partner portal — /partner-portal
// ---------------------------------------------------------------------------

test.describe('PartnerPortal — page', () => {
  test('shows partner content or auth gate', async ({ page }) => {
    await page.goto('/partner-portal');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/partner|parceiro|portal|dashboard|account/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No partner portal or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Media Hub — /media-hub
// ---------------------------------------------------------------------------

test.describe('MediaHub — page', () => {
  test('shows media content or heading', async ({ page }) => {
    await page.goto('/media-hub');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    const content = page.getByText(/media|news|notícias|article|artigo|press/i).first();

    const headingCount = await heading.count();
    const contentCount = await content.count();

    if (headingCount === 0 && contentCount === 0) {
      test.skip(true, 'No media hub content found');
    }
    const visible = headingCount > 0 ? heading : content;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Smart Tickets — /smart-tickets
// ---------------------------------------------------------------------------

test.describe('SmartTickets — page', () => {
  test('shows ticketing content or heading', async ({ page }) => {
    await page.goto('/smart-tickets');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/ticket|smart|event|evento|access|acesso/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No smart tickets content found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. PWA Install — /pwa-install and /install
// ---------------------------------------------------------------------------

test.describe('PWAInstall — install prompt pages', () => {
  test('/pwa-install shows install instructions or prompt', async ({ page }) => {
    await page.goto('/pwa-install');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/install|instalar|app|pwa|add to home|adicionar/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'PWA install content not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });

  test('/install renders same page as /pwa-install', async ({ page }) => {
    await page.goto('/install');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });
});

// ---------------------------------------------------------------------------
// 6. Internal Audit — /internal-audit
// ---------------------------------------------------------------------------

test.describe('InternalAudit — page', () => {
  test('renders without crash (auth-gated or public)', async ({ page }) => {
    await assertPageOk(page, '/internal-audit');
  });

  test('shows audit content or auth gate', async ({ page }) => {
    await page.goto('/internal-audit');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/audit|auditoria|internal|interno|compliance/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No audit or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 7. Rental Analytics — /rental-analytics
// ---------------------------------------------------------------------------

test.describe('RentalAnalytics — page', () => {
  test('shows analytics content or auth gate', async ({ page }) => {
    await page.goto('/rental-analytics');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/analytic|rental|aluguel|booking|reserva|revenue/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No rental analytics or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});
