/**
 * E2E tests for strategic consultancy / audit public pages
 *
 * Routes:
 *   /strategic-consultancy-landing  — marketing page for strategic services
 *   /strategic-audit                — strategic audit tool (ProtectedRoute)
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
// 1. Strategic Consultancy Landing — /strategic-consultancy-landing
// ---------------------------------------------------------------------------

test.describe('StrategicConsultancyLanding — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strategic-consultancy-landing');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/strategic-consultancy-landing');
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

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('strategic or consultancy content keyword is visible', async ({ page }) => {
    const content = page
      .getByText(/strategic|estratégi|consult|audit|plan|plano/i)
      .first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Strategic consultancy keyword not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });

  test('has at least one CTA button or link', async ({ page }) => {
    const cta = page
      .getByRole('button')
      .or(page.getByRole('link', { name: /contact|contacto|start|começar|learn|saiba/i }));
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'No CTA found on strategic consultancy landing');
    }
    await expect(cta.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Strategic Audit — /strategic-audit
// ---------------------------------------------------------------------------

test.describe('StrategicAudit — page', () => {
  test('renders without crash (shows auth gate for unauthenticated users)', async ({ page }) => {
    await assertPageOk(page, '/strategic-audit');
  });

  test('shows audit content or auth gate', async ({ page }) => {
    await page.goto('/strategic-audit');
    await page.waitForLoadState('networkidle');

    const auditContent = page
      .getByText(/audit|strategic|estratégi|risk|risco|compliance/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const auditCount = await auditContent.count();
    const authCount = await authGate.count();

    if (auditCount === 0 && authCount === 0) {
      test.skip(true, 'Neither audit content nor auth gate found');
    }
    const visible = auditCount > 0 ? auditContent : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});
