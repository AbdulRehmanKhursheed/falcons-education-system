/**
 * Sentry client-side init. Loaded conditionally from
 * `instrumentation-client.ts` only when `NEXT_PUBLIC_SENTRY_DSN` is set.
 * Safe to ship before `@sentry/nextjs` is installed — the dynamic import
 * in the caller catches the missing-module error.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/nextjs') as any;

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,
    ignoreErrors: [
      'NEXT_REDIRECT',
      'NEXT_NOT_FOUND',
      // Browser extensions / quota errors we cannot action.
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
  });
}

export {};
