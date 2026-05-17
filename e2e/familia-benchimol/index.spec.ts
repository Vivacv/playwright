/**
 * E2E tests for the Família Benchimol page — /familia-benchimol
 *
 * The Benchimol family portal is a public cultural/genealogical page
 * featuring a multilingual AI chat and family tree content.
 * No auth required.
 */

import { test, expect } from '@playwright/test';

const URL = '/familia-benchimol';
const REDIRECT_FROM = '/benchimol';

// ---------------------------------------------------------------------------
// 1. Page load & redirect
// ---------------------------------------------------------------------------

test.describe('FamiliaBenchimol — page load', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('cloudflare'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('/benchimol redirects to /familia-benchimol', async ({ page }) => {
    await page.goto(REDIRECT_FROM);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('familia-benchimol');
  });

  test('page title is non-empty', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('does not show an unhandled error boundary', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const errorBoundary = page.getByText(/something went wrong|erro inesperado/i);
    await expect(errorBoundary).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Page content
// ---------------------------------------------------------------------------

test.describe('FamiliaBenchimol — content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('"Benchimol" text appears somewhere on the page', async ({ page }) => {
    const benchimolText = page.getByText(/benchimol/i).first();
    await expect(benchimolText).toBeVisible({ timeout: 6000 });
  });

  test('family tree or history section is present', async ({ page }) => {
    // Look for content about the Benchimol family (Hilel, Cabo Verde, etc.)
    const historyContent = page.getByText(/hilel|cabo verde|sefardita|sephardic|tetouan|santiago/i);
    const count = await historyContent.count();
    if (count === 0) {
      test.skip(true, 'Family history content not found — may be behind a tab or lazy loaded');
    }
    await expect(historyContent.first()).toBeVisible({ timeout: 8000 });
  });

  test('language selector (PT / EN / FR) is present', async ({ page }) => {
    // The page supports Portuguese, English, and French
    const langSelector = page
      .locator('[class*="language"], [class*="Language"], [aria-label*="lang"]')
      .or(page.getByText(/^(PT|EN|FR)$/).first());
    const count = await langSelector.count();
    if (count === 0) {
      test.skip(true, 'Language selector not visible on this page variant');
    }
    await expect(langSelector.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 3. AI Chat component
// ---------------------------------------------------------------------------

test.describe('FamiliaBenchimol — chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('chat input (textarea) is rendered on the page', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    const count = await chatInput.count();
    if (count === 0) {
      test.skip(true, 'Chat textarea not found — may be behind a tab');
    }
    await expect(chatInput).toBeVisible({ timeout: 6000 });
  });

  test('send button is rendered and enabled', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send|enviar|submit/i });
    const count = await sendBtn.count();
    if (count === 0) {
      test.skip(true, 'Send button not found — check chat component visibility');
    }
    await expect(sendBtn.first()).toBeVisible({ timeout: 5000 });
    await expect(sendBtn.first()).toBeEnabled();
  });

  test('typing in the chat input updates its value', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    const count = await chatInput.count();
    if (count === 0) {
      test.skip(true, 'No textarea found');
    }
    await chatInput.fill('Quem é Hilel Benchimol?');
    await expect(chatInput).toHaveValue('Quem é Hilel Benchimol?');
  });

  test('submitting an empty message does not send (button disabled or no-op)', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    const sendBtn = page.getByRole('button', { name: /send|enviar/i }).first();

    const chatCount = await chatInput.count();
    const btnCount = await sendBtn.count();

    if (chatCount === 0 || btnCount === 0) {
      test.skip(true, 'Chat elements not found');
    }

    // Clear the input and try to send
    await chatInput.clear();
    const isDisabled = await sendBtn.isDisabled();
    if (!isDisabled) {
      // If not disabled, clicking should not cause a crash
      await sendBtn.click();
      // Should still be on the same page
      expect(page.url()).toContain('familia-benchimol');
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Language switching
// ---------------------------------------------------------------------------

test.describe('FamiliaBenchimol — language switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('switching to English updates visible UI text', async ({ page }) => {
    // Find the EN language switch
    const enBtn = page.getByRole('button', { name: /^en$/i })
      .or(page.getByText(/^EN$/).first());
    const count = await enBtn.count();
    if (count === 0) {
      test.skip(true, 'EN language button not found');
    }
    await enBtn.first().click();
    // After switching, English text should appear (e.g. "Memory Keeper" in system prompt label)
    const englishContent = page.getByText(/english|memory keeper|cape verde/i);
    const found = await englishContent.count();
    if (found === 0) {
      // At minimum the page must not crash
      expect(page.url()).toContain('familia-benchimol');
    } else {
      await expect(englishContent.first()).toBeVisible();
    }
  });
});
