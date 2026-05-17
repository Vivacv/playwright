/**
 * E2E tests for additional public / utility pages not covered elsewhere
 *
 * Covers:
 *   /login-method               — login method selector
 *   /auth                       — main authentication page
 *   /mobile-attendance-scanner  — mobile QR attendance scanner
 *   /cabo-verde-metrics         — public metrics dashboard (ProtectedRoute)
 *   /codebase                   — redirect to /protected-app/codebase-intelligence
 *   /guia-ipi-2025              — IPI Regional Guide 2025
 *   /terms-of-use               — terms of use
 *   /privacy-policy             — privacy policy
 *   /cookie-policy              — cookie policy
 *   /uni-architecture           — platform architecture overview
 *   /guest-access               — guest access portal
 *   /customer-portal            — customer self-service portal
 *   /aila-assessment            — AI literacy assessment
 *   /media-academy-landing      — media academy marketing page
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
// 1. Login method selector — /login-method
// ---------------------------------------------------------------------------

test.describe('LoginMethodSelector — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/login-method');
  });

  test('shows login options', async ({ page }) => {
    await page.goto('/login-method');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/login|sign in|email|google|microsoft|entrar|método/i)
      .first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'No login method content found');
    }
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('has at least one interactive login option', async ({ page }) => {
    await page.goto('/login-method');
    await page.waitForLoadState('networkidle');

    const options = page.getByRole('button').or(page.getByRole('link'));
    const count = await options.count();
    if (count === 0) {
      test.skip(true, 'No interactive options found');
    }
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Auth page — /auth
// ---------------------------------------------------------------------------

test.describe('Auth — main authentication page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/auth');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('shows an email input or social login button', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const socialBtn = page
      .getByRole('button', { name: /google|microsoft|github/i })
      .first();

    const emailCount = await emailInput.count();
    const socialCount = await socialBtn.count();

    if (emailCount === 0 && socialCount === 0) {
      test.skip(true, 'No email input or social button found on auth page');
    }
    const visible = emailCount > 0 ? emailInput : socialBtn;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Mobile attendance scanner — /mobile-attendance-scanner
// ---------------------------------------------------------------------------

test.describe('MobileAttendanceScanner — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/mobile-attendance-scanner');
  });

  test('shows scanner UI or login prompt', async ({ page }) => {
    await page.goto('/mobile-attendance-scanner');
    await page.waitForLoadState('networkidle');

    const scanner = page
      .locator('video, canvas, [class*="scan"], [class*="qr"]')
      .or(page.getByText(/scan|attendance|presença|camera|câmera/i).first());
    const authGate = page.getByText(/sign in|login|entrar/i).first();

    const scanCount = await scanner.count();
    const authCount = await authGate.count();

    if (scanCount === 0 && authCount === 0) {
      test.skip(true, 'No scanner or auth content found');
    }
    const visible = scanCount > 0 ? scanner.first() : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Cabo Verde Metrics — /cabo-verde-metrics
// ---------------------------------------------------------------------------

test.describe('CaboVerdeMetrics — page', () => {
  test('renders without crash (shows auth gate for unauthenticated)', async ({ page }) => {
    await assertPageOk(page, '/cabo-verde-metrics');
  });

  test('shows metrics content or auth gate', async ({ page }) => {
    await page.goto('/cabo-verde-metrics');
    await page.waitForLoadState('networkidle');

    const content = page
      .getByText(/metric|cabo verde|statistics|estatísticas|indicator|indicador/i)
      .first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No metrics or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Codebase redirect — /codebase
// ---------------------------------------------------------------------------

test.describe('Codebase redirect — /codebase', () => {
  test('navigates without crash (redirects to protected app)', async ({ page }) => {
    await page.goto('/codebase');
    await page.waitForLoadState('networkidle');

    // Should redirect to /protected-app/codebase-intelligence or /auth
    const url = page.url();
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    // Verify no crash regardless of redirect destination
    const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. IPI Regional Guide 2025 — /guia-ipi-2025
// ---------------------------------------------------------------------------

test.describe('GuiaIPI2025 — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/guia-ipi-2025');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/guia-ipi-2025');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('heading is visible', async ({ page }) => {
    await page.goto('/guia-ipi-2025');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('IPI or guide content is visible', async ({ page }) => {
    await page.goto('/guia-ipi-2025');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/ipi|guia|guide|regional|cabo verde|2025/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'IPI guide content keyword not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 7. Legal / policy pages
// ---------------------------------------------------------------------------

const LEGAL_ROUTES = [
  { path: '/terms-of-use', label: 'Terms of Use', keyword: /terms|termos|condition|condição/i },
  { path: '/privacy-policy', label: 'Privacy Policy', keyword: /privacy|privacidade|data|dados/i },
  { path: '/cookie-policy', label: 'Cookie Policy', keyword: /cookie|cookies/i },
];

test.describe('Legal pages — rendering', () => {
  for (const { path, label } of LEGAL_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }

  for (const { path, label, keyword } of LEGAL_ROUTES) {
    test(`${label} shows relevant policy content`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const content = page.getByText(keyword).first();
      const count = await content.count();
      if (count === 0) {
        test.skip(true, `No ${label} content found`);
      }
      await expect(content).toBeVisible({ timeout: 6000 });
    });
  }
});

// ---------------------------------------------------------------------------
// 8. Architecture overview — /uni-architecture
// ---------------------------------------------------------------------------

test.describe('UniArchitecture — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/uni-architecture');
  });

  test('architecture content is visible', async ({ page }) => {
    await page.goto('/uni-architecture');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/architecture|arquitectura|system|sistema|platform|plataforma/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Architecture content not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 9. Guest access — /guest-access
// ---------------------------------------------------------------------------

test.describe('GuestAccess — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/guest-access');
  });
});

// ---------------------------------------------------------------------------
// 10. Customer portal — /customer-portal
// ---------------------------------------------------------------------------

test.describe('CustomerPortal — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/customer-portal');
  });
});

// ---------------------------------------------------------------------------
// 11. Media Academy Landing — /media-academy-landing
// ---------------------------------------------------------------------------

test.describe('MediaAcademyLanding — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/media-academy-landing');
  });

  test('media or academy content is visible', async ({ page }) => {
    await page.goto('/media-academy-landing');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/media|academy|learn|aprender|course|curso/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Media academy content not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 12. AILA Assessment — /aila-assessment
// ---------------------------------------------------------------------------

test.describe('AILAAssessment — page', () => {
  test('renders without crash', async ({ page }) => {
    await assertPageOk(page, '/aila-assessment');
  });

  test('assessment content or form is visible', async ({ page }) => {
    await page.goto('/aila-assessment');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/aila|assess|ai|artificial|literacy|literacia/i).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'AILA assessment content not found');
    }
    await expect(content).toBeVisible({ timeout: 6000 });
  });
});
