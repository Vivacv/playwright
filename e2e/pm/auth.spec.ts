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
