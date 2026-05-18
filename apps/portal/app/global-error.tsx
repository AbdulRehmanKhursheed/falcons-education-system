'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/observability';

/**
 * Last-resort error boundary. Renders when even the root layout fails,
 * so it MUST include its own <html> + <body> shell and cannot rely on
 * any of the project's CSS variables loading correctly. Keep this
 * deliberately minimal — inline styles only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { tags: { surface: 'global-error-boundary' }, extra: { digest: error.digest } });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          background: '#FAF7F1',
          color: '#2A3F60',
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '32rem',
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E5DCC8',
            borderRadius: '6px',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#93A4BD',
              margin: 0,
            }}
          >
            Error · critical
          </p>
          <h1
            style={{
              marginTop: '0.75rem',
              fontFamily: 'Georgia, "Fraunces", serif',
              fontSize: '2.25rem',
              lineHeight: 1.05,
              color: '#0F1F3A',
              letterSpacing: '-0.03em',
            }}
          >
            Application could not load.
          </h1>
          <p
            style={{
              marginTop: '1rem',
              fontSize: '14px',
              lineHeight: 1.65,
              color: '#2A3F60',
            }}
          >
            A core part of the portal failed to render. Please reload the page. If the problem persists, contact your administrator with the reference below.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: '#0F1F3A',
                color: '#FAF7F1',
                border: 'none',
                padding: '0.5rem 1rem',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
            <a
              href="/login"
              style={{
                border: '1px solid #E5DCC8',
                color: '#2A3F60',
                padding: '0.5rem 1rem',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '3px',
                textDecoration: 'none',
              }}
            >
              Sign in
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: '2.5rem',
                fontSize: '11px',
                color: '#93A4BD',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Reference <span style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>{error.digest}</span>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
