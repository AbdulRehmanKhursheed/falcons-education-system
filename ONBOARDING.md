# Onboarding — Falcons Education System

> If you're new to this repo (human or Claude session), read this front-to-back **before** changing anything. It's the fastest way to ship work that fits.

## 1 · What this repo is

The complete digital surface for **Falcons Education System** — a Montessori-rooted school + coaching center on Kamalabad Road, Sonari Bank, near Bakra Mandi, Rawalpindi, Pakistan. Founded August 2024.

Two independent Next.js apps live here:

| App | Path | Port (dev) | Purpose |
| --- | --- | --- | --- |
| **Marketing website** | repo root (`app/`, `components/`, `lib/`) | 3000 | Local-SEO lead-gen. Drives parents to WhatsApp / phone / `/admissions`. Static + ISR. |
| **School portal (ERP)** | `apps/portal/` | 3001 | Internal admin tool for the office. Admissions, students, attendance, fees, assessments. Postgres + Prisma. |

They share brand language but ship and deploy independently.

The site also hosts an editorial blog at `/blog` with **80+ SEO articles** (and growing) on Montessori, parenting, child development, and local Rawalpindi parent topics. Posts live in `lib/blog/posts/{slug}.ts`.

## 2 · Tech stack at a glance

```
Marketing website        Portal (apps/portal/)
─────────────────        ─────────────────────
Next.js 16               Next.js 16 (full-stack)
React 19                 React 19
TypeScript 5             TypeScript 5
Tailwind v4              Tailwind v4
Lucide 1.x icons         Lucide 1.x icons
Framer Motion 12         Framer Motion 12
react-markdown           Recharts (analytics)
remark-gfm               TanStack Table (data grids)
                         Prisma 6 + Postgres 16
                         NextAuth/Auth.js v5 (Phase 2)
                         Zod (validation)
                         bcryptjs (passwords)
```

**Important architecture decision:** The portal is **Next.js full-stack** (Server Actions + Prisma directly). The original spec mentioned a separate NestJS backend; we chose not to add it. For a single-school ERP run by one developer, NestJS is roughly 10× the boilerplate for the same outcome. If you ever need a mobile app or second frontend, the Prisma layer extracts cleanly into a standalone service (tRPC, REST, or NestJS). Don't add NestJS to the portal "just to match the original brief" — it's a regression for this team size and stage.

## 3 · Running the apps locally

### Prereqs

- **Node.js 20+** (works on 22, 24)
- **npm** (or pnpm if you migrate to workspaces later)
- **Docker Desktop** (for Postgres when running the portal)
- A fresh `git clone` of this repo

### Website only (no DB needed)

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Portal (needs Postgres)

```bash
# 1. Start Postgres (from repo root)
docker compose up -d
# → Postgres on :5432, Adminer on :8081

# 2. Install portal deps + set up env
cd apps/portal
npm install
cp .env.example .env.local
# Edit AUTH_SECRET — generate one: openssl rand -base64 32

# 3. Push schema + seed
npm run db:push       # dev iteration (skip migrations file)
# or: npm run db:migrate  # creates a versioned migration
npm run db:seed       # creates admin + classrooms

# 4. Run dev server
npm run dev
# → http://localhost:3001
```

Default seeded admin: `admin@falconseducationsystem.com` / `change-me-on-first-login`. **Change the password on first login.**

### Both at once

Open two terminals. The apps run on different ports (3000 and 3001) and have isolated `node_modules`, so they don't conflict.

## 4 · Building & deploying

### Marketing website → Vercel

1. Push to GitHub
2. Vercel → New Project → Import this repo → **Root Directory: `/`**
3. Domain: `falconseducationsystem.com` + `www` redirect
4. No env vars required
5. Deploy

Vercel auto-detects Next.js. Subsequent pushes auto-deploy.

### Portal → Vercel (recommended) or self-host

**Vercel path:**
1. New Vercel project → same repo → **Root Directory: `apps/portal`**
2. Database: **Vercel Postgres** or **Neon** (free tier sufficient initially)
3. Env vars (Production scope):
   - `DATABASE_URL` — from Vercel Postgres / Neon
   - `AUTH_SECRET` — `openssl rand -base64 32` (different per environment)
   - `AUTH_TRUST_HOST=true`
   - `NEXTAUTH_URL=https://portal.falconseducationsystem.com`
