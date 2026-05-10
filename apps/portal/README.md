# Falcons · School Portal

Internal admin portal for **Falcons Education System** — handles admissions, students, attendance, fees, assessments, and the dashboard the school office runs day to day.

Lives alongside the marketing website in this repo. The website (root `app/`) and the portal (`apps/portal/`) share brand language but are independent Next.js apps with isolated dependencies.

## Stack

- **Next.js 16** App Router (full-stack — server actions + route handlers, no separate API server)
- **React 19**, **TypeScript 5**
- **Tailwind v4** with shared design tokens (warm cream paper / ink navy / refined brand blue / muted gold)
- **Fraunces** (variable serif display) + **Plus Jakarta Sans** (body)
- **Prisma 6** + **PostgreSQL 16** (via Docker locally)
- **NextAuth/Auth.js v5** (wired in Phase 2)
- **Recharts** for analytics; **Lucide** for icons; **Framer Motion** for entrances
- **TanStack Table** + **Zod** for tabular data and validation

## Quick start

```bash
# 1. Install dependencies (in this folder)
cd apps/portal
npm install

# 2. Start Postgres locally (from repo root)
cd ../..
docker compose up -d

# 3. Configure env
cd apps/portal
cp .env.example .env.local
# (defaults match docker-compose creds; edit AUTH_SECRET — `openssl rand -base64 32`)

# 4. Push schema + seed
npm run db:push
npm run db:seed

# 5. Run the dev server (port 3001)
npm run dev
# → http://localhost:3001

# Admin login defaults from .env.local (seed reads these):
# email: admin@falconseducationsystem.com
# password: change-me-on-first-login   ← change immediately
```

