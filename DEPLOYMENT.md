# Deployment Guide — Falcons Education System Portal

This guide takes the school portal from "GitHub repo" to a live URL at
`portal.falconseducationsystem.com`, end to end. It's written so a
competent web developer can execute every step in one sitting (~30 min for
the one-time setup) and so a non-engineer can follow the checklist and ask
the right questions.

The portal is a **private** Next.js application for school staff. It is
**not** for parents or the public. The marketing website at
`falconseducationsystem.com` is deployed separately.

---

## Table of contents

1. [Overview](#overview)
2. [Pre-flight checklist](#pre-flight-checklist)
3. [One-time provisioning](#one-time-provisioning) — ~30 minutes
4. [First deploy](#first-deploy)
5. [Seed the database](#seed-the-database)
6. [Custom domain](#custom-domain)
7. [Day-2 operations](#day-2-operations)
8. [Environment variables reference](#environment-variables-reference)
9. [Costs](#costs)
10. [What's NOT included](#whats-not-included)
11. [Troubleshooting](#troubleshooting)

---

## Overview

| Component         | Service                  | Plan      | Why                                                              |
| ----------------- | ------------------------ | --------- | ---------------------------------------------------------------- |
| Application       | **Vercel**               | Hobby     | Next.js 16 first-party host, free tier covers a school's traffic |
| Database          | **Neon Postgres**        | Free      | Serverless Postgres; pooled connections suit Vercel functions    |
| Error monitoring  | Sentry (optional)        | Developer | Quiet alerts when something breaks in production                 |
| Domain DNS        | Cloudflare / current DNS | -         | CNAME `portal.` → Vercel                                         |

The application code lives in `apps/portal/` inside this monorepo. Vercel
is configured (via `apps/portal/vercel.json`) to:

```
npm install
prisma generate         # build the type-safe DB client
prisma migrate deploy   # apply any pending SQL migrations
next build
```

Migrations live in `apps/portal/prisma/migrations/`. They are *append-only*
— never edit a migration that has been deployed.

---

## Pre-flight checklist

Before you start, make sure you have:

- [ ] Push access to the GitHub repository
- [ ] An email + phone you can use to sign up for Vercel and Neon
- [ ] The school's domain login (to add a CNAME record)
- [ ] `openssl` available on your machine (macOS / Linux ship with it)
- [ ] Read `SECURITY.md` (rotate the leaked GitHub PAT first — see "Rotate
      tokens" there)

---

## One-time provisioning

### 1. Rotate the leaked GitHub PAT

A personal access token was accidentally committed to git history in an
earlier phase. **Do this before anything else** — see `SECURITY.md` at the
repo root for the exact steps. If `SECURITY.md` does not exist yet, the
short version is:

1. Go to https://github.com/settings/tokens
2. Revoke any token that may have been exposed
3. Generate a new one with the minimum scopes you need
4. Do **not** commit it — use it locally or in Vercel env vars only

### 2. Create a Neon project

1. Sign up at https://neon.tech (Google login is fine)
2. Create a new project named **`falcons-portal`**
3. Region: choose **AWS Asia Pacific (Singapore)** or **Mumbai** — closest
   latency to Pakistan
4. Postgres version: **16** (matches what we test against locally)
5. After the project is created, open **Connection Details**:
   - Copy the **Pooled** connection string (the one with `-pooler` in the
     host). Looks like:
     ```
     postgresql://<user>:<pass>@ep-xxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require
     ```
   - **Use the pooled URL** for `DATABASE_URL` in Vercel — Vercel
     functions are serverless and open many short connections; pooling
     avoids exhausting Postgres connection slots.
   - Save the **direct** (non-pooled) URL somewhere safe — you'll need it
     for one-off operations like running the seed.

### 3. Create a Vercel project

1. Sign up at https://vercel.com (GitHub login is fine)
2. Click **Add New… → Project**
3. Import the `falcons-education-system` repository
4. **Important — set the Root Directory** to `apps/portal/`
   (click "Edit" next to Root Directory in the configuration screen)
5. Framework Preset should auto-detect as **Next.js**. If not, set it.
6. Do **not** deploy yet — we need to add env vars first.

### 4. Add environment variables in Vercel

In the project's **Settings → Environment Variables**, add each of these.
Set the environment scope to **Production, Preview, and Development**
unless noted otherwise. See the full reference table below for what each
one does.

```
DATABASE_URL              = <Neon pooled connection string>
AUTH_SECRET               = <run: openssl rand -base64 32>
AUTH_TRUST_HOST           = true
NEXTAUTH_URL              = https://portal.falconseducationsystem.com
SEED_ADMIN_EMAIL          = admin@falconseducationsystem.com
SEED_ADMIN_PASSWORD       = <strong password — see policy below>
SEED_PRINCIPAL_PASSWORD   = <strong password>
SEED_TEACHER_PASSWORD     = <strong password>
SEED_ACCOUNTS_PASSWORD    = <strong password>
SEED_PARENT_PASSWORD      = <strong password>
SENTRY_DSN                = <optional — leave blank if not using Sentry>
```

To generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Password policy (enforced by the seed script):

- minimum **10 characters**
- includes upper-case, lower-case, digit, and a symbol
- not on the common-passwords blocklist

Until DNS is pointed at Vercel (step 6), set `NEXTAUTH_URL` to the Vercel
preview URL Vercel assigns you (something like
`https://falcons-portal.vercel.app`) and update it once your custom domain
is live.

---

## First deploy

1. In Vercel, click **Deploy**
2. Vercel runs `npm install` → `prisma generate` → `prisma migrate deploy`
   → `next build`
3. The first migration (`0000_init`) creates every table, enum, index, and
   foreign key in your Neon database. Subsequent deploys only apply new
   migrations — they don't drop anything.
4. After ~2 minutes you'll see a green deployment with a `*.vercel.app`
   URL. Open it — you should land on the login page.

Verify the deploy:

```bash
curl https://<your-vercel-url>/api/health
# expected: {"status":"ok",...}
```

---

## Seed the database

The seed creates the initial set of users (admin, principal, teacher,
accountant, parent) plus demo classroom and academic-year rows. **Run it
once** after the first deploy.

You have two options:

### Option A — Run from your laptop against production (recommended)

```bash
# 1. Pull the repo locally if you haven't
git clone git@github.com:<your-org>/falcons-education-system.git
cd falcons-education-system/apps/portal
npm install

# 2. Create a .env file that points at the production DB
#    Use the DIRECT Neon connection string (not the pooled one) — long-running
#    seed runs better on a direct connection.
cat > .env <<EOF
DATABASE_URL="<Neon DIRECT connection string>"
AUTH_SECRET="<same as Vercel>"
SEED_ADMIN_EMAIL=admin@falconseducationsystem.com
SEED_ADMIN_PASSWORD=<same as Vercel>
SEED_PRINCIPAL_PASSWORD=<same as Vercel>
SEED_TEACHER_PASSWORD=<same as Vercel>
SEED_ACCOUNTS_PASSWORD=<same as Vercel>
SEED_PARENT_PASSWORD=<same as Vercel>
EOF

# 3. Apply migrations (Vercel already did this, but it's idempotent)
npx prisma migrate deploy

# 4. Run the seed
npx prisma db seed

# 5. Delete the .env when done — it contains production secrets
rm .env
```

The seed is idempotent (uses `upsert`) so re-running is safe, but in
production it includes a guard that refuses to overwrite real data unless
you set an explicit override flag. If you see a refusal, that's the safety
check working — read the error message before forcing past it.

### Option B — Seed via a Vercel build hook (advanced, skip on first deploy)

Not recommended for a first deploy. Use option A.

### Verify the seed worked

Open the deployed URL, click **Sign in**, log in as
`admin@falconseducationsystem.com` with the `SEED_ADMIN_PASSWORD` you set.
You should land on the dashboard.

---

## Custom domain

1. In Vercel: **Settings → Domains → Add Domain**
2. Enter `portal.falconseducationsystem.com`
3. Vercel will show you a CNAME record to add at your DNS provider:
   ```
   portal    CNAME    cname.vercel-dns.com
   ```
4. Add that record at your DNS host (Cloudflare, Namecheap, GoDaddy —
   wherever `falconseducationsystem.com` is managed)
5. Wait for DNS propagation (usually <10 minutes; can be up to an hour)
6. Vercel issues an SSL certificate automatically — no action required
7. Update `NEXTAUTH_URL` in Vercel to
   `https://portal.falconseducationsystem.com` and **redeploy**

---

## Day-2 operations

### Deploy a new version

Just push to `main`. Vercel watches the repo and redeploys automatically.
If nothing in `apps/portal/` changed, Vercel skips the build (see
`ignoreCommand` in `vercel.json`).

```bash
git push origin main
```

### Apply a new database migration

1. On your local machine, edit `apps/portal/prisma/schema.prisma`
2. Generate a migration:
   ```bash
   cd apps/portal
   # Start local postgres
   docker compose up -d postgres
   # Create the migration (applies locally too)
   npx prisma migrate dev --name <short-description>
   ```
3. Commit the new folder under `prisma/migrations/`
4. Push to `main`
5. Vercel runs `prisma migrate deploy` on the next build — your production
   DB gets the migration applied **before** the new build starts serving

**Never** edit a migration after it has been deployed. If you need to fix
something, add a new migration on top.

### Rotate `AUTH_SECRET`

Rotating invalidates every active session — all users have to log in
again. Plan it for an off-hours window.

1. Generate a new secret: `openssl rand -base64 32`
2. Update `AUTH_SECRET` in Vercel → Environment Variables
3. Redeploy (Vercel → Deployments → … → Redeploy)

### Add a user without re-seeding

Use the portal: log in as an admin, go to **Settings → Users → New user**.
The seed is only meant for first boot.

### Back up and restore

Neon provides **point-in-time recovery** automatically. On the free tier
you can restore to any point in the last **7 days** from the Neon console
(**Branches → Create branch from history**). The free tier does not
include automated snapshots beyond that — for production, upgrade to a
paid tier or run a weekly `pg_dump` to an off-site location.

Manual export (run from a machine with `pg_dump` and the direct Neon URL):

```bash
pg_dump "<DIRECT_DATABASE_URL>" \
  --no-owner --no-privileges --clean --if-exists \
  --file backup-$(date +%F).sql
```

### Monitor health

The portal exposes a JSON health check at `/api/health`. Wire it into your
uptime monitor of choice (UptimeRobot's free tier checks every 5 minutes).

```bash
curl https://portal.falconseducationsystem.com/api/health
```

Vercel also surfaces request logs and error rates under
**Observability** in the project dashboard.

### Read audit logs

Every meaningful write (login, stage change, payment, etc.) lands in the
`AuditLog` table.

- **Locally:** open Adminer at http://localhost:8081 (started by
  `docker compose up`) and browse the `AuditLog` table.
- **In production:** open the Neon dashboard → **SQL Editor** and run:

  ```sql
  select "createdAt", "actorId", action, "entityType", "entityId"
  from "AuditLog"
  order by "createdAt" desc
  limit 100;
  ```

---

## Environment variables reference

Every variable the portal reads at runtime or build time:

| Variable                  | Required        | Where set            | What it does                                                                                                |
| ------------------------- | --------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | **yes**         | Vercel + local       | Postgres connection string. Use the Neon **pooled** URL on Vercel; the direct URL locally and for seeding.   |
| `AUTH_SECRET`             | **yes**         | Vercel + local       | NextAuth JWT signing secret. Must be ≥ 32 chars. Generate with `openssl rand -base64 32`.                    |
| `AUTH_TRUST_HOST`         | **yes** in prod | Vercel               | Set to `true` so NextAuth trusts the `Host` header behind Vercel's proxy.                                    |
| `NEXTAUTH_URL`            | **yes** in prod | Vercel               | Public URL of the portal. Used for OAuth callbacks and absolute links.                                       |
| `NODE_ENV`                | auto            | Vercel (auto)        | Vercel sets this to `production` automatically. You can leave it unset locally; it defaults to `development`. |
| `SEED_ADMIN_EMAIL`        | seed only       | Vercel + local       | Email for the SUPER_ADMIN user created by the seed script.                                                  |
| `SEED_ADMIN_PASSWORD`     | seed only       | Vercel + local       | Password for SUPER_ADMIN. Must satisfy the password policy (≥10 chars, mixed case + digit + symbol).         |
| `SEED_PRINCIPAL_PASSWORD` | seed only       | Vercel + local       | Password for the SCHOOL_ADMIN seed user.                                                                    |
| `SEED_TEACHER_PASSWORD`   | seed only       | Vercel + local       | Password for the TEACHER seed user.                                                                         |
| `SEED_ACCOUNTS_PASSWORD`  | seed only       | Vercel + local       | Password for the ACCOUNTANT seed user.                                                                      |
| `SEED_PARENT_PASSWORD`    | seed only       | Vercel + local       | Password for the PARENT seed user.                                                                          |
| `SENTRY_DSN`              | optional        | Vercel               | Sentry project DSN. Omit and the portal runs without error reporting.                                       |

For the canonical local-dev list see `apps/portal/.env.example`.

---

## Costs

At the school's expected scale (≤ 50 staff users, ≤ 1,000 students,
≤ 1 GB of database storage in year one):

| Item                     | Plan         | Limit                                      | Cost (PKR/mo) |
| ------------------------ | ------------ | ------------------------------------------ | ------------- |
| Vercel — Hobby           | Hobby        | 100 GB bandwidth, 100k function invocations | **0**         |
| Neon — Free              | Free         | 0.5 GB storage, 191 compute-hours/mo       | **0**         |
| Sentry — Developer       | Developer    | 5,000 events/mo                            | **0**         |
| Domain (`.com.pk` or `.com`) | (existing)  | already paid for the marketing site       | **0**         |
| **Total out-of-pocket**  |              |                                            | **0**         |

If the school grows past the free tiers:

- Neon **Launch** ($19/mo) — 10 GB storage, branching, longer point-in-time recovery
- Vercel **Pro** ($20/seat/mo) — only needed if you want multiple developers in the dashboard
- Sentry **Team** ($26/mo) — more events + longer retention

---

## What's NOT included

These are intentional cuts to keep Phase 2 shippable. Each has a clear
follow-up path:

| Feature                  | Why deferred                          | What unlocks it                                            |
| ------------------------ | ------------------------------------- | ---------------------------------------------------------- |
| WhatsApp notifications   | Needs WhatsApp Business API approval  | Add `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` env vars |
| File uploads             | Vercel functions can't write to disk  | Add `BLOB_READ_WRITE_TOKEN` (Vercel Blob) or S3 creds      |
| Transactional email      | Avoids a third paid service           | Add `RESEND_API_KEY` or SMTP creds                         |
| SMS notifications        | Telco integration is country-specific | Pick a provider (e.g., Twilio) and add credentials         |
| Automated backups        | Free Neon tier covers 7 days          | Upgrade Neon **or** run a weekly `pg_dump` cron            |
| 2FA / OTP login          | Out of scope for Phase 2              | Add an OTP provider; NextAuth v5 supports it natively      |

---

## Troubleshooting

### "Invalid environment configuration" on cold start

The portal validates env vars at boot via `apps/portal/lib/env.ts`. The
log lists exactly which variable failed and why. Common cases:

- `DATABASE_URL: Invalid url` — the value isn't a valid URL. Did you wrap
  it in quotes that became part of the value? In Vercel, don't add quotes.
- `AUTH_SECRET: must be at least 32 characters` — regenerate with
  `openssl rand -base64 32` and paste the full output.

### Build fails: `Can't reach database server at ...`

`prisma migrate deploy` runs at build time. The build VM cannot reach your
Neon database. Causes:

1. `DATABASE_URL` is wrong / has a typo
2. Neon project is **suspended** (free-tier projects auto-suspend after 5
   min of inactivity; the first connection wakes them. Re-trigger the
   build, it should succeed on the second try.)
3. You used a connection string with `?sslmode=disable` — Neon requires
   `?sslmode=require`

### "Migration drift detected"

This means the production database has a schema that doesn't match the
migration history. Almost always caused by someone running
`prisma db push` against production (don't do that — use migrations).

Resolution:

```bash
# Inspect the drift
DATABASE_URL=<direct_url> npx prisma migrate status

# If the drift is safe to drop, baseline the existing DB:
DATABASE_URL=<direct_url> npx prisma migrate resolve --applied 0000_init
```

If you're unsure, snapshot first (`pg_dump`) and ask before resolving.

### Login works locally but fails in production

Three usual suspects:

1. `NEXTAUTH_URL` doesn't match the URL you're actually visiting
2. `AUTH_TRUST_HOST` is not set to `true`
3. `AUTH_SECRET` differs between Vercel and local — JWTs minted with one
   secret can't be verified with another. Sessions issued before the
   change are dead; log in again.

### `prisma generate` succeeds but types are stale

Vercel caches `node_modules`. After upgrading `@prisma/client`, redeploy
with **Use existing Build Cache** unchecked once.

### Vercel keeps rebuilding even when only the marketing site changed

The `ignoreCommand` in `apps/portal/vercel.json` skips builds when nothing
in the portal directory changed. If you're seeing rebuilds anyway, check
that Vercel's "Root Directory" is set to `apps/portal/` — not the repo
root.

### Health endpoint returns 500

```bash
curl https://portal.falconseducationsystem.com/api/health
```

`/api/health` runs a minimal `SELECT 1` against the database. A 500
usually means the database is unreachable. Check Neon's status page and
the Vercel function logs.

---

## Where to look when something is on fire

| Symptom                        | First check                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| Site is down                   | https://www.vercel-status.com — Vercel outage?               |
| Login broken                   | Vercel → Logs → search `auth`                                |
| 500s on a specific page        | Vercel → Logs (filter by path)                               |
| Slow queries                   | Neon → Monitoring → query stats                              |
| Disk filling                   | Neon → Storage; consider archiving old `AuditLog` rows       |
| Unknown error in browser       | If Sentry is wired, check the issues feed first              |

Keep this file updated as the deploy evolves — the next person to ship
should be able to follow it without you on the call.
