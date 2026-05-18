/**
 * Next.js server-side instrumentation hook. Runs once per server boot.
 * We use it to lazily initialize Sentry when both `SENTRY_DSN` and the
 * `@sentry/nextjs` package are present. Missing either one is a silent
 * no-op so dev / preview builds stay clean.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await import('./sentry.server.config');
    } catch {
      // SDK not installed — silently skip.
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    try {
      await import('./sentry.server.config');
    } catch {
      // SDK not installed — silently skip.
    }
  }
}

/**
 * Optional: forward request errors through to the observability layer
 * so server-action / route-handler failures are captured even when the
 * default React error boundary swallows them client-side.
 */
export async function onRequestError(err: unknown, request: { path: string; method: string }) {
  if (!process.env.SENTRY_DSN) {
    // Local-only log in absence of Sentry.
    console.error('[portal:request-error]', request.method, request.path, err);
    return;
  }
  try {
    // Dynamic require keeps this file compilable even before
    // `@sentry/nextjs` is added to dependencies.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const Sentry = require('@sentry/nextjs') as any;
    Sentry.captureException(err, { tags: { path: request.path, method: request.method } });
  } catch {
    console.error('[portal:request-error]', request.method, request.path, err);
  }
}
