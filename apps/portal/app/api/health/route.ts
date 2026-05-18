import { NextResponse } from 'next/server';
import pkg from '@/package.json';
import { pingDatabase } from './_check';
import { reportError } from '@/lib/observability';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Liveness + readiness probe.
 *
 * - 200 with `{ ok: true, db: 'up' }` when the database responds within 2 s.
 * - 503 with `{ ok: false, db: 'down', error: '<sanitized>' }` otherwise.
 *
 * No authentication required: this endpoint is meant to be hit by
 * uptime checks, Vercel internal health probes, and load balancers.
 * It never leaks env vars, connection strings, or stack traces.
 */
export async function GET() {
  const ping = await pingDatabase();
  const timestamp = new Date().toISOString();
  const version = (pkg as { version?: string }).version ?? '0.0.0';

  if (!ping.ok) {
    reportError(new Error(`health: db down — ${ping.error ?? 'unknown'}`), {
      tags: { surface: 'health' },
      extra: { latencyMs: ping.latencyMs },
    });

    return NextResponse.json(
      {
        ok: false,
        db: 'down',
        error: ping.error ?? 'database unreachable',
        version,
        timestamp,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      db: 'up',
      latencyMs: ping.latencyMs,
      version,
      timestamp,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