4. If Vercel cache strips Prisma's generated client, prefix build:
   ```json
   "build": "prisma generate && next build"
   ```
5. Run migrations once on first deploy:
   - Use Vercel's Postgres SQL editor to run `prisma migrate deploy`, OR
   - Run from your machine: `DATABASE_URL=<prod-url> npx prisma migrate deploy`
6. Run seed once: `DATABASE_URL=<prod-url> npm run db:seed`
7. Domain: `portal.falconseducationsystem.com`

**Self-host path (Railway / Fly.io / VPS):**
- Postgres: managed (Railway, Neon, RDS) or self-run via Docker
- Node 20+, run `npm ci && npm run build && npm run start`
- Reverse-proxy with Caddy or Nginx; HTTPS via Let's Encrypt
- Set `AUTH_TRUST_HOST=true` behind the proxy

### What NOT to deploy

- **Portal Phase 1 is mock-data UI.** Auth is not wired. Don't expose to real parents until Phase 2 ships (NextAuth + Prisma queries + Server Actions).
- The blog corpus is good to deploy — it's all static, SEO-optimized, render-tested.

## 5 · Brand voice & design system

The brand is **editorial Montessori** — calm, deliberate, warm. Not "kid-friendly SaaS template," not "premium tech startup." Think: a thoughtfully designed independent school's prospectus crossed with a literary journal.

### Color tokens (defined in CSS `@theme` blocks)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-ink` | `#0F1F3A` | Primary text, dark surfaces |
| `--color-ink-soft` | `#2A3F60` | Body text |
| `--color-ink-muted` | `#5B6F8D` | Secondary text |
| `--color-ink-faint` | `#93A4BD` | Tertiary text, meta |
| `--color-paper` | `#FAF7F1` | Primary warm-cream surface |
| `--color-paper-warm` | `#F3EEE3` | Slightly deeper cream |
| `--color-brand` | `#1376C8` | Refined brand blue |
| `--color-brand-dark` | `#0A4A85` | Brand hover / dark CTA |
| `--color-accent` | `#B98842` | Muted warm gold — use sparingly |
| `--color-line` | `#E5DCC8` | Warm hairline border |

The legacy `falcon-sage` / `falcon-cream` class names in the website still work — they're aliased to the new values for backward compatibility. **Don't add new components using legacy names.**

### Typography

- **Display:** `Fraunces` (variable serif, optical sizing + softness axis). Loaded via `next/font/google` as `--font-fraunces`. Use `style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}` on large headings for proper optical adjustment.
- **Body:** `Plus Jakarta Sans`. Loaded as `--font-jakarta`.
- **Mono:** system mono stack. Used for numerals in tables (`tabular` utility class), small caps eyebrow labels, technical metadata.

Italics in Fraunces use the `SOFT` axis bumped to `100` for genuine optical italic — looks distinctly more inviting on accent words ("begin", "first", "quiet visit", etc.). Standard pattern:

```tsx
<h2 className="font-display text-5xl">
  Plain text{' '}
  <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
    accent words
  </span>
  .
</h2>
```

### Icons

- **`lucide-react@^1.14`** everywhere. **No emoji in production UI**, ever. Not in titles, not in placeholders, not in CTAs.
- Lucide v1 removed brand-name icons (Instagram, Facebook, TikTok). For those we use minimal inline SVG glyphs — see `components/Footer.tsx` and `components/SocialLinks.tsx` for the pattern.

### Layout patterns

- **Eyebrow numbering**: section labels like `01 — Admissions`, `02 — The school`. Use the `<Eyebrow>` component (`components/ui/Eyebrow.tsx` on the website).
- **Hairline borders**: prefer `border-line` over heavy shadows. Cards use `1px` borders + soft `--shadow-paper`.
- **Corner marks** on framed elements: small `border-t border-l` snippets at each corner of an image plate / quote block. See `Hero.tsx` ("The Brief" card), `About.tsx` (plate 01), `Gallery.tsx`.
- **Asymmetric editorial grids**: most marketing sections use `lg:grid-cols-12` with `lg:col-span-7` text + `lg:col-span-5` accent. Don't center everything.
- **Single primary CTA per section.** Multiple competing CTAs is the #1 template tell.

