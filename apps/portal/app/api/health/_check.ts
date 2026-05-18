import { db } from '@/lib/db';

/**
 * Race a Prisma `$queryRaw` ping against a 2 s deadline. Returns `true`
 * when the DB acknowledged the query, `false` on any failure including
 * timeout. The error itself is intentionally NOT returned: callers
 * receive a sanitized boolean and can log the real failure via the
 * observability layer.
 */
export async function pingDatabase(timeoutMs = 2000): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const started = Date.now();

  const ping = db.$queryRaw`SELECT 1`.then(
    () => ({ ok: true as const }),
    (err: unknown) => ({ ok: false as const, err })
  );

  const timeout = new Promise<{ ok: false; err: Error }>((resolve) => {
    setTimeout(() => resolve({ ok: false, err: new Error('db ping timeout') }), timeoutMs);
  });

  const result = await Promise.race([ping, timeout]);
  const latencyMs = Date.now() - started;

  if (result.ok) return { ok: true, latencyMs };

  // Sanitize: only the message, never the full stack/connection string.
  const error =
    result.err instanceof Error
      ? result.err.message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgres://***')
      : 'unknown error';
  return { ok: false, latencyMs, error };
}
