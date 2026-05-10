# Falcons Education System

The complete digital surface for **Falcons Education System** — a Montessori-rooted school + coaching center on Kamalabad Road, Rawalpindi.

This repository contains two independent applications and a growing blog corpus, all sharing the same editorial brand language.

```
falconseducationsystem.com           ← marketing website (this repo, root)
portal.falconseducationsystem.com    ← school admin portal (apps/portal/, Phase 1 UI ready)
```

## What's in this repo

```
falcons-education-system/
├── app/                    ← Marketing website (Next.js 16, App Router)
├── components/             ← Website components — editorial Montessori brand
├── lib/                    ← Website helpers, constants, blog data
│   └── blog/posts/         ← One TS file per blog article (80+ SEO posts as of writing)
├── public/                 ← Website static assets
├── apps/
│   └── portal/             ← School management portal (Next.js full-stack + Prisma + Postgres)
├── docker-compose.yml      ← Local Postgres + Adminer for the portal
├── .queue/                 ← Planning notes for future Claude / agent sessions
├── package.json            ← Website deps (independent — portal has its own)
└── README.md
```

The website and portal are **independent Next.js apps** with their own `package.json`, `node_modules`, and dev servers. They are co-located so the brand language stays in sync and a future monorepo restructure (Turborepo + workspaces) is one move away.

## Quick start — the website

```bash
# Install
npm install

# Dev (port 3000)
npm run dev
# → http://localhost:3000

# Production build + serve
npm run build
npm run start

# Type check + lint
npx tsc --noEmit
npm run lint
```

Brand contact + content lives in:
- `lib/constants.ts` — name, address, phone, social, hours
- `lib/schema.ts` — JSON-LD for SEO (`Preschool`, `EducationalOrganization`, `LocalBusiness`, `FAQPage`, `BreadcrumbList`)
- `lib/blog/posts/{slug}.ts` — individual blog articles
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/opengraph-image.tsx` — auto-generated SEO surfaces

### Deploy the website

**Vercel (recommended, free tier is fine for this scale):**
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new) — Root Directory: repo root
3. Set domain to `falconseducationsystem.com` (and `www` redirect)
4. Add env if needed (none currently required for the static site)
5. Deploy — Vercel auto-detects Next.js

No `vercel.json` needed.

## Quick start — the portal

See [`apps/portal/README.md`](./apps/portal/README.md) for the full guide. Short version:

```bash
docker compose up -d              # Postgres at :5432, Adminer at :8081
cd apps/portal
npm install
cp .env.example .env.local        # edit AUTH_SECRET — `openssl rand -base64 32`
npm run db:push
npm run db:seed                   # creates admin user + classrooms
npm run dev                       # → http://localhost:3001
```

Default seeded admin credentials are in `apps/portal/.env.example`. **Change the password immediately on first login.**

### Deploy the portal

Vercel works for the portal too — set **Root Directory** to `apps/portal/` in the project settings. Use **Vercel Postgres** or **Neon** as the database. Required env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXTAUTH_URL`. See the portal README for the deploy checklist and the Phase 2 backlog before going live.

## The blog corpus

The marketing site ships with an editorial blog at `/blog`. Posts live in `lib/blog/posts/{slug}.ts` — one TS file per article exporting a typed `BlogArticle`. The full index aggregates them at `lib/blog/posts/index.ts`, and `lib/blog-data.ts` re-exports for backwards compatibility.

The blog renderer at `app/blog/[slug]/page.tsx` uses **react-markdown + remark-gfm**, so posts can use the full GFM markdown set (H2/H3 headings, ordered + unordered lists, blockquotes, tables, code, footnotes). Each post auto-renders with editorial typography.

Adding a new post:
1. Create `lib/blog/posts/your-slug.ts` with a typed `BlogArticle` export
2. Add it to the `lib/blog/posts/index.ts` array (or update the loader if it auto-discovers)
3. The `/blog/[slug]/page.tsx` route + sitemap pick it up automatically on next build

SEO is anchored in Rawalpindi/Kamalabad-Road local search — the unfair advantage vs generic global parenting content. Keep that anchor in every post.

## How the stack hangs together

