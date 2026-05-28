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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role: string | undefined = (req.auth?.user as any)?.role;
  const isParent = role === 'PARENT';
  const isParentRoute = pathname.startsWith('/parent');

  if (!isAuthed && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthed && isAuthRoute) {
    // Parents land in the parent portal; everyone else hits the admin
    // dashboard.
    return NextResponse.redirect(
      new URL(isParent ? '/parent/dashboard' : '/dashboard', req.url),
    );
  }

  // ── Parent role steering ───────────────────────────────────────────
  // Admin surfaces a parent shouldn't see → bounce to their portal.
  // We intercept the bare path AND any nested route under it.
  const adminOnlySegments = [
    '/dashboard',
    '/students',
    '/admissions',
    '/attendance',
    '/fees',
    '/assessments',
    '/teachers',
    '/parents',
    '/settings',
    '/homework',
    '/staff-attendance',
    '/notifications',
    '/timetable',
  ];

  if (isAuthed && isParent) {
    const hitsAdmin = adminOnlySegments.some(
      (seg) => pathname === seg || pathname.startsWith(`${seg}/`),
    );
    if (hitsAdmin) {
      return NextResponse.redirect(new URL('/parent/dashboard', req.url));
    }
  }

  // Non-parent users hitting /parent/* → admin dashboard.
  if (isAuthed && !isParent && isParentRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  // Includes /api/auth/callback/credentials so we can rate-limit it; excludes
  // the rest of /api, Next internals, and any path ending in a static-asset
  // extension. The extension exclusion matters for /public/* assets that the
  // server-side Image optimizer fetches without a session cookie — without
  // it, the auth-gate redirects those fetches to /login and Next/Image rejects
  // the response as "not a valid image".
  matcher: [
    '/api/auth/callback/credentials',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|woff2?|ttf|otf)$).*)',
  ],
};
