import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import {
  LOGIN_RATE_LIMIT,
  ipFromHeaders,
  loginRateLimitKey,
  peekRateLimit,
  rateLimit,
} from '@/lib/rate-limit';

/**
 * Middleware:
 *   1. Rate-limit unauthenticated POSTs to the NextAuth credentials callback.
 *      The actual authorize() callback also re-checks, but rejecting here
 *      avoids touching the database and avoids leaking timing signals.
 *   2. Enforce the auth gate everywhere else — redirect unauthenticated
 *      requests to /login, and bounce authenticated requests away from /login.
 *
 * Matcher includes `/api/auth/callback/credentials` so the rate limit runs
 * on the actual credential POST, but excludes everything else under `/api`.
 */

const CREDENTIALS_CALLBACK = '/api/auth/callback/credentials';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ── Rate limit credential login attempts ────────────────────────────
  if (pathname === CREDENTIALS_CALLBACK && req.method === 'POST') {
    const ip = ipFromHeaders(req.headers);
    const key = loginRateLimitKey(ip);
    // peek-only here so we don't double-count; the authorize() callback
    // increments on actual attempts (success resets, failure consumes one).
    const peek = peekRateLimit(key, LOGIN_RATE_LIMIT);
    if (!peek.allowed) {
      const retryAfterSec = Math.ceil(peek.retryAfterMs / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'RateLimited',
          message: 'Too many login attempts. Try again later.',
          retryAfter: retryAfterSec,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
          },
        },
      );
    }
    // Allowed: increment so the next attempt counts.
    rateLimit(key, LOGIN_RATE_LIMIT);
    return; // let NextAuth handle the rest of the flow
  }

  // ── Auth-gate everything else ───────────────────────────────────────
  const isAuthed = !!req.auth;
  const isAuthRoute = pathname.startsWith('/login');

  if (!isAuthed && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isAuthed && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  // Includes /api/auth/callback/credentials so we can rate-limit it; excludes
  // the rest of /api plus static assets.
  matcher: [
    '/api/auth/callback/credentials',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