```
                    ┌─────────────────────────────────────────────────┐
                    │  Marketing website  ──  Vercel  ──  Cloudflare DNS │
                    │  (root /, port 3000)                              │
                    │  Static + ISR. JSON-LD heavy. Local-SEO tuned.    │
                    └─────────────────────────────────────────────────┘
                                          │ shares
                                          ▼
                    ┌──────────────────────────────────────────────────┐
                    │  Brand language: Fraunces + Plus Jakarta Sans    │
                    │  Tokens: paper · ink · brand · accent · line     │
                    │  Lucide icons · Framer Motion · hairline borders │
                    └──────────────────────────────────────────────────┘
                                          ▲ shares
                                          │
                    ┌─────────────────────────────────────────────────┐
                    │  School portal (apps/portal/, port 3001)         │
                    │  Next.js full-stack (Server Actions + Prisma)    │
                    │  Postgres 16 (Docker locally / Neon in prod)     │
                    │  NextAuth/Auth.js v5 (Phase 2)                   │
                    └─────────────────────────────────────────────────┘
                                          │
                                          ▼
                    ┌─────────────────────────────────────────────────┐
                    │  Future: WhatsApp Business API                   │
                    │  Parent notifications (attendance, fees, etc.)   │
                    └─────────────────────────────────────────────────┘
```

The original spec called for a separate NestJS backend; we chose Next.js full-stack instead. For a single-school ERP run by one person, NestJS is 10× the boilerplate for the same outcome. If the school ever needs a mobile app or a second frontend, the Prisma layer extracts cleanly into a standalone service.

## Environments & secrets

### Website
No secrets required. The contact channels (WhatsApp, phone, email) are public on the site.

### Portal
| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | `postgresql://user:pass@host:5432/falcons_portal?schema=public` |
| `AUTH_SECRET` | Auth.js session signing key | Generate with `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | Trust proxy `X-Forwarded-*` headers in prod | `true` |
| `NEXTAUTH_URL` | Canonical portal URL | `https://portal.falconseducationsystem.com` |
| `SEED_ADMIN_EMAIL` | Initial admin email (seed only) | `admin@falconseducationsystem.com` |
| `SEED_ADMIN_PASSWORD` | Initial admin password (change on first login) | `change-me-on-first-login` |

Never commit `.env.local` or any production secret to git.

## Folder conventions

- **Component naming**: `PascalCase.tsx`, default-export the component (or named export for utility components)
- **`Stagger.Item` pattern was retired** — use `StaggerItem` as a standalone export (Framer Motion v12 + Next.js SSR doesn't like property-attached compound components)
- **No emoji in production UI** — Lucide icons everywhere
- **No `falcon-sage` legacy classes in new components** — use semantic tokens (`bg-paper`, `text-ink`, `border-line`, `text-accent`, `bg-brand`, etc.)
- **Tailwind v4** — no `tailwind.config.js`; tokens defined in `@theme` blocks inside CSS

## Working with Claude / agents on this repo

This repo is actively developed with the help of long-running Claude agents (blog writing, large refactors). Notes for future sessions:

- **`.queue/`** — planning notes for follow-up agent batches that survived context compression
- **`/Users/malikabdul/.claude/projects/-Users-malikabdul-falcons-education-system/memory/`** — persistent project memory (business purpose, brand voice rules, agent latitude)
- **Don't restructure during an active background agent run** — if a blog agent is editing `lib/blog/posts/`, large repo moves break its file paths and build calls
- **Subagents on this repo have blanket permission to install npm packages and swap rendering pipelines** when it improves output quality. Don't constrain them with the original tech-stack list if a better tool exists.

## Roadmap

### Phase 1 — done
- [x] Premium UI lift across the marketing website (warm cream + ink navy editorial brand)
- [x] 80+ SEO blog posts seeded
- [x] Markdown renderer upgraded to react-markdown + remark-gfm
- [x] Portal scaffold with login, dashboard, students, admissions pipeline, and stubs
- [x] Prisma schema covering all 7 ERP modules
- [x] Docker Postgres + seed script

### Phase 2 — next
- [ ] Wire NextAuth credentials provider + JWT sessions
- [ ] Replace portal mock data with Prisma queries
- [ ] Server Actions for student / application / payment mutations
- [ ] RBAC middleware gating routes by role
- [ ] Build out Attendance + Fees modules end-to-end (the office's daily work)
- [ ] Deep-research blog batch on phone addiction / mental health / physical health (Cluster K — see `.queue/next-blog-batch.md`)

### Phase 3 — later
- [ ] Parent portal (read-only views, separate auth surface)
- [ ] Teacher portal (attendance marking, homework upload, remarks)
- [ ] Assessment module (Montessori observations + primary grades + report cards)
- [ ] WhatsApp Business API for parent notifications
- [ ] Monorepo restructure to Turborepo + shared `packages/ui`
- [ ] Mobile app (React Native) reading from the same Prisma backend via a thin tRPC layer

## License

Private — © Falcons Education System.

---

Made in Rawalpindi by Abdul Rehman.
