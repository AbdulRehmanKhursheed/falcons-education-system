#!/usr/bin/env bash
# Falcons Education portal — local dev bootstrap.
#
# Single-command setup for a fresh checkout:
#   git clone ... && cd falcons-education-system && ./bootstrap.sh
#
# What it does (idempotent — safe to re-run):
#   1. Verifies Docker is running
#   2. Starts Postgres (and Adminer) via docker compose
#   3. Copies apps/portal/.env.example → apps/portal/.env if missing,
#      generating AUTH_SECRET via openssl
#   4. Installs npm dependencies if node_modules is missing
#   5. Runs `prisma migrate deploy` to apply schema migrations
#   6. Generates the Prisma client
#   7. Seeds demo data (5 demo users, 30 students, 6 months of fees, etc.)
#   8. Starts `next dev` on port 3001
#
# Stop everything: Ctrl-C the dev server, then `docker compose down`.
# Wipe the database to re-seed clean: `docker compose down -v`.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTAL_DIR="$ROOT_DIR/apps/portal"

cd "$ROOT_DIR"

# ── Helpers ─────────────────────────────────────────────────────────────────

cyan()   { printf '\033[36m%s\033[0m\n' "$1"; }
green()  { printf '\033[32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[33m%s\033[0m\n' "$1"; }
red()    { printf '\033[31m%s\033[0m\n' "$1" >&2; }
header() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }

# ── 1. Verify Docker ────────────────────────────────────────────────────────

header "Checking Docker"
if ! command -v docker >/dev/null 2>&1; then
  red "Docker is not installed. Install Docker Desktop and re-run."
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  red "Docker daemon is not running. Start Docker Desktop and re-run."
  exit 1
fi
green "  Docker is running."

# ── 2. Start Postgres + Adminer ─────────────────────────────────────────────

header "Starting Postgres"
docker compose up -d postgres adminer

cyan "  Waiting for Postgres healthcheck..."
for i in $(seq 1 60); do
  if docker compose exec -T postgres pg_isready -U falcons -d falcons_portal >/dev/null 2>&1; then
    green "  Postgres is healthy."
    break
  fi
  if [ "$i" -eq 60 ]; then
    red "  Postgres did not become healthy within 60s. Check 'docker compose logs postgres'."
    exit 1
  fi
  sleep 1
done

# ── 3. .env setup ───────────────────────────────────────────────────────────

header "Configuring apps/portal/.env"
if [ ! -f "$PORTAL_DIR/.env" ]; then
  cp "$PORTAL_DIR/.env.example" "$PORTAL_DIR/.env"
  if command -v openssl >/dev/null 2>&1; then
    SECRET=$(openssl rand -base64 32)
    if [ "$(uname)" = "Darwin" ]; then
      sed -i '' "s|generate-with-openssl-rand-base64-32|$SECRET|" "$PORTAL_DIR/.env"
    else
      sed -i "s|generate-with-openssl-rand-base64-32|$SECRET|" "$PORTAL_DIR/.env"
    fi
    green "  Generated AUTH_SECRET (openssl)."
  else
    yellow "  openssl not found — set AUTH_SECRET in apps/portal/.env manually before login works."
  fi
  green "  .env created from .env.example."
else
  green "  .env already present (not overwriting)."
fi

# ── 4. npm install ──────────────────────────────────────────────────────────

cd "$PORTAL_DIR"

header "Installing npm dependencies"
if [ ! -d node_modules ]; then
  npm install
  green "  Dependencies installed."
else
  green "  node_modules present (skipping install — run 'npm install' manually if package.json changed)."
fi

# ── 5. Migrate ──────────────────────────────────────────────────────────────

header "Applying database migrations"
npx prisma migrate deploy
green "  Migrations applied."

# ── 6. Generate Prisma client ───────────────────────────────────────────────

header "Generating Prisma client"
npx prisma generate >/dev/null
green "  Prisma client up to date."

# ── 7. Seed ─────────────────────────────────────────────────────────────────

header "Seeding demo data"
npm run db:seed
green "  Demo data seeded."

# ── 8. Ready ────────────────────────────────────────────────────────────────

header "Ready"
cat <<EOF
  Portal:        http://localhost:3001
  Adminer (DB):  http://localhost:8081  (server: postgres · user: falcons · pass: falcons · db: falcons_portal)
  Health check:  http://localhost:3001/api/health

  Demo logins (dev defaults — change before production):
    admin@falconseducationsystem.com      / Falcons@Admin1     (SUPER_ADMIN)
    principal@falconseducationsystem.com  / Falcons@Principal1 (SCHOOL_ADMIN)
    teacher@falconseducationsystem.com    / Falcons@Teacher1   (TEACHER)
    accounts@falconseducationsystem.com   / Falcons@Accounts1  (ACCOUNTANT)
    parent@falconseducationsystem.com     / Falcons@Parent1    (PARENT)

  Press Ctrl-C to stop the dev server. Postgres keeps running in the background.
  Stop Postgres:        docker compose down
  Wipe DB and re-seed:  docker compose down -v && ./bootstrap.sh

EOF

header "Starting Next.js dev server (port 3001)"
exec npm run dev
