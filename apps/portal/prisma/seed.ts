/**
 * Prisma seed — creates a Super Admin and a current academic year + a few
 * classrooms so the portal has a sensible starting state.
 *
 * Run with: `npm run db:seed` (after `npm run db:push` or `db:migrate`).
 */

import { PrismaClient, Role, ProgramKind } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@falconseducationsystem.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'change-me-on-first-login';

  // ── Super Admin ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'School Admin',
      role: Role.SUPER_ADMIN,
      passwordHash,
      active: true,
    },
  });
  console.log(`✓ Admin user · ${admin.email}`);

  // ── Current academic year ─────────────────────────────────────────────
  const ay = await prisma.academicYear.upsert({
    where: { name: '2026-27' },
    update: { isCurrent: true },
    create: {
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate:   new Date('2027-03-31'),
      isCurrent: true,
    },
  });
  console.log(`✓ Academic year · ${ay.name}`);

  // ── Classrooms — one per programme tier ───────────────────────────────
  const classrooms: Array<{ name: string; kind: ProgramKind }> = [
    { name: 'Nursery',      kind: ProgramKind.NURSERY },
    { name: 'Montessori A', kind: ProgramKind.MONTESSORI },
    { name: 'KG',           kind: ProgramKind.KINDERGARTEN },
    { name: 'Class 1',      kind: ProgramKind.PRIMARY },
    { name: 'Class 2',      kind: ProgramKind.PRIMARY },
    { name: 'Class 3',      kind: ProgramKind.PRIMARY },
    { name: 'Class 4',      kind: ProgramKind.PRIMARY },
    { name: 'Class 5',      kind: ProgramKind.PRIMARY },
    { name: 'Class 6',      kind: ProgramKind.PRIMARY },
  ];

  for (const c of classrooms) {
    await prisma.classroom.upsert({
      where: { academicYearId_name: { academicYearId: ay.id, name: c.name } },
      update: {},
      create: {
        academicYearId: ay.id,
        name: c.name,
        programKind: c.kind,
      },
    });
  }
  console.log(`✓ ${classrooms.length} classrooms seeded for ${ay.name}`);

  console.log('\nSeed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