### Motion

- Section entrances use `<FadeIn>` and `<Stagger>` from `components/ui/Motion.tsx` (website) and similar patterns in the portal.
- **`Stagger.Item` pattern is forbidden** — Framer Motion v12 + Next.js SSR breaks on property-attached compound components. Use `StaggerItem` as a standalone named export.

### Markdown rendering

- Blog uses `react-markdown` + `remark-gfm` (see `app/blog/[slug]/page.tsx`).
- Posts can use: H2, H3, ordered + unordered lists, bold, italic, links, blockquotes, tables, code, hr, footnotes.
- Editorial component overrides give each element a custom render. **Don't reach for a "prose" Tailwind plugin** — the custom overrides match brand voice better.

## 6 · Conventions

### File / component naming
- `PascalCase.tsx` for components, default exports
- Utility components (`Eyebrow`, `Chip`, `Avatar`) under `components/ui/`
- Data-bound components under `components/data/`
- Layout shells under `components/layout/`

### TypeScript
- Strict mode on
- Avoid `any` — use `unknown` and narrow
- Use Zod schemas for any user input
- Server Actions must validate inputs with Zod before touching the DB

### Tailwind v4
- No `tailwind.config.js` — tokens are in `@theme` blocks inside CSS
- Use `@utility name` for custom utilities (see `globals.css`)
- Prefer semantic token names (`bg-paper`, `text-ink`) over raw values

### Database (portal)
- `Decimal(12,2)` for money — never `Float`
- `@@unique([studentId, date])` on attendance prevents double-marking
- Soft delete via `deletedAt` on key entities; never hard-delete `Student`, `Guardian`, `User`
- All money in PKR; format with `formatPKR()` from `lib/format.ts`

### Git
- Default branch: `main`
- Conventional-ish commit messages: `Refine X`, `Add Y`, `Fix Z`
- Don't commit `.env*.local`, `node_modules`, `.next/`, generated Prisma client output
- Branch for big work (`feat/portal-attendance`, etc.); small fixes can land on main

## 7 · Where state lives

| State | Location |
| --- | --- |
| Website static content | `lib/constants.ts`, `lib/schema.ts`, MDX-like article files |
| Blog articles | `lib/blog/posts/{slug}.ts` — one TS file per post |
| Brand contact info | `lib/constants.ts` — single source of truth |
| Portal mock data | `apps/portal/lib/mock-data.ts` (TODO: replace in Phase 2) |
| Portal real data | Postgres via Prisma — `apps/portal/prisma/schema.prisma` |
| Portal env | `apps/portal/.env.local` (never committed) |
| Local Postgres data | `falcons-postgres-data` Docker volume |
| Planning notes for future sessions | `.queue/*.md` |
| Persistent Claude memory | `/Users/malikabdul/.claude/projects/-Users-malikabdul-falcons-education-system/memory/` |

## 8 · Phase status

### Done
- ✅ Premium UI lift across the website (Hero, Header, Footer, About, Programs, Gallery, Testimonials, Admissions, Contact, FAQ, SocialLinks, MobileActionBar, WhatsAppButton)
- ✅ Editorial Journal teaser on homepage pulling latest blog posts
- ✅ Blog markdown renderer upgraded to react-markdown + remark-gfm
- ✅ 80+ SEO blog posts written (more arriving — see Phase 2)
- ✅ Portal scaffold (login UI, dashboard with KPIs + charts + activity, students list, admissions Kanban, stub pages for all other modules)
- ✅ Full Prisma schema covering 7 ERP modules + audit log
- ✅ Docker Postgres + Adminer + seed script

