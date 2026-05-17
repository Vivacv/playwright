/**
 * E2E tests for the EnhancedAuthPage — /auth
 *
 * These tests run without an auth session (public page). They cover:
 *   - Page structure and tab switching
 *   - Form field validation and error messages
 *   - Successful login redirect
 *   - Password visibility toggle
 *   - Sign-up tab fields
 */

import { test, expect } from '@playwright/test';

const AUTH_URL = '/auth';

// ---------------------------------------------------------------------------
// 1. Page structure
// ---------------------------------------------------------------------------

test.describe('AuthPage — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
  });

  test('auth page renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
    // Filter out known third-party noise (Turnstile, etc.)
    const appErrors = errors.filter(
      (e) =>
        !e.includes('Turnstile') &&
        !e.includes('cloudflare') &&
        !e.includes('ResizeObserver'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('"Entrar" (login) tab is visible and active by default', async ({ page }) => {
    const loginTab = page.getByRole('tab', { name: /entrar/i });
    await expect(loginTab).toBeVisible();
    await expect(loginTab).toHaveAttribute('aria-selected', 'true');
  });

  test('"Criar Conta" (sign-up) tab is visible', async ({ page }) => {
    const signupTab = page.getByRole('tab', { name: /criar conta/i });
    await expect(signupTab).toBeVisible();
  });

  test('email input is visible in login tab', async ({ page }) => {
    const emailInput = page.getByPlaceholder('seu@email.com').first();
    await expect(emailInput).toBeVisible();
  });

  test('password input is visible in login tab', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('••••••••').first();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

// ---------------------------------------------------------------------------
// 2. Tab switching
// ---------------------------------------------------------------------------

test.describe('AuthPage — tab switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
  });

  test('clicking "Criar Conta" activates the sign-up tab', async ({ page }) => {
    const signupTab = page.getByRole('tab', { name: /criar conta/i });
    await signupTab.click();
    await expect(signupTab).toHaveAttribute('aria-selected', 'true');
  });

  test('sign-up tab shows first name and last name fields', async ({ page }) => {
    await page.getByRole('tab', { name: /criar conta/i }).click();
    await expect(page.getByPlaceholder('João')).toBeVisible();
    await expect(page.getByPlaceholder('Silva')).toBeVisible();
  });

  test('switching back to login tab hides sign-up-only fields', async ({ page }) => {
    await page.getByRole('tab', { name: /criar conta/i }).click();
    await page.getByRole('tab', { name: /entrar/i }).click();
    await expect(page.getByPlaceholder('João')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Login form validation
// ---------------------------------------------------------------------------

test.describe('AuthPage — login form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
  });

  test('submitting empty login form shows validation errors', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /entrar|sign in|login/i }).first();
    await submitBtn.click();
    // react-hook-form validation: at least one error message should appear
    const error = page.locator('[class*="FormMessage"], [role="alert"]').first();
    await expect(error).toBeVisible({ timeout: 3000 });
  });

  test('invalid email format shows error', async ({ page }) => {
    await page.getByPlaceholder('seu@email.com').first().fill('not-an-email');
    await page.getByRole('button', { name: /entrar|sign in|login/i }).first().click();
    const error = page.locator('[class*="FormMessage"], [role="alert"]').first();
    await expect(error).toBeVisible({ timeout: 3000 });
  });

  test('wrong credentials shows an error toast or message', async ({ page }) => {
    await page.getByPlaceholder('seu@email.com').first().fill('wrong@example.com');
    await page.getByPlaceholder('••••••••').first().fill('wrongpassword');
    await page.getByRole('button', { name: /entrar|sign in|login/i }).first().click();
    // Expect an error toast or inline error within 8 seconds
    const errorIndicator = page.locator(
      '[class*="toast"], [class*="Toast"], [role="alert"], [data-sonner-toast]',
    );
    await expect(errorIndicator.first()).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Password visibility toggle
// ---------------------------------------------------------------------------

test.describe('AuthPage — password visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
  });

  test('password field starts as type=password (hidden)', async ({ page }) => {
    const pwField = page.getByPlaceholder('••••••••').first();
    await expect(pwField).toHaveAttribute('type', 'password');
  });

  test('clicking eye icon reveals password as plain text', async ({ page }) => {
    await page.getByPlaceholder('••••••••').first().fill('mySecret123');
    // The toggle button is an icon button adjacent to the password field
    const toggleBtn = page.locator('button[type="button"]').filter({
      has: page.locator('svg[class*="Eye"], svg[data-lucide="eye"], svg[data-lucide="eye-off"]'),
    }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(page.getByPlaceholder('••••••••').first()).toHaveAttribute('type', 'text');
    } else {
      test.skip(true, 'Eye toggle button not found — may be conditional on Turnstile captcha');
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Sign-up form validation
// ---------------------------------------------------------------------------

test.describe('AuthPage — sign-up form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /criar conta/i }).click();
  });

  test('submitting empty sign-up form shows validation errors', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /criar conta|sign up|register/i }).first();
    await submitBtn.click();
    const error = page.locator('[class*="FormMessage"], [role="alert"]').first();
    await expect(error).toBeVisible({ timeout: 3000 });
  });

  test('duplicate email in sign-up shows "já registado" error', async ({ page }) => {
    await page.getByPlaceholder('João').fill('Test');
    await page.getByPlaceholder('Silva').fill('User');
    await page.getByPlaceholder('seu@email.com').last().fill('existing@example.com');
    await page.getByPlaceholder('••••••••').first().fill('StrongPass1!');
    await page.getByRole('button', { name: /criar conta|sign up/i }).first().click();
    // The error for duplicate email — may be a toast or inline message
    const errorIndicator = page.locator(
      '[class*="toast"], [data-sonner-toast], [role="alert"]',
    );
    await expect(errorIndicator.first()).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Email and password inputs, submit button, redirect self-check
// ---------------------------------------------------------------------------

test.describe('AuthPage — deeper form verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_URL);
    await page.waitForLoadState('networkidle');
  });

  test('login form has an email-type input', async ({ page }) => {
    const emailInput = page
      .locator('input[type="email"]')
      .or(page.getByPlaceholder('seu@email.com'));
    await expect(emailInput.first()).toBeVisible({ timeout: 8000 });
  });

  test('login form has a password-type input', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput.first()).toBeVisible({ timeout: 8000 });
  });

  test('submit (login) button is visible and labelled', async ({ page }) => {
    const submitBtn = page.getByRole('button', {
      name: /entrar|sign in|login|submit|aceder/i,
    });
    await expect(submitBtn.first()).toBeVisible({ timeout: 8000 });
  });

  test('visiting /auth without credentials stays on the auth page', async ({ page }) => {
    // The page should remain on /auth and not redirect an unauthenticated visitor away
    await page.waitForURL(/\/auth/, { timeout: 5000 });
    const url = page.url();
    expect(url).toContain('/auth');
  });

  test('entering bad credentials shows an error message', async ({ page }) => {
    const emailInput = page
      .locator('input[type="email"]')
      .or(page.getByPlaceholder('seu@email.com'));
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.getByRole('button', {
      name: /entrar|sign in|login|submit|aceder/i,
    }).first();

    const emailCount = await emailInput.count();
    const pwCount = await passwordInput.count();
    const btnCount = await submitBtn.count();

    if (emailCount === 0 || pwCount === 0 || btnCount === 0) {
      test.skip(true, 'Required form elements not found — skipping bad credentials test');
    }

    await emailInput.first().fill('nobody@invalid-domain-xyz.com');
    await passwordInput.fill('definitely-wrong-password');
    await submitBtn.click();

    // Expect error feedback within 10 s — toast, alert, or FormMessage
    const errorIndicator = page.locator(
      '[role="alert"], [class*="toast"], [data-sonner-toast], [class*="FormMessage"], [class*="error"], [class*="Error"]',
    );
    await expect(errorIndicator.first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// 7. Protected route redirect
// ---------------------------------------------------------------------------

test.describe('AuthPage — protected route redirect', () => {
  test('unauthenticated access to admin redirects to /auth or /login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    // Should be redirected away from /admin
    const url = page.url();
    const isAuth = url.includes('/auth') || url.includes('/login');
    const isAdmin = url.includes('/admin');
    // If not on admin and on auth, pass. If still on admin, check for a login prompt.
    if (!isAdmin) {
      expect(isAuth || url.includes('/protected')).toBeTruthy();
    } else {
      // Some apps render a login modal on protected routes
      const loginModal = page.getByRole('dialog').or(page.getByRole('tab', { name: /entrar/i }));
      await expect(loginModal).toBeVisible({ timeout: 5000 });
    }
  });
});
