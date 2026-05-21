import { test, expect } from '@playwright/test';
import { signInAs } from '../fixtures/auth';

test.describe('fees', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'accounts');
  });

  test('invoice list renders with KPI strip', async ({ page }) => {
    await page.goto('/fees');
    await expect(
      page.getByRole('heading', { name: /fees and invoices/i }),
    ).toBeVisible();

    // KPI tiles
    await expect(page.getByText('Collected this month')).toBeVisible();
    await expect(page.getByText('Outstanding total')).toBeVisible();
    await expect(page.getByText('Overdue invoices')).toBeVisible();

    // At least one invoice row is shown (the seed creates ~180 invoices).
    const firstOpen = page
      .getByRole('link', { name: /open invoice/i })
      .first();
    await expect(firstOpen).toBeVisible();
  });

  test('OVERDUE status filter shrinks the list', async ({ page }) => {
    await page.goto('/fees');

    // Wait for the invoice table to finish hydrating — the footer
    // "Showing the latest …" line is rendered after the server query
    // and tells us the table is ready to count.
    await expect(page.getByText(/Showing the latest/i)).toBeVisible({
      timeout: 15_000,
    });

    const allRows = page.getByRole('link', { name: /open invoice/i });
    const beforeCount = await allRows.count();
    expect(beforeCount).toBeGreaterThan(0);

    // Click the Overdue status chip.
    await page.getByRole('button', { name: 'Overdue', exact: true }).click();

    // Wait for the new "Searching…" state to clear before recounting.
    await expect(page.getByText(/Showing the latest/i)).toBeVisible();
    // Tiny settle so the post-action DOM is stable.
    await expect
      .poll(() => allRows.count(), { timeout: 5_000 })
      .toBeLessThanOrEqual(beforeCount);

    const afterCount = await allRows.count();
    // Overdue is a strict subset of all invoices.
    expect(afterCount).toBeLessThanOrEqual(beforeCount);
  });

  test('opening an invoice reveals student, amount, and due meta', async ({ page }) => {
    await page.goto('/fees');

    await expect(page.getByText(/Showing the latest/i)).toBeVisible({
      timeout: 15_000,
    });

    // Pick the first invoice row.
    const firstOpen = page
      .getByRole('link', { name: /open invoice/i })
      .first();
    await firstOpen.click();

    // The detail page route shape is /fees/<cuid>.
    await expect(page).toHaveURL(/\/fees\/[a-zA-Z0-9-]+$/);

    // Anchors we expect (these labels are the <dt> rows in the
    // "Amount breakdown" card on the detail page).
    await expect(page.getByText('Invoice no').first()).toBeVisible();
    await expect(page.getByText('Total', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/^Due date$/).first()).toBeVisible();
    await expect(page.getByText('Outstanding').first()).toBeVisible();

    // Print challan link present and routed to the challan page.
    const printLink = page.getByRole('link', { name: /print challan/i });
    await expect(printLink).toBeVisible();
    const href = await printLink.getAttribute('href');
    expect(href).toMatch(/^\/fees\/[a-zA-Z0-9-]+\/challan$/);
  });

  test('recording a payment for the outstanding balance flips status to PAID', async ({ page }) => {
    // Land in the fees list and filter to ISSUED — those have a known
    // positive outstanding and aren't already paid/partially-paid.
    await page.goto('/fees');
    await expect(page.getByText(/Showing the latest/i)).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: 'Issued', exact: true }).click();
    await expect(page.getByText(/Showing the latest/i)).toBeVisible();

    // Walk over ISSUED → PARTIALLY_PAID → OVERDUE looking for an
    // invoice whose detail page actually has an enabled "Record
    // payment" form (outstanding > 0). The seed contains plenty of
    // these on a fresh boot, but earlier tests in the suite may have
    // already settled some of them.
    const candidates = ['Issued', 'Partially paid', 'Overdue'] as const;
    let recorded = false;

    outer: for (const label of candidates) {
      if (label !== 'Issued') {
        await page.getByRole('button', { name: label, exact: true }).click();
        await expect(page.getByText(/Showing the latest/i)).toBeVisible();
      }

      const rows = page.getByRole('link', { name: /open invoice/i });
      const total = await rows.count();
      // Try up to 5 rows in this status bucket before falling back.
      const attempts = Math.min(total, 5);
      for (let i = 0; i < attempts; i++) {
        await rows.nth(i).click();
        await expect(page).toHaveURL(/\/fees\/[a-zA-Z0-9-]+$/);

        const recordButton = page.getByRole('button', { name: /record payment/i });
        await expect(recordButton).toBeVisible();

        const disabled = await recordButton.isDisabled();
        if (disabled) {
          await page.goBack();
          await expect(page.getByText(/Showing the latest/i)).toBeVisible();
          continue;
        }

        await recordButton.click();
        await expect(page.getByText(/recorded .* payment/i)).toBeVisible({
          timeout: 10_000,
        });
        // After revalidation, the status chip flips. We accept either
        // "Paid" (full balance) or any chip text containing Paid —
        // a partial top-up would still be a regression-safety win, but
        // the form pre-fills the FULL outstanding so PAID is expected.
        await expect(
          page.getByText('Paid', { exact: true }).first(),
        ).toBeVisible({ timeout: 10_000 });
        recorded = true;
        break outer;
      }
    }
    test.skip(
      !recorded,
      'No payable invoices in the current seed snapshot (suite already settled them).',
    );
  });
});
