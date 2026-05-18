/**
 * Sentry server-side init. Loaded conditionally from `instrumentation.ts`
 * only when `SENTRY_DSN` is present. If the SDK is not installed the
 * dynamic import in the caller catches and silently no-ops, so this file
 * is safe to ship even before the dependency is added.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  // Dynamic import keeps tsc/eslint happy when the package is not yet
  // installed in the workspace.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/nextjs') as any;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0.1,
    // Drop expected auth-redirect noise (NextAuth throws specific redirect
    // errors that bubble out of server actions as Error("NEXT_REDIRECT")).
    ignoreErrors: [
      'NEXT_REDIRECT',
      'NEXT_NOT_FOUND',
    ],
    beforeSend(event: any) {
      // Strip cookies & auth headers before forwarding.
      if (event.request?.cookies) delete event.request.cookies;
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }
      return event;
    },
  });
}

export {};
