import { test, expect } from '@playwright/test';
import { signInAs } from '../fixtures/auth';

test.describe('parent portal', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'parent');
  });

  test('parent dashboard shows a child card with name and roll', async ({ page }) => {
    await expect(page).toHaveURL(/\/parent\/dashboard$/);

    // The seed links the demo parent to one guardian who has 2 children
    // (the sibling family). At minimum one card must render.
    const viewDetailsButton = page
      .getByRole('link', { name: /view .+ details/i })
      .first();
    await expect(viewDetailsButton).toBeVisible();

    // The "Pending fees" or "Attendance" labels confirm the card
    // structure rendered.
    await expect(page.getByText('Attendance').first()).toBeVisible();
  });

  test('clicking a child opens the overview page', async ({ page }) => {
    await page
      .getByRole('link', { name: /view .+ details/i })
      .first()
      .click();
    await page.waitForURL(/\/parent\/kids\/[^/]+$/);

    // Tabs strip from ChildHeader.
    const childTabs = page.getByLabel('Child sections');
    await expect(childTabs.getByRole('link', { name: 'Attendance' })).toBeVisible();
    await expect(childTabs.getByRole('link', { name: 'Fees' })).toBeVisible();
  });

  test('Attendance tab shows a 30-day attendance percentage', async ({ page }) => {
    await page
      .getByRole('link', { name: /view .+ details/i })
      .first()
      .click();
    await page.waitForURL(/\/parent\/kids\/[^/]+$/);

    await page
      .getByLabel('Child sections')
      .getByRole('link', { name: 'Attendance' })
      .click();
    await page.waitForURL(/\/parent\/kids\/[^/]+\/attendance$/);

    // The attendance page surfaces the "Last 30 days" eyebrow.
    await expect(page.getByText(/last 30 days/i).first()).toBeVisible();
    // A percentage figure (e.g., "92%") must appear somewhere on the page.
    await expect(page.locator('body')).toContainText(/\d{1,3}%/);
  });

  test('Fees tab lists invoices with a wa.me Pay link', async ({ page }) => {
    await page
      .getByRole('link', { name: /view .+ details/i })
      .first()
      .click();
    await page.waitForURL(/\/parent\/kids\/[^/]+$/);

    await page
      .getByLabel('Child sections')
      .getByRole('link', { name: 'Fees' })
      .click();
    await page.waitForURL(/\/parent\/kids\/[^/]+\/fees$/);

    // The "All invoices" card header is the anchor for the list.
    await expect(page.getByText(/all invoices/i)).toBeVisible();

    // At least one wa.me link is visible. Either the bulk "Pay … on
    // WhatsApp" header button (when there's an outstanding balance) or
    // a per-row "Pay" link. We accept either.
    const waLinks = page.locator('a[href*="wa.me/"]');
    expect(await waLinks.count()).toBeGreaterThan(0);

    // Spot-check the first wa.me href starts with the expected scheme
    // and carries digits.
    const firstHref = await waLinks.first().getAttribute('href');
    expect(firstHref).toMatch(/^https:\/\/wa\.me\/\d+/);
  });

  test('fuzzed studentId in the URL returns a 404, not data', async ({ page }) => {
    // assertOwnsStudent() throws notFound() for any unlinked id, so a
    // random cuid-like string is sufficient.
    const evilId = 'cl000000000000000000evil';
    await page.goto(`/parent/kids/${evilId}`);

    // Two acceptable signals — either the network response status is
    // 404 (production / prerendered) or the rendered page is the
    // 404-shell. We accept either to keep the test resilient between
    // Next.js dev (which sometimes returns 200 + a 404 component) and
    // production builds.
    const heading = page.getByRole('heading', { name: /page not found/i });
    await expect(heading).toBeVisible({ timeout: 5_000 });

    // Crucially: no child profile data should have leaked into the DOM
    // (no tabs strip from ChildHeader).
    await expect(page.getByLabel('Child sections')).toHaveCount(0);
  });
});
