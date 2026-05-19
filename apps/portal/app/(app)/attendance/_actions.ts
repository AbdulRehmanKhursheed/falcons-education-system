'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  markAttendanceSchema,
  markAllPresentSchema,
  bulkUpdateSchema,
  type MarkAttendanceInput,
  type MarkAllPresentInput,
  type BulkUpdateInput,
} from '@/lib/schemas/attendance';
import {
  parseISODate,
  todayMidnight,
  getRoster,
  getClassroomDailySummary,
  type RosterRow,
  type ClassroomDailySummary,
} from '@/lib/queries/attendance';
import { notifyUsers, getParentUserIdsForStudent } from '@/lib/notify';

function assertNotFuture(date: Date) {
  if (date.getTime() > todayMidnight().getTime()) {
    throw new Error('Cannot mark attendance for a future date.');
  }
}

/**
 * Mark a single student. Upserts by the (studentId, date) unique key.
 */
export async function markAttendance(input: MarkAttendanceInput): Promise<{
  ok: true;
  summary: ClassroomDailySummary;
}> {
  const session = await requireRole([
    'TEACHER',
    'SCHOOL_ADMIN',
    'SUPER_ADMIN',
  ]);

  const parsed = markAttendanceSchema.parse(input);
  const date = parseISODate(parsed.date);
  assertNotFuture(date);

  // Confirm the student is actually enrolled in the given classroom so a
  // crafted client request can't insert mismatched rows.
  const enrolled = await db.enrollment.findFirst({
    where: {
      studentId: parsed.studentId,
      classroomId: parsed.classroomId,
      withdrawnAt: null,
    },
    select: { id: true },
  });
  if (!enrolled) {
    throw new Error('Student is not enrolled in this classroom.');
  }

  await db.attendance.upsert({
    where: { studentId_date: { studentId: parsed.studentId, date } },
    update: {
      status: parsed.status,
      classroomId: parsed.classroomId,
      markedById: session.user.id,
    },
    create: {
      studentId: parsed.studentId,
      classroomId: parsed.classroomId,
      date,
      status: parsed.status,
      markedById: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'attendance.mark',
      entityType: 'Attendance',
      entityId: parsed.studentId,
      diff: { date: parsed.date, status: parsed.status, classroomId: parsed.classroomId },
    },
  });

  // Notify parents on ABSENT — best effort, never blocks the mark-attendance
  // action. We re-fetch the student name once because the roster query is
  // overkill for a single row.
  if (parsed.status === 'ABSENT') {
    try {
      const [parentUserIds, student] = await Promise.all([
        getParentUserIdsForStudent(parsed.studentId),
        db.student.findUnique({
          where: { id: parsed.studentId },
          select: { fullName: true },
        }),
      ]);
      if (parentUserIds.length > 0 && student) {
        const dateLabel = new Date(parsed.date).toLocaleDateString('en-PK', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        await notifyUsers(parentUserIds, {
          kind: 'ATTENDANCE',
          title: `${student.fullName} marked absent on ${dateLabel}`,
          body: 'Please contact the school if this is incorrect.',
          link: `/parent/kids/${parsed.studentId}/attendance`,
        });
      }
    } catch (err) {
      console.warn('[attendance] absent notification failed', err);
    }
  }

  revalidatePath('/attendance');
  revalidatePath('/dashboard');

  const summary = await getClassroomDailySummary(parsed.classroomId, date);
  return { ok: true, summary };
}

/**
 * Bulk-mark every unmarked enrolled student in a classroom as PRESENT for the
 * given date. Existing rows are left untouched.
 */
export async function markAllPresent(input: MarkAllPresentInput): Promise<{
  ok: true;
  marked: number;
  roster: RosterRow[];
  summary: ClassroomDailySummary;
}> {
  const session = await requireRole([
    'TEACHER',
    'SCHOOL_ADMIN',
    'SUPER_ADMIN',
  ]);

  const parsed = markAllPresentSchema.parse(input);
  const date = parseISODate(parsed.date);
  assertNotFuture(date);

  // Find all enrolled students who do NOT yet have an attendance row for the date.
  const enrollments = await db.enrollment.findMany({
    where: { classroomId: parsed.classroomId, withdrawnAt: null },
    select: { studentId: true },
  });
  const studentIds = enrollments.map((e) => e.studentId);

  if (studentIds.length === 0) {
    const roster = await getRoster(parsed.classroomId, date);
    const summary = await getClassroomDailySummary(parsed.classroomId, date);
    return { ok: true, marked: 0, roster, summary };
  }

  const existing = await db.attendance.findMany({
    where: { date, studentId: { in: studentIds } },
    select: { studentId: true },
  });
  const alreadyMarked = new Set(existing.map((e) => e.studentId));
  const toCreate = studentIds.filter((id) => !alreadyMarked.has(id));

  if (toCreate.length > 0) {
    await db.$transaction([
      db.attendance.createMany({
        data: toCreate.map((studentId) => ({
          studentId,
          classroomId: parsed.classroomId,
          date,
          status: 'PRESENT' as const,
          markedById: session.user.id,
        })),
        skipDuplicates: true,
      }),
      db.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'attendance.mark_all_present',
          entityType: 'Classroom',
          entityId: parsed.classroomId,
          diff: { date: parsed.date, count: toCreate.length },
        },
      }),
    ]);
  }

  revalidatePath('/attendance');
  revalidatePath('/dashboard');

  const [roster, summary] = await Promise.all([
    getRoster(parsed.classroomId, date),
    getClassroomDailySummary(parsed.classroomId, date),
  ]);
  return { ok: true, marked: toCreate.length, roster, summary };
}

