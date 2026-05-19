'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { upsertEntrySchema, type UpsertEntryInput } from '@/lib/schemas/timetable';
import {
  getTimetableGrid,
  type TimetableGrid,
} from '@/lib/queries/timetable';

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

/**
 * Upsert one timetable cell, keyed by the (classroomId, dayOfWeek, periodId)
 * @@unique. Subject + teacher are optional — an empty cell with notes is
 * still valid (e.g. "Assembly" or "Free play").
 */
export async function upsertEntry(
  input: UpsertEntryInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = upsertEntrySchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }
  const data = parsed.data;

  // Validate referenced rows so we get a friendly error rather than a
  // Prisma foreign-key crash.
  const [classroom, period, subject, teacher] = await Promise.all([
    db.classroom.findUnique({ where: { id: data.classroomId }, select: { id: true } }),
    db.period.findUnique({ where: { id: data.periodId }, select: { id: true } }),
    data.subjectId
      ? db.subject.findUnique({ where: { id: data.subjectId }, select: { id: true, active: true } })
      : Promise.resolve(null),
    data.teacherId
      ? db.teacher.findUnique({ where: { id: data.teacherId }, select: { id: true, isActive: true } })
      : Promise.resolve(null),
  ]);

  if (!classroom) return { ok: false, error: 'Classroom not found' };
  if (!period) return { ok: false, error: 'Period not found' };
  if (data.subjectId && !subject) return { ok: false, error: 'Subject not found' };
  if (data.teacherId && !teacher) return { ok: false, error: 'Teacher not found' };

  const previous = await db.timetableEntry.findUnique({
    where: {
      classroomId_dayOfWeek_periodId: {
        classroomId: data.classroomId,
        dayOfWeek: data.dayOfWeek,
        periodId: data.periodId,
      },
    },
    select: { id: true, subjectId: true, teacherId: true, notes: true },
  });

  const saved = await db.timetableEntry.upsert({
    where: {
      classroomId_dayOfWeek_periodId: {
        classroomId: data.classroomId,
        dayOfWeek: data.dayOfWeek,
        periodId: data.periodId,
      },
    },
    create: {
      classroomId: data.classroomId,
      dayOfWeek: data.dayOfWeek,
      periodId: data.periodId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      notes: data.notes,
    },
    update: {
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      notes: data.notes,
    },
    select: { id: true },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'timetable.upsert',
      entityType: 'TimetableEntry',
      entityId: saved.id,
      diff: {
        classroomId: data.classroomId,
        dayOfWeek: data.dayOfWeek,
        periodId: data.periodId,
        from: previous
          ? {
              subjectId: previous.subjectId,
              teacherId: previous.teacherId,
              notes: previous.notes,
            }
          : null,
        to: {
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          notes: data.notes,
        },
      },
    },
  });

  revalidatePath('/timetable');
  return { ok: true };
}

/** Remove a single cell. */
export async function deleteEntry(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.timetableEntry.findUnique({
    where: { id },
    select: {
      id: true,
      classroomId: true,
      dayOfWeek: true,
      periodId: true,
      subjectId: true,
      teacherId: true,
      notes: true,
    },
  });
  if (!existing) return { ok: false, error: 'Entry not found' };

  await db.timetableEntry.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'timetable.delete',
      entityType: 'TimetableEntry',
      entityId: id,
      diff: {
        classroomId: existing.classroomId,
        dayOfWeek: existing.dayOfWeek,
        periodId: existing.periodId,
        subjectId: existing.subjectId,
        teacherId: existing.teacherId,
        notes: existing.notes,
      },
    },
  });

  revalidatePath('/timetable');
  return { ok: true };
}

/**
 * Convenience refetch used by the client when the classroom changes — keeps
 * the round-trip in a single server action.
 */
export async function loadGrid(
  classroomId: string,
): Promise<TimetableGrid | null> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT']);
  return getTimetableGrid(classroomId);
}