The marketing website runs at `:3000` (from the repo root); the portal runs at `:3001`.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start dev server on port 3001 (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:push` | Push schema to DB **without** a migration (dev iteration) |
| `npm run db:migrate` | Create a new migration and apply it |
| `npm run db:seed` | Run `prisma/seed.ts` — creates admin user + classrooms |
| `npm run db:studio` | Open Prisma Studio to browse data |

## Project layout

```
apps/portal/
├── app/
│   ├── (app)/                ← signed-in routes share Sidebar + TopBar
│   │   ├── layout.tsx
│   │   ├── dashboard/        ← KPIs, charts, activity feed
│   │   ├── students/         ← list + search + filters (real table)
│   │   ├── admissions/       ← Kanban pipeline (received → enrolled)
│   │   ├── attendance/       ← Phase 2
│   │   ├── fees/             ← Phase 2
│   │   ├── teachers/         ← Phase 2
│   │   ├── parents/          ← Phase 2
│   │   ├── assessments/      ← Phase 2
│   │   └── settings/         ← Phase 2
│   ├── (auth)/
│   │   └── login/            ← editorial split-screen login (UI only — Phase 2 wires NextAuth)
│   ├── globals.css           ← design tokens + base styles
│   ├── layout.tsx            ← root layout + fonts
│   └── page.tsx              ← redirects to /dashboard
├── components/
│   ├── layout/               ← Sidebar, TopBar, PageHeader
│   ├── ui/                   ← Card, Chip, Avatar, ComingSoon
│   └── data/                 ← KPI, AttendanceChart, FeesChart, ActivityFeed, StudentsTable, AdmissionsPipeline
├── lib/
│   ├── cn.ts
│   ├── format.ts             ← PKR / number / percent / date / relative time
│   ├── mock-data.ts          ← TODO mock — replace with Prisma queries in Phase 2
│   └── nav.ts                ← sidebar + breadcrumb nav config
├── prisma/
│   ├── schema.prisma         ← full ERP schema — see below
│   └── seed.ts               ← admin user + classrooms
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.js
├── tsconfig.json
└── eslint.config.mjs
```

## Database schema overview

`prisma/schema.prisma` covers the full school operation:

| Group | Models |
| --- | --- |
| Auth | `User`, `Session` |
| People | `Student`, `Guardian`, `StudentGuardian`, `Teacher` |
| Admissions | `Application`, `Document` |
| Academic structure | `AcademicYear`, `Classroom`, `Enrollment` |
| Attendance | `Attendance` |
| Fees | `FeeStructure`, `Invoice`, `Payment` |
| Assessment | `Assessment` (Montessori observations + primary grades) |
| Comms | `Announcement`, `Notification`, `Homework` |
| Compliance | `AuditLog` |

Notes:
- **Soft delete** via `deletedAt` on key entities (`User`, `Student`, `Guardian`)
- **Decimal(12,2)** for money columns — avoid `Float` for currency
- **Unique attendance per student per day** (`@@unique([studentId, date])`)
- **Multi-guardian** support via `StudentGuardian` join table (siblings + step-parents are real)
- **Pakistani-context fields**: `cnic`, `whatsapp` separate from `phone`, JazzCash + EasyPaisa payment methods
- **Montessori-mode assessment**: free-text `area`, `milestone`, `notes` instead of numeric grades for early years

After schema changes:
```bash
npm run db:push          # dev — fast iteration
# or
npm run db:migrate       # creates a versioned migration
npm run db:generate      # always run if you only edited types
```

## What's built today (Phase 1)

UI is **complete and clickable** with mock data:
- Login page (editorial split-screen)
- Dashboard with 4 KPIs, attendance bar chart, fees area chart, activity feed, announcements
- Students list with search, classroom filter, status chips, dues tracking
- Admissions Kanban pipeline (Received → Interview → Approved → Enrolled)
- Coming-Soon framed pages for Attendance, Fees, Teachers, Parents, Assessments, Settings — all sidebar links resolve

## What's next (Phase 2)

In priority order:

1. **Wire NextAuth** credentials provider + JWT sessions, replace login page TODO
2. **Replace mock data** in `lib/mock-data.ts` with Prisma queries in Server Components
3. **Server Actions** for mutations: create student, advance application stage, record payment
4. **RBAC middleware** — gate routes by `Role` using `middleware.ts`
5. **Attendance module** — daily entry per classroom, parent WhatsApp on absence
6. **Fees module** — fee structures, monthly invoice generation, payment recording, PDF challan
7. **Assessment module** — Montessori observation form + primary grade entry
8. **Parent portal** — separate read-only views for guardians (gated `Role.PARENT`)
9. **WhatsApp Business API** integration for transactional notifications
10. **Audit logging** via Prisma middleware

## Deploy

### Local production build
```bash
npm run build
npm run start         # serves on :3001
```

### Vercel (recommended for the portal)
- Connect this repo to Vercel, set **Root Directory** to `apps/portal`
- Environment variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXTAUTH_URL`
- Use **Vercel Postgres** or **Neon** for managed Postgres (cheapest sane options)
- Vercel auto-detects Next.js — no `vercel.json` needed
- Add `prisma generate` to `package.json` build step if Vercel cache strips it:
  ```json
  "scripts": { "build": "prisma generate && next build" }
  ```

### Self-host (Railway / Fly.io / VPS)
- Use the same Postgres (or a managed equivalent)
- Set `NODE_ENV=production`
- Reverse-proxy via Caddy / Nginx with HTTPS
- Run `npm run db:migrate deploy` on each deploy
- Set `AUTH_TRUST_HOST=true` if behind a proxy

### What NOT to deploy yet
- Phase 1 UI runs against mock data — there's no real persistence until Phase 2 ships the Prisma-backed queries and auth. Don't put this in front of real parents without auth wired.

## Brand voice (for future contributors / Claude sessions)

The portal inherits the marketing website's editorial Montessori brand:
- Warm cream surfaces, ink navy text, refined brand blue, muted gold accent
- Fraunces serif display + Plus Jakarta Sans body
- Lucide icons (no emoji)
- Hairline borders, soft shadows, 8px spacing rhythm
- Editorial cues: eyebrow labels with section numbers, "01 / 02 / 03" notation, optical-sized display headings, italic Fraunces for accent words

Whenever you add new components, mirror this language. The portal is dense data UI but should never feel like a SaaS template — keep typography editorial and chrome quiet.
