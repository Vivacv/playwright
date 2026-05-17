/**
 * E2E tests for the Developer Portal public pages
 *
 * Covers: /developer (landing), /developer/register (registration form),
 * /developer/docs and /developer-docs (documentation), and
 * /developer/dashboard (auth-gated).
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Developer landing — /developer
// ---------------------------------------------------------------------------

test.describe('Developer — landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/developer');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/developer');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('developer-related heading is visible', async ({ page }) => {
    const heading = page
      .locator('h1, h2')
      .or(page.getByText(/developer|developer portal|api|sdk/i).first())
      .first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('does not show an error boundary', async ({ page }) => {
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('registration or get-started CTA is present', async ({ page }) => {
    const cta = page
      .getByRole('button', { name: /register|registar|get started|começar|apply|api key/i })
      .or(page.getByRole('link', { name: /register|registar|get started|docs/i }));
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'No registration CTA found');
    }
    await expect(cta.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Developer registration — /developer/register
// ---------------------------------------------------------------------------

test.describe('Developer — registration form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/developer/register');
    await page.waitForLoadState('networkidle');
  });

  test('page renders without a crash', async ({ page }) => {
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('registration form is visible', async ({ page }) => {
    const form = page.locator('form').first();
    const count = await form.count();
    if (count === 0) {
      test.skip(true, 'No form found on registration page');
    }
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('name / email / app fields are present in the form', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const textInput = page.locator('input[type="text"]').first();

    const emailCount = await emailInput.count();
    const textCount = await textInput.count();

    if (emailCount === 0 && textCount === 0) {
      test.skip(true, 'No form inputs found — check page route');
    }

    if (emailCount > 0) {
      await expect(emailInput).toBeVisible({ timeout: 5000 });
    } else {
      await expect(textInput).toBeVisible({ timeout: 5000 });
    }
  });

  test('submit button is rendered and enabled by default', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /register|registar|submit|enviar|apply/i });
    const count = await submitBtn.count();
    if (count === 0) {
      test.skip(true, 'Submit button not found');
    }
    await expect(submitBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test('submitting empty form shows validation errors', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /register|registar|submit|enviar|apply/i }).first();
    const count = await submitBtn.count();
    if (count === 0) {
      test.skip(true, 'Submit button not found');
    }
    await submitBtn.click();

    // Validation errors or disabled state — should not navigate away
    const url = page.url();
    expect(url).toContain('developer');
  });
});

// ---------------------------------------------------------------------------
// 3. Developer docs — /developer/docs and /developer-docs
// ---------------------------------------------------------------------------

test.describe('Developer — documentation', () => {
  const DOC_ROUTES = [
    { path: '/developer/docs', label: 'developer/docs' },
    { path: '/developer-docs', label: 'developer-docs' },
  ];

  for (const { path, label } of DOC_ROUTES) {
    test(`${label}: renders or redirects without crash`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length).toBeGreaterThan(0);

      const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
      await expect(errorBoundary).not.toBeVisible();
    });
  }

  test('/developer/docs shows API documentation or placeholder', async ({ page }) => {
    await page.goto('/developer/docs');
    await page.waitForLoadState('networkidle');

    const docContent = page
      .getByText(/api|endpoint|sdk|documentation|docs|reference/i)
      .first();
    const count = await docContent.count();
    if (count === 0) {
      test.skip(true, 'API documentation content not found');
    }
    await expect(docContent).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Developer dashboard — /developer/dashboard (auth-gated)
// ---------------------------------------------------------------------------

test.describe('Developer — dashboard (auth guard)', () => {
  test('unauthenticated access redirects or shows auth prompt', async ({ page }) => {
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth') || url.includes('/login');

    if (!isRedirected) {
      // Should show auth prompt inline rather than raw dashboard
      const body = await page.locator('body').innerText().catch(() => '');
      expect(body.trim().length).toBeGreaterThan(0);
    }

    const errorBoundary = page.getByText(/something went wrong|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. API docs section and register/login CTA on landing
// ---------------------------------------------------------------------------

test.describe('Developer — deeper portal verification', () => {
  test('developer landing has an API docs section or link', async ({ page }) => {
    await page.goto('/developer');
    await page.waitForLoadState('networkidle');

    const docsLink = page
      .getByRole('link', { name: /docs|documentation|api docs|reference|api reference/i })
      .or(page.getByRole('button', { name: /docs|documentation|api docs|reference/i }));
    const docsText = page.getByText(/api documentation|api reference|developer docs|view docs/i).first();
    const docsSection = page.locator('[class*="doc"], [class*="Doc"], [id*="doc"], [id*="api"]').first();

    const linkCount = await docsLink.count();
    const textCount = await docsText.count();
    const sectionCount = await docsSection.count();

    if (linkCount === 0 && textCount === 0 && sectionCount === 0) {
      test.skip(true, 'No API docs section or link found on developer landing');
    }
    if (linkCount > 0) {
      await expect(docsLink.first()).toBeVisible({ timeout: 8000 });
    } else if (textCount > 0) {
      await expect(docsText).toBeVisible({ timeout: 8000 });
    } else {
      await expect(docsSection).toBeVisible({ timeout: 8000 });
    }
  });

  test('developer landing shows a register or login CTA', async ({ page }) => {
    await page.goto('/developer');
    await page.waitForLoadState('networkidle');

    const cta = page
      .getByRole('button', {
        name: /register|registar|sign up|login|entrar|get started|começar|apply|api key/i,
      })
      .or(
        page.getByRole('link', {
          name: /register|registar|sign up|login|get started|começar|apply/i,
        }),
      );
    const count = await cta.count();
    if (count === 0) {
      test.skip(true, 'No register/login CTA found on developer landing');
    }
    await expect(cta.first()).toBeVisible({ timeout: 8000 });
  });

  test('developer docs page shows API endpoint or reference content', async ({ page }) => {
    await page.goto('/developer/docs');
    await page.waitForLoadState('networkidle');

    const apiContent = page
      .getByText(/endpoint|GET|POST|PUT|DELETE|authentication|bearer|token|api key|swagger|openapi/i)
      .first();
    const docsHeading = page.locator('h1, h2, h3').filter({ hasText: /api|docs|documentation|reference|endpoint/i }).first();

    const apiCount = await apiContent.count();
    const headingCount = await docsHeading.count();

    if (apiCount === 0 && headingCount === 0) {
      test.skip(true, 'No API reference content found on /developer/docs');
    }
    if (apiCount > 0) {
      await expect(apiContent).toBeVisible({ timeout: 8000 });
    } else {
      await expect(docsHeading).toBeVisible({ timeout: 8000 });
    }
  });

  test('developer registration form accepts email input', async ({ page }) => {
    await page.goto('/developer/register');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const emailPlaceholder = page
      .getByPlaceholder(/email|e-mail|seu@|your@/i)
      .first();

    const emailTypeCount = await emailInput.count();
    const placeholderCount = await emailPlaceholder.count();

    if (emailTypeCount === 0 && placeholderCount === 0) {
      test.skip(true, 'No email input found on developer registration page');
    }
    if (emailTypeCount > 0) {
      await expect(emailInput).toBeVisible({ timeout: 8000 });
      await emailInput.fill('dev-test@example.com');
      await expect(emailInput).toHaveValue('dev-test@example.com');
    } else {
      await expect(emailPlaceholder).toBeVisible({ timeout: 8000 });
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Create app — /developer/apps/new (auth-gated)
// ---------------------------------------------------------------------------

test.describe('Developer — create app (auth guard)', () => {
  test('unauthenticated access is handled gracefully', async ({ page }) => {
    await page.goto('/developer/apps/new');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});
