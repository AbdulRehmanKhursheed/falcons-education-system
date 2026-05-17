'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { academicYearSchema, type AcademicYearInput } from '@/lib/schemas/settings';

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

// ── Academic year mutations ────────────────────────────────────────────────

export async function createAcademicYear(input: AcademicYearInput): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = academicYearSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }

  const existing = await db.academicYear.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return {
      ok: false,
      error: `Academic year "${parsed.data.name}" already exists`,
      field: 'name',
    };
  }

  const created = await db.academicYear.create({
    data: {
      name: parsed.data.name,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      isCurrent: false,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'academic_year.create',
      entityType: 'AcademicYear',
      entityId: created.id,
      diff: {
        name: created.name,
        startDate: created.startDate.toISOString(),
        endDate: created.endDate.toISOString(),
      },
    },
  });

  revalidatePath('/settings/academic-years');
  revalidatePath('/settings');
  return { ok: true };
}

export async function setCurrentAcademicYear(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const target = await db.academicYear.findUnique({ where: { id } });
  if (!target) return { ok: false, error: 'Academic year not found' };

  await db.$transaction([
    db.academicYear.updateMany({
      where: { isCurrent: true, id: { not: id } },
      data: { isCurrent: false },
    }),
    db.academicYear.update({ where: { id }, data: { isCurrent: true } }),
  ]);

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'academic_year.set_current',
      entityType: 'AcademicYear',
      entityId: id,
      diff: { name: target.name },
    },
  });

  revalidatePath('/settings/academic-years');
  revalidatePath('/settings');
  return { ok: true };
}

export async function deleteAcademicYear(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const target = await db.academicYear.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isCurrent: true,
      _count: { select: { classrooms: true } },
    },
  });
  if (!target) return { ok: false, error: 'Academic year not found' };

  if (target.isCurrent) {
    return {
      ok: false,
      error: 'Cannot delete the current academic year. Set another year as current first.',
    };
  }

  if (target._count.classrooms > 0) {
    return {
      ok: false,
      error: `Cannot delete — ${target._count.classrooms} classroom(s) are linked to this year`,
    };
  }

  await db.academicYear.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'academic_year.delete',
      entityType: 'AcademicYear',
      entityId: id,
      diff: { name: target.name },
    },
  });

  revalidatePath('/settings/academic-years');
  revalidatePath('/settings');
  return { ok: true };
}
