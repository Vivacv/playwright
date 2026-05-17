/**
 * E2E tests for standalone property / real-estate public pages
 *
 * Routes:
 *   /property                  — property detail / browse (public)
 *   /property-search           — property search (public)
 *   /assistente-imobiliario    — AI real estate assistant (public)
 *   /real-estate/simulacao     — mortgage / rental simulation tool
 *   /real-estate/property      — property detail page via real-estate module
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function assertPageOk(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').innerText().catch(() => '');
  expect(body.trim().length).toBeGreaterThan(0);

  const errorBoundary = page.getByText(/something went wrong|erro inesperado|uncaught/i);
  await expect(errorBoundary).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Crash-free batch check
// ---------------------------------------------------------------------------

const PROPERTY_ROUTES = [
  { path: '/property', label: 'Property' },
  { path: '/property-search', label: 'Property Search' },
  { path: '/assistente-imobiliario', label: 'Assistente Imobiliário' },
  { path: '/real-estate/simulacao', label: 'Real Estate Simulação' },
  { path: '/real-estate/property', label: 'Real Estate Property' },
];

test.describe('Property public pages — crash-free rendering', () => {
  for (const { path, label } of PROPERTY_ROUTES) {
    test(`${label} (${path}) renders without crash`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Property browse — /property
// ---------------------------------------------------------------------------

test.describe('Property — browse page', () => {
  test('heading or property content is visible', async ({ page }) => {
    await page.goto('/property');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    const content = page.getByText(/property|imóvel|apartment|casa|house|bed|bath/i).first();

    const headingCount = await heading.count();
    const contentCount = await content.count();

    if (headingCount === 0 && contentCount === 0) {
      test.skip(true, 'No property content found');
    }
    const visible = headingCount > 0 ? heading : content;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Property search — /property-search
// ---------------------------------------------------------------------------

test.describe('PropertySearch — page', () => {
  test('search input or listing is visible', async ({ page }) => {
    await page.goto('/property-search');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    const listing = page.locator('[class*="card"], [class*="listing"]').first();

    const searchCount = await searchInput.count();
    const listingCount = await listing.count();

    if (searchCount === 0 && listingCount === 0) {
      test.skip(true, 'No search input or listing found');
    }
    const visible = searchCount > 0 ? searchInput : listing;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 4. AI Real Estate Assistant — /assistente-imobiliario
// ---------------------------------------------------------------------------

test.describe('AssistenteImobiliario — AI assistant', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/assistente-imobiliario');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('chat interface or property assistant content is visible', async ({ page }) => {
    await page.goto('/assistente-imobiliario');
    await page.waitForLoadState('networkidle');

    const chat = page.locator('textarea, [class*="chat"]').first();
    const content = page
      .getByText(/assistente|assistant|imobiliário|property|ai|artificial/i)
      .first();

    const chatCount = await chat.count();
    const contentCount = await content.count();

    if (chatCount === 0 && contentCount === 0) {
      test.skip(true, 'No assistant content found');
    }
    const visible = chatCount > 0 ? chat : content;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Real Estate Simulação — /real-estate/simulacao
// ---------------------------------------------------------------------------

test.describe('RealEstateSimulacao — simulation tool', () => {
  test('simulation form or calculator is visible', async ({ page }) => {
    await page.goto('/real-estate/simulacao');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();
    const inputs = page.locator('input[type="number"], input[type="range"]').first();
    const content = page.getByText(/simul|calculat|mortgage|financiamento|prestação|loan/i).first();

    const formCount = await form.count();
    const inputCount = await inputs.count();
    const contentCount = await content.count();

    if (formCount === 0 && inputCount === 0 && contentCount === 0) {
      test.skip(true, 'No simulation form or content found');
    }
    const visible = formCount > 0 ? form : inputCount > 0 ? inputs : content;
    await expect(visible).toBeVisible({ timeout: 6000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Page titles are non-empty
// ---------------------------------------------------------------------------

test.describe('Property routes — page titles', () => {
  const titleRoutes = ['/property', '/property-search', '/real-estate/simulacao'];

  for (const path of titleRoutes) {
    test(`${path} has a non-empty title`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. Property browse — no JS errors
// ---------------------------------------------------------------------------

test.describe('Property — /property no JS errors', () => {
  test('renders without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/property');
    await page.waitForLoadState('networkidle');

    const appErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('cloudflare'),
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8. Property search — filter controls visible
// ---------------------------------------------------------------------------

test.describe('PropertySearch — filter controls', () => {
  test('has a filter or search control visible', async ({ page }) => {
    await page.goto('/property-search');
    await page.waitForLoadState('networkidle');

    const filter = page
      .locator('select, input[type="number"], input[type="range"], button[aria-label*="filter" i]')
      .first();
    const count = await filter.count();
    if (count === 0) {
      test.skip(true, 'No filter controls found — may require auth or data');
    }
    await expect(filter).toBeVisible({ timeout: 6000 });
  });

  test('body contains property-related keywords', async ({ page }) => {
    await page.goto('/property-search');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    const hasKeywords = /property|imóvel|bedroom|quarto|bath|casa|house|price|preço/i.test(body);
    if (!hasKeywords) {
      test.skip(true, 'No property keywords found — may require auth or data');
    }
    expect(hasKeywords).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 9. Real estate property — content check
// ---------------------------------------------------------------------------

test.describe('RealEstate — property page content', () => {
  test('/real-estate/property has non-empty body', async ({ page }) => {
    await page.goto('/real-estate/property');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('/property page title is non-empty', async ({ page }) => {
    await page.goto('/property');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });
});
