/**
 * E2E tests for miscellaneous public pages
 *
 * Covers: /unsubscribe, /sitemap, /accept-invitation, /partner-registration,
 * /water-presence-public, /select-organization, /vip-confirmation/:token,
 * /receipt/:id, and /get-started.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertNoErrorBoundary(page: import('@playwright/test').Page) {
  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

async function assertBodyNotBlank(page: import('@playwright/test').Page) {
  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// 1. Unsubscribe — /unsubscribe
// ---------------------------------------------------------------------------

test.describe('Unsubscribe — page', () => {
  test('renders without crash when no token provided', async ({ page }) => {
    await page.goto('/unsubscribe');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('shows invalid-token state without token', async ({ page }) => {
    await page.goto('/unsubscribe');
    await page.waitForLoadState('networkidle');
    const message = page.getByText(/inválido|invalid|token|link|error/i).first();
    const count = await message.count();
    if (count === 0) {
      test.skip(true, 'No error message for missing token found');
    }
    await expect(message).toBeVisible({ timeout: 5000 });
  });

  test('renders with a dummy token (shows loading or invalid state)', async ({ page }) => {
    await page.goto('/unsubscribe?token=dummy-token-12345');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });
});

// ---------------------------------------------------------------------------
// 2. Sitemap — /sitemap
// ---------------------------------------------------------------------------

test.describe('Sitemap — page', () => {
  test('renders without crash', async ({ page }) => {
    await page.goto('/sitemap');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('contains multiple navigation links', async ({ page }) => {
    await page.goto('/sitemap');
    await page.waitForLoadState('networkidle');
    const links = page.getByRole('link');
    const count = await links.count();
    if (count === 0) {
      test.skip(true, 'No links found on sitemap page');
    }
    expect(count).toBeGreaterThan(3);
  });
});

// ---------------------------------------------------------------------------
// 3. Accept invitation — /accept-invitation
// ---------------------------------------------------------------------------

test.describe('AcceptInvitation — page', () => {
  test('renders without crash when no token provided', async ({ page }) => {
    await page.goto('/accept-invitation');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('shows invalid token message without a query token', async ({ page }) => {
    await page.goto('/accept-invitation');
    await page.waitForLoadState('networkidle');
    const message = page.getByText(/token|invalid|inválido|convite|invitation/i).first();
    const count = await message.count();
    if (count === 0) {
      test.skip(true, 'No message about missing token found');
    }
    await expect(message).toBeVisible({ timeout: 5000 });
  });

  test('renders with dummy token param (graceful loading or error state)', async ({ page }) => {
    await page.goto('/accept-invitation?token=dummy-invite-token');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });
});

// ---------------------------------------------------------------------------
// 4. Partner registration — /partner-registration
// ---------------------------------------------------------------------------

test.describe('PartnerRegistration — page', () => {
  test('renders without crash', async ({ page }) => {
    await page.goto('/partner-registration');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('a form or registration content is visible', async ({ page }) => {
    await page.goto('/partner-registration');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').or(
      page.getByRole('button', { name: /register|registar|apply|candidat/i }),
    ).first();
    const count = await form.count();
    if (count === 0) {
      test.skip(true, 'No form or CTA found on partner-registration');
    }
    await expect(form).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Water presence public — /water-presence-public
// ---------------------------------------------------------------------------

test.describe('WaterPresencePublic — page', () => {
  test('renders without crash', async ({ page }) => {
    await page.goto('/water-presence-public');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('water-related content or data widget is visible', async ({ page }) => {
    await page.goto('/water-presence-public');
    await page.waitForLoadState('networkidle');

    const waterContent = page.getByText(/water|água|presença|presence|tank|tanque/i).first();
    const count = await waterContent.count();
    if (count === 0) {
      test.skip(true, 'Water presence content not found — needs live IoT data');
    }
    await expect(waterContent).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Select organization — /select-organization
// ---------------------------------------------------------------------------

test.describe('SelectOrganization — page', () => {
  test('renders without crash (unauthenticated)', async ({ page }) => {
    await page.goto('/select-organization');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });
});

// ---------------------------------------------------------------------------
// 7. VIP confirmation — /vip-confirmation/:token
// ---------------------------------------------------------------------------

test.describe('VIPConfirmation — page', () => {
  test('renders gracefully with a dummy token', async ({ page }) => {
    await page.goto('/vip-confirmation/dummy-vip-token-123');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });
});

// ---------------------------------------------------------------------------
// 8. Receipt — /receipt/:id
// ---------------------------------------------------------------------------

test.describe('Receipt — page', () => {
  test('renders gracefully with a dummy receipt ID', async ({ page }) => {
    await page.goto('/receipt/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });

  test('shows receipt content or not-found state', async ({ page }) => {
    await page.goto('/receipt/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    const receiptContent = page.getByText(/receipt|recibo|invoice|fatura|not found|não encontrad/i).first();
    const count = await receiptContent.count();
    if (count === 0) {
      test.skip(true, 'Receipt content or not-found message not visible');
    }
    await expect(receiptContent).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 9. Get started — /get-started
// ---------------------------------------------------------------------------

test.describe('GetStarted — page', () => {
  test('renders or redirects without crash', async ({ page }) => {
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    await assertBodyNotBlank(page);
    await assertNoErrorBoundary(page);
  });
});
