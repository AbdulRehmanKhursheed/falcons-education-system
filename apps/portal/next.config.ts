import type { NextConfig } from 'next';

/**
 * Content-Security-Policy.
 *
 * Notes / judgement calls:
 *   - `style-src` allows `'unsafe-inline'` because Tailwind v4 (and React
 *     itself, for some inline style attributes) emit inline styles. Stripping
 *     this would require a nonce pipeline; deferred until the portal is
 *     stable.
 *   - `script-src` allows `'unsafe-inline'` and `'unsafe-eval'` for Next.js
 *     dev/runtime needs (RSC payloads, dev HMR). On a future hardening pass
 *     we should move to nonces, but this is an acceptable tradeoff today.
 *   - `img-src https:` is wide — needed because we render user-uploaded
 *     document links and external CDN images. Narrow when we add an image
 *     proxy.
 *   - `frame-ancestors 'none'` + the X-Frame-Options DENY header give
 *     defense-in-depth against clickjacking.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'Content-Security-Policy', value: CSP },
];

const config: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Apply to every route.
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default config;
