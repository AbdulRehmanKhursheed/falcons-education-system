/**
 * Observability shim
 * ──────────────────
 * Thin wrapper over `console.error` that optionally forwards events to
 * Sentry when `SENTRY_DSN` is configured AND the `@sentry/nextjs` package
 * is installed. When either is missing this module is a complete no-op
 * beyond the local `console.error` write — safe for dev and for builds
 * that have not yet adopted Sentry.
 *
 * To enable in production:
 *   1. `npm install @sentry/nextjs` inside apps/portal
 *   2. Set `SENTRY_DSN` (server) and `NEXT_PUBLIC_SENTRY_DSN` (client) env vars
 *   3. (Optional) Set `SENTRY_ENVIRONMENT` and `SENTRY_RELEASE`
 *
 * The dynamic `require` is intentional: bundlers will warn about an
 * unresolved module, but at runtime the call is guarded and the module
 * is only loaded when the env var is present.
 */

type Extras = Record<string, unknown>;

type SentryLike = {
  captureException: (err: unknown, ctx?: { extra?: Extras; tags?: Record<string, string> }) => void;
  captureMessage: (msg: string, ctx?: { extra?: Extras; level?: string }) => void;
};

let sentryCache: SentryLike | null | undefined;

function getSentry(): SentryLike | null {
  if (sentryCache !== undefined) return sentryCache;

  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    sentryCache = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@sentry/nextjs') as SentryLike;
    sentryCache = mod ?? null;
  } catch {
    sentryCache = null;
  }
  return sentryCache;
}

/**
 * Sanitize an unknown error into a string that is safe to log. Strips
 * stack traces in production to avoid leaking file paths in API
 * responses (callers that need the stack should pass `err` to
 * `reportError` directly).
 */
export function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

/**
 * Report an unexpected error. Always writes to `console.error` (which
 * Vercel captures into its log stream). Forwards to Sentry if available.
 */
export function reportError(err: unknown, context?: { extra?: Extras; tags?: Record<string, string> }) {
  // Always log locally — Vercel pipes this into its log drain.
  console.error('[portal]', err, context?.extra ?? {});

  const sentry = getSentry();
  if (!sentry) return;

  try {
    sentry.captureException(err, context);
  } catch (forwardErr) {
    // Never let observability itself crash the caller.
    console.error('[portal:observability] failed to forward to Sentry', forwardErr);
  }
}

/**
 * Report a non-error event (e.g. a soft warning, a recoverable
 * inconsistency). Same fall-back behavior as `reportError`.
 */
export function reportMessage(message: string, context?: { extra?: Extras; level?: 'info' | 'warning' | 'error' }) {
  console.warn('[portal]', message, context?.extra ?? {});

  const sentry = getSentry();
  if (!sentry) return;

  try {
    sentry.captureMessage(message, context);
  } catch (forwardErr) {
    console.error('[portal:observability] failed to forward to Sentry', forwardErr);
  }
}
