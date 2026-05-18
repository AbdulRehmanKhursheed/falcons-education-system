# Portal security posture

This document describes what the Falcons portal protects against today, what
it does **not** yet protect against, and how to operate it safely. Pair this
with the schema (`prisma/schema.prisma`) and the auth flow (`auth.ts`,
`middleware.ts`).

## What's protected

| Concern | Control |
|---|---|
| Transport security | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` set in `next.config.ts`. Forces HTTPS on every browser that has seen the site. |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Clickjacking | `X-Frame-Options: DENY` plus `frame-ancestors 'none'` in CSP |
| Information leak via referrer | `Referrer-Policy: strict-origin-when-cross-origin` |
| Powerful device features | `Permissions-Policy: camera=(), microphone=(), geolocation=()` denies everything |
| XSS / supply-chain script injection | `Content-Security-Policy` scoped to `'self'` for scripts, with the unavoidable `'unsafe-inline'`/`'unsafe-eval'` for Next.js + Tailwind v4. Forms, base URI, objects all locked to `'self'` or `'none'`. |
| Brute-force login | In-memory token bucket — 5 attempts / 15 minutes per IP. Successful login resets the counter. See `lib/rate-limit.ts`. Middleware peeks (returns 429) and the `authorize` callback increments. |
| Credential storage | bcrypt with cost 12 (`prisma/seed.ts`). Hashes never leave the database — the `passwordHash` column is selected only inside `authorize`. |
| Session management | JWT sessions (no DB-backed session table). Rotating `AUTH_SECRET` invalidates every session at once. |
| Role-based access | `lib/auth-helpers.ts` exposes `requireRole(['SUPER_ADMIN', ...])` for server components and server actions. Every module page gates on it. |
| Password policy on new accounts | `lib/password.ts` enforces min 10 chars + upper/lower/digit/symbol + common-password blocklist. Exposed via `strongPasswordSchema` in `lib/schemas/auth.ts`. Existing accounts (created pre-policy) continue to authenticate via the looser `loginSchema`. |
| Audit trail | Every login attempt (success and failure) is logged to `AuditLog` with `actorId`, `ip`, `userAgent`, and the attempted email under `diff`. See `auth.ts → writeAuthAudit`. |
| Default-credential leakage in prod | `prisma/seed.ts` requires `SEED_*_PASSWORD` env vars when `NODE_ENV=production`. Dev falls back to documented defaults and prints a warning. |

## What's NOT yet protected

These are intentional deferrals — they will come in a later phase or never,
depending on the school's needs. Document them so we don't pretend
otherwise.

- **No 2FA / MFA.** A leaked password = full access for that role.
- **No SSO** (Google Workspace, etc.). Single-tenant credentials only.
- **No password reset over email.** Reset is admin-mediated today.
- **No IP allowlist.** Portal is reachable from any IP.
- **No CSRF token on server actions.** Next.js server actions ship with a
  same-origin check, but we don't have an additional token layer. SameSite
  cookies are the primary defense.
- **In-memory rate limit is per process.** On a single Vercel instance this
  is fine. Behind multiple instances (or after frequent cold starts), an
  attacker gets more attempts than the limit suggests. Migrate to Redis
  (`@upstash/ratelimit` is a drop-in) before scaling out.
- **CSP allows `'unsafe-inline'` and `'unsafe-eval'` for scripts.** Required
  by Next.js dev tooling and React runtime. Move to nonce-based CSP once
  the portal stabilises.
- **No anomaly detection** on the audit log. Failed-login spikes are visible
  but no one is alerted automatically — operators must query.
- **No structured PII redaction.** Audit log `diff` stores raw email
  addresses. Acceptable for a school context, but flag if EU/UK data lands.

## Rotating `AUTH_SECRET`

Because sessions are JWTs signed with `AUTH_SECRET`, rotating the secret
instantly invalidates every existing session — users will land on /login on
their next request. To rotate:

1. Generate a new secret: `openssl rand -base64 32`
2. Set it in the deployment environment (Vercel → Settings → Environment
   Variables, or your host's equivalent). Replace the existing value.
3. Redeploy. There is no migration step — existing JWTs simply fail
   verification.
4. Inform staff that they will need to log in again.

This is the right step **immediately** if you suspect the secret was leaked
(committed to git, screenshared, etc.).

## Incident response

If you suspect an account is compromised:

1. **Disable the account.** Toggle `User.active = false` via Prisma Studio
   or a SQL `UPDATE`. The next session check will reject the user, and they
   cannot log in.
2. **Reset the password.** Hash a new password (use the seed script as a
   reference) and `UPDATE "User" SET "passwordHash" = '...'`.
3. **Audit recent activity.** See the query examples below.
4. **Rotate `AUTH_SECRET`** if you suspect a session token was stolen, not
   just a password.

If you suspect a broader breach:

1. Rotate `AUTH_SECRET` immediately.
2. Rotate `DATABASE_URL` credentials.
3. Snapshot the database for forensics before mutating anything.
4. Mass-disable accounts if you cannot scope the breach quickly.

## Audit log query examples

Login failures in the last 24 hours:

```sql
SELECT "createdAt", "ip", "userAgent", "diff" ->> 'email' AS attempted_email
FROM "AuditLog"
WHERE action = 'auth.login.failure'
  AND "createdAt" > now() - interval '24 hours'
ORDER BY "createdAt" DESC;
```

Failed-login concentration per IP in the last hour (brute-force detection):

```sql
SELECT "ip", COUNT(*) AS attempts, COUNT(DISTINCT "diff" ->> 'email') AS distinct_emails
FROM "AuditLog"
WHERE action = 'auth.login.failure'
  AND "createdAt" > now() - interval '1 hour'
GROUP BY "ip"
HAVING COUNT(*) >= 3
ORDER BY attempts DESC;
```

Failed logins targeting a specific account (credential stuffing):

```sql
SELECT "createdAt", "ip", "userAgent"
FROM "AuditLog"
WHERE action = 'auth.login.failure'
  AND "diff" ->> 'email' = 'admin@falconseducationsystem.com'
  AND "createdAt" > now() - interval '7 days'
ORDER BY "createdAt" DESC;
```

Successful logins from an unfamiliar IP for a given user:

```sql
SELECT "createdAt", "ip", "userAgent"
FROM "AuditLog"
WHERE action = 'auth.login.success'
  AND "actorId" = '<user-id>'
ORDER BY "createdAt" DESC
LIMIT 50;
```

## Environment variables

Authentication / session:

- `AUTH_SECRET` — 32-byte base64 secret. **Required.** Rotate to revoke
  all sessions.
- `AUTH_TRUST_HOST` — set to `true` behind a reverse proxy or on Vercel.
- `NEXTAUTH_URL` — public URL of the portal.

Database:

- `DATABASE_URL` — Postgres connection string.

Seed (`prisma/seed.ts`):

- `SEED_ADMIN_PASSWORD`
- `SEED_PRINCIPAL_PASSWORD`
- `SEED_TEACHER_PASSWORD`
- `SEED_ACCOUNTS_PASSWORD`
- `SEED_PARENT_PASSWORD`

All five are **required when `NODE_ENV=production`** — the seed will throw
on startup if any are missing. In dev they default to the (policy-compliant)
values committed in `prisma/seed.ts` and the seed prints a warning per
missing variable.

Each value must satisfy the password policy in `lib/password.ts`:

- at least 10 characters
- at least one uppercase letter
- at least one lowercase letter
- at least one digit
- at least one symbol
- not on the common-password blocklist
