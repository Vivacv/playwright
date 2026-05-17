/**
 * E2E smoke tests for Project Management auth pages.
 *
 * Covers: /pm/login and /pm/register.
 * Verifies: no JS crash, form elements present, page is non-empty.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// /pm/login
// ---------------------------------------------------------------------------

test.describe('PM — /pm/login', () => {
  test('renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('page title is non-empty', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('body is non-empty', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('no crash error boundary', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /pm/register
// ---------------------------------------------------------------------------

test.describe('PM — /pm/register', () => {
  test('renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/pm/register');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('body is non-empty', async ({ page }) => {
    await page.goto('/pm/register');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('no crash error boundary', async ({ page }) => {
    await page.goto('/pm/register');
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

test.describe('PM Auth — form elements', () => {
  test('/pm/login has an email or username input field', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name*="email"], input[name*="user"], input[placeholder*="email" i], input[placeholder*="user" i]').first();
    const count = await page.locator('input[type="email"], input[name*="email"], input[name*="user"], input[placeholder*="email" i], input[placeholder*="user" i]').count();
    expect(count).toBeGreaterThan(0);
    await expect(emailInput).toBeVisible({ timeout: 8000 });
  });

  test('/pm/login has a password input field', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 8000 });
  });

  test('/pm/login has a submit button', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    const count = await page.locator('button[type="submit"], input[type="submit"]').count();
    if (count === 0) {
      // Fall back to any button if no explicit submit type
      const anyBtn = page.getByRole('button').first();
      await expect(anyBtn).toBeVisible({ timeout: 8000 });
    } else {
      await expect(submitBtn).toBeVisible({ timeout: 8000 });
    }
  });

  test('/pm/register has at least one input field', async ({ page }) => {
    await page.goto('/pm/register');
    await page.waitForLoadState('networkidle');

    const inputCount = await page.locator('input').count();
    expect(inputCount).toBeGreaterThan(0);
    await expect(page.locator('input').first()).toBeVisible({ timeout: 8000 });
  });

  test('link from login page to register (or vice versa) is present', async ({ page }) => {
    await page.goto('/pm/login');
    await page.waitForLoadState('networkidle');

    const registerLink = page.getByRole('link', { name: /register|sign up|cadastr|criar conta/i });
    const registerLinkCount = await registerLink.count();
    if (registerLinkCount > 0) {
      await expect(registerLink.first()).toBeVisible({ timeout: 8000 });
    } else {
      // Check from register page for a login link
      await page.goto('/pm/register');
      await page.waitForLoadState('networkidle');
      const loginLink = page.getByRole('link', { name: /login|sign in|entrar/i });
      const loginLinkCount = await loginLink.count();
      expect(loginLinkCount).toBeGreaterThan(0);
      await expect(loginLink.first()).toBeVisible({ timeout: 8000 });
    }
  });
});
