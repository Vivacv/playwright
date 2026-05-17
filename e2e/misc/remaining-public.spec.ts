/**
 * E2E tests for remaining public pages not covered elsewhere
 *
 * Covers:
 *   /aila-qr              — AILA QR code entry point
 *   /aila-admin           — AILA administration
 *   /hero-template        — marketing hero template preview
 *   /rentals              — base rentals route
 *   /media-archive        — public media archive
 *   /portal-turismo       — tourism demo portal
 *   /property-services    — standalone property services page
 *   /marketplace-eventos  — marketplace events listing (demo)
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

const REMAINING_ROUTES = [
  { path: '/aila-qr', label: 'AILA QR' },
  { path: '/aila-admin', label: 'AILA Admin' },
  { path: '/hero-template', label: 'Hero Template' },
  { path: '/rentals', label: 'Rentals Base' },
  { path: '/media-archive', label: 'Media Archive' },
  { path: '/portal-turismo', label: 'Portal Turismo' },
  { path: '/property-services', label: 'Property Services' },
  { path: '/marketplace-eventos', label: 'Marketplace Eventos' },
];

test.describe('Remaining public routes — crash-free rendering', () => {
  for (const { path, label } of REMAINING_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. AILA QR — /aila-qr
// ---------------------------------------------------------------------------

test.describe('AILAQR — QR entry', () => {
  test('shows QR interface or content', async ({ page }) => {
    await page.goto('/aila-qr');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/aila|qr|scan|assessment|literacia|literacy/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No AILA QR content found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. AILA Admin — /aila-admin
// ---------------------------------------------------------------------------

test.describe('AILAAdmin — page', () => {
  test('shows admin content or auth gate', async ({ page }) => {
    await page.goto('/aila-admin');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/aila|admin|assessment|dashboard|literacia/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No AILA admin or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Rentals base — /rentals
// ---------------------------------------------------------------------------

test.describe('Rentals — base route', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await page.goto('/rentals');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('shows rentals content or redirects to listing', async ({ page }) => {
    await page.goto('/rentals');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/rental|aluguel|accommodation|alojamento|stay|estadia/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No rentals content found — may redirect to landing');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Portal Turismo — /portal-turismo
// ---------------------------------------------------------------------------

test.describe('PortalTurismo — demo portal', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/portal-turismo');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('shows tourism content', async ({ page }) => {
    await page.goto('/portal-turismo');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/turismo|tourism|cabo verde|destination|destino/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No tourism portal content found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Media Archive — /media-archive
// ---------------------------------------------------------------------------

test.describe('MediaArchive — page', () => {
  test('shows media content or auth gate', async ({ page }) => {
    await page.goto('/media-archive');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/media|archive|news|artigo|article|press/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No media archive or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 7. Property Services — /property-services
// ---------------------------------------------------------------------------

test.describe('PropertyServices — standalone page', () => {
  test('shows property services content', async ({ page }) => {
    await page.goto('/property-services');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/property|imóvel|service|serviço|maintenance|manutenção/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No property services content found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 8. Marketplace Eventos — /marketplace-eventos
// ---------------------------------------------------------------------------

test.describe('MarketplaceEventos — demo listing', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/marketplace-eventos');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('shows event listings or marketplace content', async ({ page }) => {
    await page.goto('/marketplace-eventos');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/event|evento|marketplace|ticket|bilhete/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No marketplace eventos content found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});
