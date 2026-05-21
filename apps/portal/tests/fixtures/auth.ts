import type { BrowserContext, Page, Request } from '@playwright/test';

/**
 * Sign-in helper for E2E tests.
 *
 * Drives the actual login form (NOT cookie injection) so that the real
 * NextAuth credentials flow is exercised. The login form itself is
 * verified once in `login.spec.ts`; every other spec uses this helper to
 * arrive at the post-login surface.
 *
 * After submit, the page waits for the role-appropriate landing route:
 *   - PARENT → `/parent/dashboard`
 *   - everyone else → `/dashboard`
 */

export type Role = 'admin' | 'principal' | 'teacher' | 'accounts' | 'parent';

export const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: {
    email: 'admin@falconseducationsystem.com',
    password: 'Falcons@Admin1',
  },
  principal: {
    email: 'principal@falconseducationsystem.com',
    password: 'Falcons@Principal1',
  },
  teacher: {
    email: 'teacher@falconseducationsystem.com',
    password: 'Falcons@Teacher1',
  },
  accounts: {
    email: 'accounts@falconseducationsystem.com',
    password: 'Falcons@Accounts1',
  },
  parent: {
    email: 'parent@falconseducationsystem.com',
    password: 'Falcons@Parent1',
  },
};

const PARENT_LANDING = /\/parent\/dashboard$/;
const ADMIN_LANDING = /\/dashboard$/;

/**
 * Pakistan-style test IPs. The login route is rate-limited to 5
 * attempts per 15min per X-Forwarded-For, which would trip after a
 * handful of specs in the same suite. We rotate a per-test header so
 * each spec gets its own bucket.
 */
let ipCounter = 100;
function nextTestIp(): string {
  ipCounter = (ipCounter + 1) % 240; // stay in 1.x.x.100..339 range
  // 10.x is a private range — safe and easy to read in dev logs.
  const a = 10;
  const b = (ipCounter >> 8) & 0xff;
  const c = ipCounter & 0xff;
  return `${a}.${b}.${c}.${Math.floor(Math.random() * 254) + 1}`;
}

export async function setTestIp(context: BrowserContext, ip?: string): Promise<string> {
  const value = ip ?? nextTestIp();
  await context.setExtraHTTPHeaders({ 'X-Forwarded-For': value });
  return value;
}

export async function signInAs(page: Page, role: Role): Promise<void> {
  const { email, password } = CREDENTIALS[role];

  // Each fresh sign-in gets its own per-IP rate-limit bucket so the
  // suite as a whole never trips the 5-per-15min wall in middleware.ts.
  await setTestIp(page.context());

  await page.goto('/login');

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Wait for the credentials callback to settle before checking URL.
  const callbackPromise = page.waitForResponse(
    (res: Request | { url(): string; status(): number }) =>
      res.url().includes('/api/auth/callback/credentials'),
    { timeout: 15_000 },
  ).catch(() => null);

  await page.getByRole('button', { name: /sign in/i }).click();
  await callbackPromise;

  const landing = role === 'parent' ? PARENT_LANDING : ADMIN_LANDING;
  // The login page hardcodes a window.location.href = '/dashboard'; the
  // middleware then bounces parents to /parent/dashboard. Either way we
  // wait for the final URL.
  await page.waitForURL(landing, { timeout: 15_000 });
}

/**
 * Best-effort sign out by clearing storage state. Used between specs that
 * change roles mid-run to keep tests isolated.
 */
export async function signOut(page: Page): Promise<void> {
  const ctx = page.context();
  await ctx.clearCookies();
  // Belt + braces: navigating to /login while authed normally redirects,
  // but after clearing cookies it should render the login form.
  await page.goto('/login').catch(() => undefined);
}
