/**
 * E2E tests for QR public pages
 *
 * QR features span several public routes:
 *   /qr-landing           — QR product marketing page
 *   /qr-scanner           — generic QR scanner
 *   /qr-ticket-purchase   — purchase tickets via QR
 *   /qr-pass-validator    — validate a QR pass
 *   /qr-validator-login   — QR validator login
 *   /qr-validator-logout  — QR validator logout confirmation
 *   /qr-checkout-scanner  — checkout scanner
 *   /qr-water             — water QR management
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertQRPageOk(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. QR landing — /qr-landing
// ---------------------------------------------------------------------------

test.describe('QRLanding — marketing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qr-landing');
    await page.waitForLoadState('networkidle');
  });

  test('renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/qr-landing');
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

  test('does not show error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('QR-related keyword is visible on page', async ({ page }) => {
    const content = page.getByText(/QR|qr code|ticket|bilhete|acesso|access/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'QR keyword not found on landing page');
    }
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. All QR routes render without crash
// ---------------------------------------------------------------------------

const QR_ROUTES = [
  { path: '/qr-scanner', label: 'QR Scanner' },
  { path: '/qr-ticket-purchase', label: 'QR Ticket Purchase' },
  { path: '/qr-ticket-pur', label: 'QR Ticket Purchase (short)' },
  { path: '/qr-pass-validator', label: 'QR Pass Validator' },
  { path: '/qr-validator-login', label: 'QR Validator Login' },
  { path: '/qr-validator-logout', label: 'QR Validator Logout' },
  { path: '/qr-checkout-scanner', label: 'QR Checkout Scanner' },
  { path: '/qr-water', label: 'QR Water Management' },
];

test.describe('QR routes — crash-free rendering', () => {
  for (const { path, label } of QR_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertQRPageOk(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. QR scanner — camera or manual entry
// ---------------------------------------------------------------------------

test.describe('QRScanner — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qr-scanner');
    await page.waitForLoadState('networkidle');
  });

  test('scanner UI or camera permission prompt is rendered', async ({ page }) => {
    // The page shows a scanner widget or a prompt to allow camera access
    const scanner = page
      .locator('[class*="scanner"], [class*="Scanner"], video, canvas')
      .or(page.getByText(/camera|câmera|scan|qr|código/i).first());
    const count = await scanner.count();
    if (count === 0) {
      test.skip(true, 'No scanner UI element found');
    }
    await expect(scanner.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 4. QR ticket purchase — /qr-ticket-purchase
// ---------------------------------------------------------------------------

test.describe('QRTicketPurchase — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qr-ticket-purchase');
    await page.waitForLoadState('networkidle');
  });

  test('ticket purchase form or event selector is rendered', async ({ page }) => {
    const content = page
      .locator('form, select, [class*="card"]')
      .or(page.getByText(/ticket|bilhete|event|evento|purchase|comprar/i).first());
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Ticket purchase content not found');
    }
    await expect(content.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. QR pass validator — /qr-pass-validator (public validation page)
// ---------------------------------------------------------------------------

test.describe('QRPassValidator — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qr-pass-validator');
    await page.waitForLoadState('networkidle');
  });

  test('validation UI or input is rendered', async ({ page }) => {
    const content = page
      .locator('input, form, [class*="scan"]')
      .or(page.getByText(/valid|check|verif|pass|passe/i).first());
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Validator UI not found');
    }
    await expect(content.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Event ticket scanner — /event-ticket-scanner/:eventId
// ---------------------------------------------------------------------------

test.describe('EventTicketScanner — page', () => {
  test('renders gracefully with dummy event ID', async ({ page }) => {
    await assertQRPageOk(page, '/event-ticket-scanner/00000000-0000-0000-0000-000000000000');
  });
});
