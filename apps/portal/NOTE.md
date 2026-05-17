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
  `lib/queries/dashboard.ts:getKpis()`. The seed now generates 30 days of
  attendance so the "vs avg" delta math has enough history; the query
  itself still needs wiring (returns 0 today).
- **StudentsTable pagination** — server action returns `{ page, pageSize }`
  but the UI Prev/Next buttons are still stubbed. Wire when page sizes
  exceed 50 in practice.
- **Application "Declined" stage** — pipeline UI shows only the four
  forward stages. Declined is in the schema and queries already handle
  it; UI rail can be added later.
- **TopBar user menu** — the topbar currently has no user context. Phase
  2 left it untouched; future work can mirror Sidebar's user section.
- **Homework** — the model exists and audit log rows reference homework
  actions, but no homework rows are seeded yet (no UI consumer in Phase
  2). Add once the homework module ships.
- **Notifications** — the `Notification` table is unseeded; the UI does
  not yet read from it.

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
- **Expanded seed (this iteration)** — every module page now has realistic
  content and every filter chip has rows on first boot:
  - **Users / Teachers** — 9 users total (5 demo roles + 4 anonymous
    teachers, of which 2 are seeded INACTIVE so the Teachers filter chip
    has rows). 3 active teachers have homerooms across Class 1/2/3/4/5 +
    Montessori A.
  - **Academic years** — 3 years (`2024-25`, `2025-26`, `2026-27`); only
    `2026-27` is current.
  - **Students** — 30 students. Mix of statuses: 1 `ON_LEAVE`, 1
    `INACTIVE`, 28 `ACTIVE`. One sibling family (guardian-0 → 2 students).
  - **Guardians** — 30 guardians. Relation mix covers Father / Mother /
    Guardian (so the relation filter chip lights up all three values).
    Half have WhatsApp distinct from phone; a few have CNICs; some have
    addresses + emails.
  - **Fees** — Monthly fee structure per classroom + 1 quarterly Activity
    Fund + 1 inactive one-time Admission Fee on Class 3. Invoices: 6
    months × 30 students (~180). Latest month carries a deliberate status
    mix — ~16 PAID, 7 OVERDUE, 3 PARTIALLY_PAID (with half-amount Payment
    rows), 3 ISSUED with future due dates, 1 CANCELLED. One PAID invoice
    is split into 3 Payment rows (CASH + EASYPAISA + BANK_TRANSFER) so
    the invoice detail "Payment history" panel shows multiples.
  - **Attendance** — 30 days × ~28 students (~840 rows; ON_LEAVE and
    INACTIVE students are skipped). Today: 2 students unmarked (so
    "Mark all present" has work), 1 SICK, 1 EXCUSED, 1 LATE, others a
    realistic mix.
  - **Assessments** — ~15 Montessori observations across Nursery /
    Montessori A / KG (mixed areas + qualitative milestones), full term
    of primary grades for Class 3 (every student × Math/Urdu/English with
    scores 45–95 and derived A+/A/B+/B/C/F grade), plus partial Class 4
    and Class 5 sets. `assessedBy` is the homeroom teacher when assigned.
  - **Applications** — 9 applications across all forward stages. `app-109`
    has `interviewAt` and `interviewNotes` populated plus 2 Document rows
    (Birth certificate + Previous report card). `app-106` (ENROLLED) is
    linked to a real seeded student so the "View student record" header
    button has a target.
  - **Announcements** — 8 total covering every audience: pinned ALL,
    STAFF_ONLY, PARENTS_ONLY (2), CLASSROOM (linked to Class 3), and
    CUSTOM (with `expiresAt` 7 days out).
  - **Audit log** — 6 baseline rows + 3 rows per active teacher
    (`attendance.mark` / `assessment.create` / `homework.create`) so the
    Teacher detail "Recent activity" panel is populated.
