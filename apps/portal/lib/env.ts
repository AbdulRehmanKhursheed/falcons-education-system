/**
 * Centralised, zod-validated environment schema for the portal.
 *
 * Importing `env` from this module guarantees the process started with the
 * variables we depend on. If anything required is missing, this throws at
 * import time — better to crash on boot in Vercel logs than to hit a
 * confusing runtime error later.
 *
 * Notes:
 * - This file is intentionally not imported by `lib/db.ts` (owned by another
 *   agent). Adopt incrementally by importing `env` where you need it.
 * - The schema is permissive about extra `SEED_*` vars used by the seed
 *   script — those are validated separately in `prisma/seed.ts`.
 */

import { z } from 'zod'

const envSchema = z.object({
  // Database — Postgres connection string. On Vercel + Neon use the *pooled*
  // connection (the one with `-pooler` in the host) because Next.js server
  // components run in serverless functions that open many short connections.
  DATABASE_URL: z.string().url(),

  // NextAuth/Auth.js
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32'),
  AUTH_TRUST_HOST: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Runtime
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Optional integrations
  SENTRY_DSN: z.string().url().optional(),
})

type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    // eslint-disable-next-line no-console
    console.error(
      `\nInvalid environment variables. Refer to apps/portal/.env.example and DEPLOYMENT.md.\n${issues}\n`,
    )
    throw new Error('Invalid environment configuration')
  }
  return parsed.data
}

export const env = loadEnv()
export type { Env }