### Phase 2 (next)
1. **Wire NextAuth credentials provider** + JWT sessions, replace login `setTimeout` stub
2. **Replace portal mock data** in `apps/portal/lib/mock-data.ts` with real Prisma queries from Server Components
3. **Server Actions** for student/application/payment mutations
4. **RBAC middleware** (`apps/portal/middleware.ts`) gating routes by `Role`
5. **Attendance module** — daily entry, parent WhatsApp on absence
6. **Fees module** — fee structures, invoice generation, payment recording, PDF challan
7. **Cluster K blog batch** — 10 deep-research posts on mobile addiction, mental health, physical health (`.queue/next-blog-batch.md`)

### Phase 3 (later)
- Parent portal (read-only views, separate auth surface)
- Teacher portal (attendance marking, homework, remarks)
- Assessment module (Montessori observations + primary grades + PDF report cards)
- WhatsApp Business API integration
- Monorepo restructure to Turborepo + `packages/ui` for genuinely shared components
- Mobile app (React Native + tRPC layer over Prisma)

## 9 · Working with Claude / agents on this repo

This repo is actively co-developed with long-running Claude agents (blog writing, big refactors). Notes for future sessions:

- **`.queue/`** — planning notes for batches that didn't fit one session
- **Project memory** at `/Users/malikabdul/.claude/projects/-Users-malikabdul-falcons-education-system/memory/` — business purpose, brand voice rules, agent latitude permission
- **Don't restructure the repo during an active background agent run.** If a blog agent is editing `lib/blog/posts/`, moves like the eventual monorepo migration will break its paths and crash its `npm run build` calls. Wait for the agent to finish, or work in `apps/portal/` (which is isolated).
- **Subagents have blanket permission** to install npm packages and swap rendering pipelines when it improves output. Don't constrain them with original-prompt tech-stack lists if a better tool exists.
- **Don't read `.output` files from local_agent runs via shell tools** — they're full sub-agent transcripts and overflow Claude's context. Use TaskOutput sparingly.

## 10 · Critical gotchas

- **Lucide v1** changed icon names + removed brand glyphs. If you see `Module '"lucide-react"' has no exported member 'Instagram'`, that's why. Inline brand SVGs (see `components/Footer.tsx`).
- **Framer Motion v12** doesn't like `Stagger.Item` compound components in SSR. Use `StaggerItem` as a standalone named export.
- **Tailwind v4 + custom CSS variables** — the `border-paper/15` opacity-modifier syntax works, but requires that the variable resolve to a hex/rgb that `color-mix` can process. Stick to hex values in `@theme`.
- **Next.js 16 + Turbopack** detects multiple lockfiles. If you see the "inferred workspace root" warning, it's because there's a stray `package-lock.json` in your home dir. Set `turbopack.root` in `next.config.ts` to silence. (Portal already does this; root site can too if it becomes noisy.)
- **Optical font settings** must be set with `style={{ fontVariationSettings: ... }}` inline; Tailwind has no first-class API yet. Pattern is documented in §5.
- **The portal isn't part of the website's `tsconfig`** — `tsconfig.json` excludes `apps/` so the root `tsc --noEmit` doesn't try to typecheck the portal without its installed deps. Run portal typecheck from `apps/portal/`.

## 11 · Quick reference — common commands

```bash
# Website (root)
npm run dev          # dev server :3000
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit     # typecheck

# Portal (apps/portal/)
npm run dev          # dev server :3001
npm run build        # production build
npm run db:push      # push schema (dev iteration)
npm run db:migrate   # create + apply migration
npm run db:seed      # seed admin + classrooms
npm run db:studio    # browse data in Prisma Studio

# Local infra (root)
docker compose up -d         # start Postgres + Adminer
docker compose down          # stop
docker compose down -v       # stop + wipe DB data
```

## 12 · Contact / ownership

- **Domain:** falconseducationsystem.com (production), portal.falconseducationsystem.com (Phase 2)
- **Repo owner:** Malik Abdul Rehman Khursheed
- **School phone:** +92 311 9911288 (WhatsApp + call) · 051-6129955 (PTCL)
- **School address:** Street No 14, Sonari Bank, Kamalabad Road, near Bakra Mandi, Rawalpindi, Punjab 46000

---

If something in here is wrong, update it. The point of this doc is to stay current — it's an asset, not a snapshot.
