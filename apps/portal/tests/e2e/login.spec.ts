import { test, expect } from '@playwright/test';
import { signInAs, setTestIp, CREDENTIALS } from '../fixtures/auth';

test.describe('login + role-aware routing', () => {
  test('bad password shows the inline error', async ({ page, context }) => {
    await setTestIp(context);
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(CREDENTIALS.admin.email);
    await page.getByLabel(/password/i).fill('definitely-not-the-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    // The form surfaces a friendly error; we accept any reasonable wording
    // the page may use to communicate a credential failure.
    await expect(
      page.getByText(/email or password is incorrect|incorrect|invalid/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin lands on /dashboard', async ({ page }) => {
    await signInAs(page, 'admin');
    await expect(page).toHaveURL(/\/dashboard$/);
    // PageHeader on /dashboard surfaces a greeting heading.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('parent lands on /parent/dashboard (middleware steers role)', async ({ page }) => {
    await signInAs(page, 'parent');
    await expect(page).toHaveURL(/\/parent\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('parent visiting /dashboard is redirected to /parent/dashboard', async ({ page }) => {
    await signInAs(page, 'parent');
    await page.goto('/dashboard');
    await page.waitForURL(/\/parent\/dashboard$/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/parent\/dashboard$/);
  });

  test('non-parent visiting /parent/dashboard is redirected to /dashboard', async ({ page }) => {
    await signInAs(page, 'admin');
    await page.goto('/parent/dashboard');
    await page.waitForURL(/\/dashboard$/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/dashboard$/);
  });

  test('unauthenticated /dashboard bounces to /login', async ({ page, context }) => {
    await setTestIp(context);
    // No prior signin in this test.
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/login/);
  });
});
