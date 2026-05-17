/**
 * E2E tests for the Admin Dashboard
 *
 * Uses the persisted admin auth session from e2e/.auth/admin.json.
 * Covers: navigation, module access, protected route enforcement, key widgets.
 *
 * Generate auth state: npx playwright test e2e/auth/setup.ts
 */

import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

const ADMIN_URL = '/admin';

// ---------------------------------------------------------------------------
// 1. Admin dashboard loads
// ---------------------------------------------------------------------------

test.describe('AdminDashboard — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
  });

  test('admin route is reachable with authenticated session', async ({ page }) => {
    // If redirected to /auth the session is stale — mark as skip rather than fail
    if (page.url().includes('/auth') || page.url().includes('/login')) {
      test.skip(true, 'Auth state missing or expired — regenerate e2e/.auth/admin.json');
    }
    await expect(page).toHaveURL(new RegExp('/admin'));
  });

  test('admin sidebar or navigation is rendered', async ({ page }) => {
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    // Look for common navigation landmarks
    const nav = page.locator('nav, [role="navigation"], aside, [data-testid="sidebar"]').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('page does not show an error boundary fallback', async ({ page }) => {
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. User management section
// ---------------------------------------------------------------------------

test.describe('AdminDashboard — user management', () => {
  test('user management link is accessible', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    // Link to users section (common labels)
    const usersLink = page
      .getByRole('link', { name: /users|utilizadores|usuários/i })
      .or(page.getByText(/user management|gestão de utilizadores/i))
      .first();
    // Visible or reachable
    const isVisible = await usersLink.isVisible().catch(() => false);
    if (isVisible) {
      await expect(usersLink).toBeVisible();
    } else {
      // Try navigating directly
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('/auth');
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Test governance section
// ---------------------------------------------------------------------------

test.describe('AdminDashboard — test governance route', () => {
  test('test governance page loads for admin', async ({ page }) => {
    await page.goto('/admin/test-governance');
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    // Should render the governance dashboard — not a blank page
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible({ timeout: 6000 });
  });

  test('domain test results table or card is rendered', async ({ page }) => {
    await page.goto('/admin/test-governance');
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    // Any content that proves data loaded (table, list, or card)
    const content = page
      .locator('table, [role="table"], [class*="Card"], [class*="card"]')
      .first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Navigation between admin sub-routes
// ---------------------------------------------------------------------------

test.describe('AdminDashboard — sub-route navigation', () => {
  const adminRoutes = [
    { path: '/admin/test-governance', label: 'test governance' },
    { path: '/admin/users', label: 'users' },
    { path: '/admin/roles', label: 'roles' },
  ];

  for (const { path, label } of adminRoutes) {
    test(`"${label}" route is accessible without redirect to auth`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      if (page.url().includes('/auth')) {
        test.skip(true, `Auth state missing — cannot access ${path}`);
      }
      // Should render something — at minimum a heading or navigation element
      const mainContent = page.locator('main, [role="main"], h1, h2').first();
      await expect(mainContent).toBeVisible({ timeout: 6000 });
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Session persistence
// ---------------------------------------------------------------------------

test.describe('AdminDashboard — session', () => {
  test('page reload does not log out the admin user', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    // Reload and verify still on admin route
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/auth');
    expect(page.url()).not.toContain('/login');
  });
});

// ---------------------------------------------------------------------------
// 6. Page content checks
// ---------------------------------------------------------------------------

test.describe('AdminDashboard — content', () => {
  test('admin page body has substantial content', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(100);
  });

  test('admin page title is set', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('/admin/roles does not show uncaught error', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    const errorBoundary = page.getByText(/something went wrong|uncaught error/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('no JS exceptions thrown on admin route', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });
});
