# Portal Phase 2 — Setup notes

This document captures the exact commands needed to bring the portal online
once Postgres is reachable, and the demo credentials that the seed script
creates.

## 1. Database setup

Make sure `DATABASE_URL` in `.env` points at a running Postgres instance.
The repo ships with `docker-compose.yml` at the repository root which can
be used to start one locally:

```bash
docker compose up -d postgres
```

Then, from `apps/portal`:

```bash
cd apps/portal
npx prisma migrate dev --name phase2-auth-schema
npm run db:seed
```

Run order matters — `migrate dev` creates the tables, then `db:seed`
populates demo data. Both commands are idempotent (seed uses `upsert`),
so re-running is safe.

If you only need to refresh the generated Prisma client (no DB needed):

```bash
npm run db:generate
```

## 2. Demo credentials

The seed creates one user per role:

| Email                                       | Password              | Role         |
| ------------------------------------------- | --------------------- | ------------ |
| admin@falconseducationsystem.com            | Falcons@Admin1        | SUPER_ADMIN  |
| principal@falconseducationsystem.com        | Falcons@Principal1    | SCHOOL_ADMIN |
| teacher@falconseducationsystem.com          | Falcons@Teacher1      | TEACHER      |
| accounts@falconseducationsystem.com         | Falcons@Accounts1     | ACCOUNTANT   |
| parent@falconseducationsystem.com           | Falcons@Parent1       | PARENT       |

Plus four anonymous teacher accounts used only for homeroom assignments
(teacher2..teacher5@falconseducationsystem.com, password
`Falcons@TeacherN`). These are not intended to be logged in as.

## 3. Auth-related env vars

```
AUTH_SECRET=<openssl rand -base64 32>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3001
DATABASE_URL=postgresql://falcons:falcons@localhost:5432/falcons_portal?schema=public
```

`.env.example` already lists these — copy to `.env` and fill in
`AUTH_SECRET`.

## 4. Known TODOs (deferred)

- **Attendance trend KPI** — `attendanceTrend` is hard-coded to `0` in
  `lib/queries/dashboard.ts:getKpis()`. The "vs avg" delta should compare
  today's attendance percentage to the trailing 30-day average; left as
  Phase 3 work because the seed only generates 6 days of attendance.
- **StudentsTable pagination** — server action returns `{ page, pageSize }`
  but the UI Prev/Next buttons are still stubbed. Wire when page sizes
  exceed 50 in practice.
- **Application "Declined" stage** — pipeline UI shows only the four
  forward stages. Declined is in the schema and queries already handle
  it; UI rail can be added later.
- **TopBar user menu** — the topbar currently has no user context. Phase
  2 left it untouched; future work can mirror Sidebar's user section.

## 5. What changed in this phase

- NextAuth v5 with Credentials provider, Prisma adapter, JWT sessions.
- `middleware.ts` redirects unauthenticated users to `/login` and signed-in
  users away from `/login`.
- Live data: dashboard KPIs/charts/activity, students list, admissions
  pipeline now read from Postgres via `lib/queries/*`.
- Server actions: `moveStage` (admissions, gated to admin roles) and
  `searchStudents` (students table, gated to admin + teacher).
- Sidebar filters nav items by role and renders the signed-in user's
  name/email. Sign-out wired via server action.
- Seed produces 30 students, 6 months of invoices/payments, 6 days of
  attendance, 8 applications, announcements, and audit log entries.
