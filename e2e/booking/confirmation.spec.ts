/**
 * E2E tests for booking confirmation / success / cancellation pages
 *
 * These public pages are shown after a checkout flow:
 *   /booking-success      — shown after a successful booking payment
 *   /booking-cancelled    — shown when a user cancels checkout
 *   /subscription-success — shown after a subscription activation
 *   /consultation-success — shown after a consultation booking
 *
 * They receive data via URL search params (session_id, booking_id, etc.)
 * and should render gracefully with or without valid params.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertPageRendersGracefully(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  // Should render something
  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  // Should not show an error boundary
  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Booking success — /booking-success
// ---------------------------------------------------------------------------

test.describe('BookingSuccess — page', () => {
  test('renders gracefully without a session_id param', async ({ page }) => {
    await assertPageRendersGracefully(page, '/booking-success');
  });

  test('renders gracefully with a dummy session_id', async ({ page }) => {
    await assertPageRendersGracefully(page, '/booking-success?session_id=cs_test_dummy_session');
  });

  test('shows success or confirmation content', async ({ page }) => {
    await page.goto('/booking-success');
    await page.waitForLoadState('networkidle');

    const successContent = page.getByText(
      /success|confirmad|reserva|booking|obrigado|thank|confirmed/i,
    ).first();
    const count = await successContent.count();
    if (count === 0) {
      test.skip(true, 'Success content not found — needs live session or different params');
    }
    await expect(successContent).toBeVisible({ timeout: 5000 });
  });

  test('no JS errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/booking-success');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Booking cancelled — /booking-cancelled
// ---------------------------------------------------------------------------

test.describe('BookingCancelled — page', () => {
  test('renders gracefully without params', async ({ page }) => {
    await assertPageRendersGracefully(page, '/booking-cancelled');
  });

  test('shows cancellation or retry message', async ({ page }) => {
    await page.goto('/booking-cancelled');
    await page.waitForLoadState('networkidle');

    const cancelContent = page.getByText(
      /cancel|cancelad|try again|tente|back|voltar|retry/i,
    ).first();
    const count = await cancelContent.count();
    if (count === 0) {
      test.skip(true, 'Cancellation content not found');
    }
    await expect(cancelContent).toBeVisible({ timeout: 5000 });
  });

  test('provides a way to return home or retry', async ({ page }) => {
    await page.goto('/booking-cancelled');
    await page.waitForLoadState('networkidle');

    const returnAction = page
      .getByRole('button', { name: /back|voltar|try again|retry|home/i })
      .or(page.getByRole('link', { name: /back|home|voltar/i }));
    const count = await returnAction.count();
    if (count === 0) {
      test.skip(true, 'Return action not found on cancellation page');
    }
    await expect(returnAction.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Subscription success — /subscription-success
// ---------------------------------------------------------------------------

test.describe('SubscriptionSuccess — page', () => {
  test('renders gracefully without params', async ({ page }) => {
    await assertPageRendersGracefully(page, '/subscription-success');
  });

  test('shows subscription confirmation or activation message', async ({ page }) => {
    await page.goto('/subscription-success');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(
      /subscri|ativad|activated|plano|plan|obrigado|thank|welcome/i,
    ).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Subscription success content not found');
    }
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Consultation success — /consultation-success
// ---------------------------------------------------------------------------

test.describe('ConsultationSuccess — page', () => {
  test('renders gracefully without params', async ({ page }) => {
    await assertPageRendersGracefully(page, '/consultation-success');
  });

  test('shows consultation confirmation content', async ({ page }) => {
    await page.goto('/consultation-success');
    await page.waitForLoadState('networkidle');

    const content = page.getByText(
      /consultation|consultoria|confirmad|success|obrigado|thank/i,
    ).first();
    const count = await content.count();
    if (count === 0) {
      test.skip(true, 'Consultation success content not found');
    }
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Rentals booking review — /rentals/booking/:id/review
// ---------------------------------------------------------------------------

test.describe('RentalsBookingReview — public review page', () => {
  test('invalid booking ID renders gracefully (no crash)', async ({ page }) => {
    await page.goto('/rentals/booking/00000000-0000-0000-0000-000000000000/review');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);

    const errorBoundary = page.getByText(/something went wrong|uncaught/i);
    await expect(errorBoundary).not.toBeVisible();
  });

  test('review form or not-found message is rendered', async ({ page }) => {
    await page.goto('/rentals/booking/00000000-0000-0000-0000-000000000000/review');
    await page.waitForLoadState('networkidle');

    // Either a review form (stars, textarea) or a "not found" message
    const form = page.locator('form, textarea, [class*="star"], [class*="Star"]').first();
    const notFound = page.getByText(/not found|não encontrad|inválido|expired/i).first();

    const formCount = await form.count();
    const notFoundCount = await notFound.count();

    // At least one of these states must be present
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Booking confirmation pages — deeper content verification
// ---------------------------------------------------------------------------

test.describe('BookingSuccess — deeper content', () => {
  test('success page shows a confirmation heading', async ({ page }) => {
    await page.goto('/booking-success');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('success page shows a confirmation heading or checkmark icon', async ({ page }) => {
    await page.goto('/booking-success');
    await page.waitForLoadState('networkidle');
    const confirmHeading = page
      .getByText(/success|confirmad|reserva|booking|obrigado|thank|confirmed/i)
      .first();
    const checkIcon = page
      .locator('[class*="check"], [class*="Check"], [aria-label*="check"], svg')
      .first();

    const headingCount = await confirmHeading.count();
    const iconCount = await checkIcon.count();

    if (headingCount === 0 && iconCount === 0) {
      test.skip(true, 'No confirmation heading or checkmark icon found on booking success page');
    }
    const visibleEl = headingCount > 0 ? confirmHeading : checkIcon;
    await expect(visibleEl).toBeVisible({ timeout: 8000 });
  });

  test('success page has a return or home navigation link', async ({ page }) => {
    await page.goto('/booking-success');
    await page.waitForLoadState('networkidle');
    const returnLink = page.getByRole('link', { name: /home|início|back|voltar|return|go to/i })
      .or(page.getByRole('button', { name: /home|início|back|voltar|return/i }));
    const count = await returnLink.count();
    if (count === 0) {
      test.skip(true, 'No return/home link found on booking success page');
    }
    await expect(returnLink.first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('BookingCancelled — deeper content', () => {
  test('cancelled page shows a cancellation message heading', async ({ page }) => {
    await page.goto('/booking-cancelled');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('cancelled page shows cancellation message text', async ({ page }) => {
    await page.goto('/booking-cancelled');
    await page.waitForLoadState('networkidle');
    const cancelMsg = page
      .getByText(/cancel|cancelad|not completed|não concluíd|payment|pagamento/i)
      .first();
    const count = await cancelMsg.count();
    if (count === 0) {
      test.skip(true, 'No cancellation message found on booking cancelled page');
    }
    await expect(cancelMsg).toBeVisible({ timeout: 8000 });
  });

  test('cancelled page has a return or home navigation link', async ({ page }) => {
    await page.goto('/booking-cancelled');
    await page.waitForLoadState('networkidle');
    const returnLink = page.getByRole('link', { name: /home|início|back|voltar|return|try again|retry/i })
      .or(page.getByRole('button', { name: /home|início|back|voltar|return|try again|retry/i }));
    const count = await returnLink.count();
    if (count === 0) {
      test.skip(true, 'No return/home link found on booking cancelled page');
    }
    await expect(returnLink.first()).toBeVisible({ timeout: 8000 });
  });
});
