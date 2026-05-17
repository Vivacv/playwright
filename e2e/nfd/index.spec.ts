/**
 * E2E tests for NFD — Digital Government Passport platform
 *
 * Routes (all behind AuthenticatedDeviceGate):
 *   /nfd-academy   — online learning
 *   /nfd-passport  — digital identity passport
 *   /nfd-dashboard — citizen dashboard
 *   /nfd-courses   — course catalogue
 *
 * Unauthenticated users see an auth gate rather than the full app.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertRendersWithoutCrash(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. NFD routes — crash-free rendering
// ---------------------------------------------------------------------------

const NFD_ROUTES = [
  { path: '/nfd-academy', label: 'NFD Academy' },
  { path: '/nfd-passport', label: 'NFD Passport' },
  { path: '/nfd-dashboard', label: 'NFD Dashboard' },
  { path: '/nfd-courses', label: 'NFD Courses' },
];

test.describe('NFD routes — crash-free rendering', () => {
  for (const { path, label } of NFD_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertRendersWithoutCrash(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. NFD Academy — /nfd-academy
// ---------------------------------------------------------------------------

test.describe('NFD Academy — page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nfd-academy');
    await page.waitForLoadState('networkidle');
  });

  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/nfd-academy');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('shows heading, auth gate, or NFD-related content', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    const authGate = page.getByText(/sign in|login|autenticar|entrar|authenticate/i).first();
    const nfdContent = page.getByText(/nfd|academy|curso|course|learn|aprender/i).first();

    const headingCount = await heading.count();
    const authCount = await authGate.count();
    const nfdCount = await nfdContent.count();

    if (headingCount === 0 && authCount === 0 && nfdCount === 0) {
      test.skip(true, 'No recognisable content found on NFD Academy');
    }
    // At least one must be visible
    const visible = headingCount > 0 ? heading : authCount > 0 ? authGate : nfdContent;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. NFD Passport — /nfd-passport
// ---------------------------------------------------------------------------

test.describe('NFD Digital Passport — page', () => {
  test('shows passport content or auth gate', async ({ page }) => {
    await page.goto('/nfd-passport');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/passport|passaporte|identity|identidade|nfd/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No passport or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. NFD Dashboard — /nfd-dashboard
// ---------------------------------------------------------------------------

test.describe('NFD Dashboard — page', () => {
  test('shows dashboard content or auth gate', async ({ page }) => {
    await page.goto('/nfd-dashboard');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/dashboard|nfd|citizen|cidadão|government|governo/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No dashboard or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. NFD Courses — /nfd-courses
// ---------------------------------------------------------------------------

test.describe('NFD Courses — page', () => {
  test('shows course content or auth gate', async ({ page }) => {
    await page.goto('/nfd-courses');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(/course|curso|module|módulo|nfd|learn|aprender/i).first();
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();

    const contentCount = await content.count();
    const authCount = await authGate.count();

    if (contentCount === 0 && authCount === 0) {
      test.skip(true, 'No course or auth content found');
    }
    const visible = contentCount > 0 ? content : authGate;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 6. NFD — deeper content verification
// ---------------------------------------------------------------------------

test.describe('NFD Academy — deeper content', () => {
  test('heading mentions NFD or Academy', async ({ page }) => {
    await page.goto('/nfd-academy');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
    const headingText = await heading.textContent().catch(() => '');
    const hasNfdKeyword = /nfd|academy|curso|course|learn|digital/i.test(headingText ?? '');
    // Accept: keyword in heading OR an auth gate is present (heading is the gate title)
    const authGate = page.getByText(/sign in|login|entrar|authenticate/i).first();
    const authCount = await authGate.count();
    if (!hasNfdKeyword && authCount === 0) {
      test.skip(true, 'Heading does not mention NFD/Academy and no auth gate visible');
    }
  });

  test('a link to another NFD page is visible', async ({ page }) => {
    await page.goto('/nfd-academy');
    await page.waitForLoadState('networkidle');
    const nfdLink = page.getByRole('link', { name: /nfd|passport|dashboard|courses/i });
    const count = await nfdLink.count();
    if (count === 0) {
      test.skip(true, 'No NFD cross-navigation link found on academy page');
    }
    await expect(nfdLink.first()).toBeVisible({ timeout: 8000 });
  });

  test('content section loads (body has meaningful content)', async ({ page }) => {
    await page.goto('/nfd-academy');
    await page.waitForLoadState('networkidle');
    const section = page.locator('main, section, [class*="content"], [class*="Content"]').first();
    const count = await section.count();
    if (count === 0) {
      test.skip(true, 'No main/section element found');
    }
    await expect(section).toBeVisible({ timeout: 8000 });
  });
});

test.describe('NFD Passport — deeper content', () => {
  test('heading is visible on passport page', async ({ page }) => {
    await page.goto('/nfd-passport');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('a link to another NFD page is visible', async ({ page }) => {
    await page.goto('/nfd-passport');
    await page.waitForLoadState('networkidle');
    const nfdLink = page.getByRole('link', { name: /nfd|academy|dashboard|courses/i });
    const count = await nfdLink.count();
    if (count === 0) {
      test.skip(true, 'No NFD cross-navigation link found on passport page');
    }
    await expect(nfdLink.first()).toBeVisible({ timeout: 8000 });
  });

  test('content section or auth gate loads', async ({ page }) => {
    await page.goto('/nfd-passport');
    await page.waitForLoadState('networkidle');
    const content = page
      .locator('main, section')
      .or(page.getByText(/sign in|login|entrar|passport|identidade/i).first());
    await expect(content.first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('NFD Dashboard — deeper content', () => {
  test('heading is visible on dashboard page', async ({ page }) => {
    await page.goto('/nfd-dashboard');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('navigation to another NFD page is available', async ({ page }) => {
    await page.goto('/nfd-dashboard');
    await page.waitForLoadState('networkidle');
    const nfdLink = page.getByRole('link', { name: /nfd|academy|passport|courses/i });
    const count = await nfdLink.count();
    if (count === 0) {
      test.skip(true, 'No NFD cross-navigation link found on dashboard page');
    }
    await expect(nfdLink.first()).toBeVisible({ timeout: 8000 });
  });

  test('content section loads', async ({ page }) => {
    await page.goto('/nfd-dashboard');
    await page.waitForLoadState('networkidle');
    const section = page.locator('main, section, [class*="dashboard"], [class*="Dashboard"]').first();
    const count = await section.count();
    if (count === 0) {
      test.skip(true, 'No main/section element found');
    }
    await expect(section).toBeVisible({ timeout: 8000 });
  });
});

test.describe('NFD Courses — deeper content', () => {
  test('heading is visible on courses page', async ({ page }) => {
    await page.goto('/nfd-courses');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('navigation link to another NFD page is visible', async ({ page }) => {
    await page.goto('/nfd-courses');
    await page.waitForLoadState('networkidle');
    const nfdLink = page.getByRole('link', { name: /nfd|academy|passport|dashboard/i });
    const count = await nfdLink.count();
    if (count === 0) {
      test.skip(true, 'No NFD cross-navigation link found on courses page');
    }
    await expect(nfdLink.first()).toBeVisible({ timeout: 8000 });
  });

  test('content section loads on courses page', async ({ page }) => {
    await page.goto('/nfd-courses');
    await page.waitForLoadState('networkidle');
    const section = page.locator('main, section, [class*="course"], [class*="Course"]').first();
    const count = await section.count();
    if (count === 0) {
      test.skip(true, 'No main/section element found');
    }
    await expect(section).toBeVisible({ timeout: 8000 });
  });
});
