import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for the Falcons portal.
 *
 * - Single browser project (Chromium) — covers the bulk of staff/parent usage
 *   and keeps the suite fast for the school's IT/dev team.
 * - `fullyParallel: false` because every test exercises the same seeded
 *   database. Serial execution avoids flake from concurrent writes (mark
 *   attendance, record payments, move stages).
 * - The dev server is auto-started against the existing seed; if it's
 *   already running (local dev) we reuse it. CI starts a fresh instance.
 */

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://falcons:falcons@localhost:5432/falcons_portal?schema=public';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/.playwright-output',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // Serialize: the seed is the shared fixture, and several specs mutate
  // rows (record payments, mark attendance, move stages). Re-running the
  // suite against the same seed should always converge thanks to upserts.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'tests/.playwright-report' }]]
    : [['list']],

  use: {
    baseURL: BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    // Pakistan locale — most date pickers and formatters lean on this.
    locale: 'en-PK',
    timezoneId: 'Asia/Karachi',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      DATABASE_URL,
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        'test-test-test-test-test-test-test-test',
      AUTH_TRUST_HOST: 'true',
      NEXTAUTH_URL: BASE_URL,
      NODE_ENV: 'development',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
});