/**
 * Multi-edit: write a list of (studentId, status) pairs for one classroom + date.
 * Used for power-user "fix a row of mistakes at once" scenarios.
 */
export async function bulkUpdate(input: BulkUpdateInput): Promise<{
  ok: true;
  updated: number;
  roster: RosterRow[];
  summary: ClassroomDailySummary;
}> {
  const session = await requireRole([
    'TEACHER',
    'SCHOOL_ADMIN',
    'SUPER_ADMIN',
  ]);

  const parsed = bulkUpdateSchema.parse(input);
  const date = parseISODate(parsed.date);
  assertNotFuture(date);

  // Pre-validate that every studentId is in this classroom (one round-trip).
  const enrolled = await db.enrollment.findMany({
    where: {
      classroomId: parsed.classroomId,
      withdrawnAt: null,
      studentId: { in: parsed.rows.map((r) => r.studentId) },
    },
    select: { studentId: true },
  });
  const enrolledSet = new Set(enrolled.map((e) => e.studentId));
  const valid = parsed.rows.filter((r) => enrolledSet.has(r.studentId));

  await db.$transaction(async (tx) => {
    for (const r of valid) {
      await tx.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        update: {
          status: r.status,
          classroomId: parsed.classroomId,
          markedById: session.user.id,
        },
        create: {
          studentId: r.studentId,
          classroomId: parsed.classroomId,
          date,
          status: r.status,
          markedById: session.user.id,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'attendance.bulk_update',
        entityType: 'Classroom',
        entityId: parsed.classroomId,
        diff: { date: parsed.date, count: valid.length },
      },
    });
  });

  revalidatePath('/attendance');
  revalidatePath('/dashboard');

  const [roster, summary] = await Promise.all([
    getRoster(parsed.classroomId, date),
    getClassroomDailySummary(parsed.classroomId, date),
  ]);
  return { ok: true, updated: valid.length, roster, summary };
}

/**
 * Convenience read used by the client when the classroom or date changes
 * — returns a fresh roster + summary without a full page reload.
 */
export async function loadClassroomDay(
  classroomId: string,
  date: string,
): Promise<{ roster: RosterRow[]; summary: ClassroomDailySummary }> {
  await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'ACCOUNTANT',
  ]);
  const d = parseISODate(date);
  const [roster, summary] = await Promise.all([
    getRoster(classroomId, d),
    getClassroomDailySummary(classroomId, d),
  ]);
  return { roster, summary };
}
