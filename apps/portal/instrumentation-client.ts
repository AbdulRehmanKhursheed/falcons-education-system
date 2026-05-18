/**
 * Next.js client-side instrumentation hook. Runs once per session in the
 * browser. Mirrors `instrumentation.ts` for the client bundle. We gate
 * everything on `NEXT_PUBLIC_SENTRY_DSN` and treat missing SDK / missing
 * DSN as silent no-ops.
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  // Fire-and-forget; failure to load the SDK should never break the app.
  import('./sentry.client.config').catch(() => {
    /* SDK not installed — quietly skip. */
  });
}

export {};
