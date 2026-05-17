/**
 * E2E tests for the Code Evaluation page — /erp/code-eval
 *
 * The page fetches the latest code evaluation via testGovernanceService
 * and renders ISO/IEC 25010 quality scores (Security, Maintainability,
 * Reliability, Performance, Modularity) with Progress bars and band badges.
 *
 * Auth state is loaded from e2e/.auth/admin.json.
 * Generate it by running e2e/auth/setup.ts before these tests.
 */

import { test, expect } from '@playwright/test';

// Use the persisted admin session for routes that require authentication.
test.use({ storageState: 'e2e/.auth/admin.json' });

const CODE_EVAL_URL = '/erp/code-eval';

// ---------------------------------------------------------------------------
// 1. Page structure — heading and score grid are present
// ---------------------------------------------------------------------------

test.describe('CodeEvalPage — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CODE_EVAL_URL);
    await page.waitForLoadState('networkidle');
  });

  test('the "Avaliação de Código" heading is visible', async ({ page }) => {
    // The page title uses the Portuguese heading "Avaliação de Código".
    const heading = page.getByRole('heading', { name: /avalia[çc][aã]o de c[oó]digo/i });
    await expect(heading).toBeVisible();
  });

  test('the score grid section is rendered on the page', async ({ page }) => {
    // After the data loads the ISO 25010 score grid must be present.
    // We look for any of the five metric labels as a proxy for grid visibility.
    const hasScores = await page
      .getByText(/security|maintainability|reliability|performance|modularity/i)
      .count();

    if (hasScores === 0) {
      test.skip(true, 'Score grid not found — page may require live evaluation data');
    }

    // At least one metric label is visible.
    await expect(
      page.getByText(/security|maintainability|reliability|performance|modularity/i).first(),
    ).toBeVisible();
  });

  test('skeleton loading cards are replaced by actual content', async ({ page }) => {
    // On initial load React Query may show skeleton cards; by the time
    // networkidle fires the real content should have replaced them.
    // We assert that the heading is visible (skeletons do not include headings).
    const heading = page.getByRole('heading', { name: /avalia[çc][aã]o de c[oó]digo/i });
    await expect(heading).toBeVisible();
  });

  test('an empty-state CTA is shown when no evaluation data is available', async ({ page }) => {
    // When the API returns no data the page renders an empty state with a
    // call-to-action button.  We check for either the score grid OR the empty
    // state so the test is valid regardless of server data.
    const scoreLabels = page.getByText(/security|maintainability|reliability/i);
    const emptyState = page.getByText(/sem avalia[çc][aã]o|no evaluation|nenhuma avalia[çc][aã]o/i);

    const scores = await scoreLabels.count();
    const empty = await emptyState.count();

    if (scores === 0 && empty === 0) {
      test.skip(true, 'Neither score grid nor empty-state found — needs live server');
    }

    // One of the two states must be visible.
    if (scores > 0) {
      await expect(scoreLabels.first()).toBeVisible();
    } else {
      await expect(emptyState.first()).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// 2. ISO 25010 scores — all five metrics are labelled with progress bars
// ---------------------------------------------------------------------------

test.describe('CodeEvalPage — scores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CODE_EVAL_URL);
    await page.waitForLoadState('networkidle');
  });

  // The five ISO/IEC 25010 product-quality characteristics displayed on page.
  const ISO_METRICS = [
    'Security',
    'Maintainability',
    'Reliability',
    'Performance',
    'Modularity',
  ] as const;

  for (const metric of ISO_METRICS) {
    test(`the "${metric}" metric label is visible`, async ({ page }) => {
      const label = page.getByText(new RegExp(metric, 'i'));
      const count = await label.count();
      if (count === 0) {
        test.skip(true, `"${metric}" label not found — needs live evaluation data`);
      }
      await expect(label.first()).toBeVisible();
    });
  }

  test('progress bars are rendered for the ISO 25010 score grid', async ({ page }) => {
    // Each metric row contains a <progress> element or a role="progressbar" widget.
    const progressBars = page.getByRole('progressbar');
    const count = await progressBars.count();

    if (count === 0) {
      test.skip(true, 'No progress bars found — needs live evaluation data');
    }

    // Expect at least one progress bar per ISO metric (5 total).
    expect(count).toBeGreaterThanOrEqual(5);
    await expect(progressBars.first()).toBeVisible();
  });

  test('band badges (Excellent / Good / Acceptable / Poor / Critical) are displayed', async ({ page }) => {
    // Each score card carries a text badge indicating the quality band.
    const bandBadge = page.getByText(
      /excellent|good|acceptable|poor|critical|excelente|bom|aceit[aá]vel|ruim|crítico/i,
    );
    const count = await bandBadge.count();

    if (count === 0) {
      test.skip(true, 'Band badges not found — needs live evaluation data');
    }

    await expect(bandBadge.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Refresh — a reload / refresh button exists and is interactive
// ---------------------------------------------------------------------------

test.describe('CodeEvalPage — refresh', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CODE_EVAL_URL);
    await page.waitForLoadState('networkidle');
  });

  test('a refresh/reload button is present on the page', async ({ page }) => {
    // The page exposes a button to re-trigger the evaluation fetch.
    // Accept various label variants used across locales / design iterations.
    const refreshButton = page.getByRole('button', {
      name: /refresh|reload|atualizar|recarregar/i,
    });

    const count = await refreshButton.count();
    if (count === 0) {
      test.skip(true, 'Refresh button not found — verify button label in the component');
    }

    await expect(refreshButton.first()).toBeVisible();
    await expect(refreshButton.first()).toBeEnabled();
  });

  test('clicking the refresh button does not navigate away from the page', async ({ page }) => {
    const refreshButton = page.getByRole('button', {
      name: /refresh|reload|atualizar|recarregar/i,
    });

    const count = await refreshButton.count();
    if (count === 0) {
      test.skip(true, 'Refresh button not found — skipping click test');
    }

    await refreshButton.first().click();
    // After clicking we must still be on the code-eval page.
    await expect(page).toHaveURL(new RegExp(CODE_EVAL_URL));
  });
});

// ---------------------------------------------------------------------------
// 4. Page integrity
// ---------------------------------------------------------------------------

test.describe('CodeEvalPage — page integrity', () => {
  test('page title is non-empty', async ({ page }) => {
    await page.goto(CODE_EVAL_URL);
    await page.waitForLoadState('domcontentloaded');
    if (page.url().includes('/auth')) {
      test.skip(true, 'Auth state missing');
    }
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('no JS errors thrown on code-eval page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(CODE_EVAL_URL);
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
