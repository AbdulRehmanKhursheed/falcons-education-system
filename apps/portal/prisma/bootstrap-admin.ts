/**
 * Production cold-start: create exactly one SUPER_ADMIN user.
 *
 * Run this ONCE after the first `prisma migrate deploy` against a fresh
 * production database. It is idempotent — if an active SUPER_ADMIN already
 * exists for the same email, it updates the password instead of erroring.
 *
 * Usage:
 *   BOOTSTRAP_ADMIN_EMAIL=you@school.com \
 *   BOOTSTRAP_ADMIN_PASSWORD='strongpw' \
 *   BOOTSTRAP_ADMIN_NAME='Principal Sahib' \
 *   npm run db:bootstrap
 *
 * Why a separate script from seed.ts:
 *   - seed.ts creates 30+ demo students, fake invoices, fake parents. That is
 *     destructive on a production DB.
 *   - This script touches a single row in the User table and writes a single
 *     AuditLog entry. Safe to run against a live DB.
 *
 * The Sign-in screen will show this admin after the script completes. First
 * thing they should do post-login: change their password from /settings/users.
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { checkPasswordPolicy } from '../lib/password';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[bootstrap-admin] Missing required env var ${name}.`);
    console.error('  Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, and');
    console.error('  BOOTSTRAP_ADMIN_NAME, then re-run npm run db:bootstrap.');
    process.exit(1);
  }
  return value.trim();
}

async function main(): Promise<void> {
  const email = required('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
  const password = required('BOOTSTRAP_ADMIN_PASSWORD');
  const name = required('BOOTSTRAP_ADMIN_NAME');

  const policy = checkPasswordPolicy(password);
  if (!policy.ok) {
    console.error('[bootstrap-admin] Password is too weak: ' + policy.message);
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    if (existing.role !== Role.SUPER_ADMIN) {
      console.error(
        `[bootstrap-admin] User ${email} already exists with role ${existing.role}. ` +
          'Refusing to silently promote them to SUPER_ADMIN. ' +
          'Either pick a different email or escalate the existing user manually.',
      );
      process.exit(1);
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { passwordHash, name, active: true, deletedAt: null },
      }),
      prisma.auditLog.create({
        data: {
          actorId: existing.id,
          action: 'user.bootstrap.update',
          entityType: 'User',
          entityId: existing.id,
          diff: { email, source: 'bootstrap-admin script' },
        },
      }),
    ]);
    console.log(`[bootstrap-admin] Updated existing SUPER_ADMIN ${email}.`);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: Role.SUPER_ADMIN,
        active: true,
      },
    });
    await prisma.auditLog.create({
      data: {
        actorId: created.id,
        action: 'user.bootstrap.create',
        entityType: 'User',
        entityId: created.id,
        diff: { email, source: 'bootstrap-admin script' },
      },
    });
    console.log(`[bootstrap-admin] Created SUPER_ADMIN ${email}.`);
  }

  console.log('[bootstrap-admin] Done. Sign in at /login, then change your password from /settings/users.');
}

main()
  .catch((err) => {
    console.error('[bootstrap-admin] Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
