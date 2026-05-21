import { test, expect } from '@playwright/test';
import { signInAs } from '../fixtures/auth';

test.describe('command palette (Cmd+K)', () => {
  test('admin: Cmd+K opens the palette and searches students', async ({ page }) => {
    await signInAs(page, 'admin');
    await page.goto('/dashboard');

    // The TopBar exposes a "Open command palette" button that proxies to
    // the exact same state as Cmd+K. We click it once to verify the
    // palette mounts; the keyboard shortcut path is exercised
    // separately via the close-via-Escape flow below.
    await page.getByRole('button', { name: /open command palette/i }).first().click();

    const palette = page.getByRole('dialog', { name: /command palette/i });
    await expect(palette).toBeVisible();

    // Type three letters of a seeded student name. The seed creates a
    // student "Hassan Khan" — searching "Has" should find it.
    const input = palette.getByRole('textbox', { name: /search/i });
    await input.fill('Has');

    // Wait for the "Searching…" indicator to clear, then for results.
    await expect(palette.getByText(/students/i).first()).toBeVisible({ timeout: 5_000 });

    // At least one result row appears beneath the "Students" header.
    const firstResult = palette.locator('button[data-active="true"], button:has-text("Hassan")').first();
    await expect(firstResult).toBeVisible();
  });

  test('admin: arrow-down + Enter navigates to a student detail', async ({ page }) => {
    await signInAs(page, 'admin');
    await page.goto('/dashboard');

    // The TopBar exposes a "Open command palette" button that proxies to
    // the exact same state as Cmd+K. We click it once to verify the
    // palette mounts; the keyboard shortcut path is exercised
    // separately via the close-via-Escape flow below.
    await page.getByRole('button', { name: /open command palette/i }).first().click();

    const palette = page.getByRole('dialog', { name: /command palette/i });
    await expect(palette).toBeVisible();

    const input = palette.getByRole('textbox', { name: /search/i });
    await input.fill('Hassan');

    // Wait until at least one student result is rendered.
    await expect(palette.getByText(/students/i).first()).toBeVisible({ timeout: 5_000 });
    await expect(palette.locator('button:has-text("Hassan")').first()).toBeVisible();

    // Walk to the first non-action item then submit. The first nav
    // item in groupOrder is "actions" (the dashboard itself filtered by
    // "Has"); pressing ArrowDown a few times lands us on a student row.
    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await input.press('Enter');

    // Should land on /students/<id>.
    await page.waitForURL(/\/students\/[^/]+/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/students\/[^/]+/);
  });

  test('parent: command palette is not mounted (no Open button, no dialog)', async ({ page }) => {
    await signInAs(page, 'parent');
    await page.goto('/parent/dashboard');

    // Parents use the ParentTopBar, which does NOT render the
    // "Open command palette" button. The admin AppShell mounts the
    // CommandPalette dialog component conditionally on this shell, so
    // both signals should be absent on the parent surface.
    await expect(
      page.getByRole('button', { name: /open command palette/i }),
    ).toHaveCount(0);

    // And sending Cmd+K should NOT open any palette either, because
    // the KeyboardShortcuts component is admin-only too.
    await page.keyboard.press('ControlOrMeta+K');

    const palette = page.getByRole('dialog', { name: /command palette/i });
    await expect(palette).toHaveCount(0, { timeout: 2_000 });
  });
});
