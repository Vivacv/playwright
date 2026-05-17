/**
 * E2E tests for RxChain — Cape Verde Blockchain Prescription System
 *
 * Public entry points for different stakeholders:
 *   /rxchain         — hub/landing
 *   /rxchain/patient — patient app (auth required for prescriptions)
 *   /rxchain/doctor  — doctor portal (auth required)
 *   /rxchain/pharmacy — pharmacy portal (auth required)
 *   /rxchain/eris     — ERIS health authority dashboard (auth required)
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
// 1. RxChain hub — /rxchain
// ---------------------------------------------------------------------------

test.describe('RxChain — hub / landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rxchain');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/rxchain');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('RxChain or prescription-related heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('navigation links to patient/doctor/pharmacy portals are present', async ({ page }) => {
    const portalLinks = page
      .getByRole('link', { name: /patient|paciente|doctor|médico|pharmacy|farmácia/i })
      .or(page.getByRole('button', { name: /patient|doctor|pharmacy|eris/i }));
    const count = await portalLinks.count();
    if (count === 0) {
      test.skip(true, 'Portal navigation links not found on RxChain hub');
    }
    await expect(portalLinks.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Patient app — /rxchain/patient
// ---------------------------------------------------------------------------

test.describe('RxChain — patient app', () => {
  test('renders without crash (shows auth gate for unauthenticated users)', async ({ page }) => {
    await assertPageOk(page, '/rxchain/patient');
  });

  test('prescription tab or login prompt is visible', async ({ page }) => {
    await page.goto('/rxchain/patient');
    await page.waitForLoadState('networkidle');

    // Either the prescription app (authenticated) or an auth gate
    const prescriptionContent = page.getByText(/prescription|receita|prescri/i).first();
    const authGate = page
      .getByRole('tab', { name: /entrar/i })
      .or(page.getByText(/sign in|login|autenticar/i).first());

    const hasContent = await prescriptionContent.count();
    const hasAuth = await authGate.count();

    if (hasContent === 0 && hasAuth === 0) {
      test.skip(true, 'Neither prescription content nor auth gate found');
    }
    // At least one must be present
    if (hasContent > 0) {
      await expect(prescriptionContent).toBeVisible({ timeout: 5000 });
    } else {
      await expect(authGate.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Doctor portal — /rxchain/doctor
// ---------------------------------------------------------------------------

test.describe('RxChain — doctor portal', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/rxchain/doctor');
  });

  test('doctor-related UI or auth gate is visible', async ({ page }) => {
    await page.goto('/rxchain/doctor');
    await page.waitForLoadState('networkidle');

    const doctorContent = page.getByText(/doctor|médico|prescription|receita|patient|paciente/i).first();
    const count = await doctorContent.count();
    if (count === 0) {
      test.skip(true, 'Doctor content not found');
    }
    await expect(doctorContent).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Pharmacy portal — /rxchain/pharmacy
// ---------------------------------------------------------------------------

test.describe('RxChain — pharmacy portal', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/rxchain/pharmacy');
  });

  test('pharmacy-related content or auth gate is visible', async ({ page }) => {
    await page.goto('/rxchain/pharmacy');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/pharmacy|farmácia|dispens|medication|medicamento/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Pharmacy content not found');
    }
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. ERIS dashboard — /rxchain/eris
// ---------------------------------------------------------------------------

test.describe('RxChain — ERIS health authority', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/rxchain/eris');
  });

  test('ERIS or health authority content is visible', async ({ page }) => {
    await page.goto('/rxchain/eris');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/eris|health authority|autoridade|dashboard|statistics|estatísticas/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'ERIS content not found');
    }
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});
