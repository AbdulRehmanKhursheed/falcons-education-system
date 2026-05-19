'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  markStaffAttendanceSchema,
  markAllStaffPresentSchema,
  type MarkStaffAttendanceInput,
  type MarkAllStaffPresentInput,
} from '@/lib/schemas/staff-attendance';
import {
  parseISODate,
  todayMidnight,
  getStaffKpis,
  getStaffRoster,
  type StaffKpis,
  type StaffRosterRow,
} from '@/lib/queries/staff-attendance';

function assertNotFuture(date: Date) {
  if (date.getTime() > todayMidnight().getTime()) {
    throw new Error('Cannot mark staff attendance for a future date.');
  }
}

/**
 * Mark a single staff member. Upserts by the (userId, date) unique key.
 * Optionally accepts a remark — passing an empty string clears it.
 */
export async function markStaffAttendance(input: MarkStaffAttendanceInput): Promise<{
  ok: true;
  kpis: StaffKpis;
}> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = markStaffAttendanceSchema.parse(input);
  const date = parseISODate(parsed.date);
  assertNotFuture(date);

  // Confirm the subject is actually a staff user — guards against a crafted
  // client request marking attendance for a PARENT or a deleted account.
  const target = await db.user.findFirst({
    where: {
      id: parsed.userId,
      deletedAt: null,
      active: true,
      role: { in: ['TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTANT'] },
    },
    select: { id: true },
  });
  if (!target) {
    throw new Error('Staff member not found or inactive.');
  }

  const remark =
    parsed.remark === undefined || parsed.remark === null
      ? null
      : parsed.remark.trim().length === 0
        ? null
        : parsed.remark.trim();

  await db.staffAttendance.upsert({
    where: { userId_date: { userId: parsed.userId, date } },
    update: {
      status: parsed.status,
      remark,
      markedById: session.user.id,
    },
    create: {
      userId: parsed.userId,
      date,
      status: parsed.status,
      remark,
      markedById: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'staff_attendance.mark',
      entityType: 'StaffAttendance',
      entityId: parsed.userId,
      diff: { date: parsed.date, status: parsed.status, remark },
    },
  });

  revalidatePath('/staff-attendance');

  const kpis = await getStaffKpis(date);
  return { ok: true, kpis };
}

/**
 * Bulk-mark every active staff user as PRESENT for the given date. Existing
 * rows are left untouched (won't overwrite a teacher you've already marked
 * SICK, for example).
 */
export async function markAllStaffPresent(input: MarkAllStaffPresentInput): Promise<{
  ok: true;
  marked: number;
  roster: StaffRosterRow[];
  kpis: StaffKpis;
}> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = markAllStaffPresentSchema.parse(input);
  const date = parseISODate(parsed.date);
  assertNotFuture(date);

  const staff = await db.user.findMany({
    where: {
      deletedAt: null,
      active: true,
      role: { in: ['TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTANT'] },
    },
    select: { id: true },
  });
  const staffIds = staff.map((s) => s.id);

  if (staffIds.length === 0) {
    const [roster, kpis] = await Promise.all([
      getStaffRoster(date),
      getStaffKpis(date),
    ]);
    return { ok: true, marked: 0, roster, kpis };
  }

  const existing = await db.staffAttendance.findMany({
    where: { date, userId: { in: staffIds } },
    select: { userId: true },
  });
  const alreadyMarked = new Set(existing.map((e) => e.userId));
  const toCreate = staffIds.filter((id) => !alreadyMarked.has(id));

  if (toCreate.length > 0) {
    await db.$transaction([
      db.staffAttendance.createMany({
        data: toCreate.map((userId) => ({
          userId,
          date,
          status: 'PRESENT' as const,
          markedById: session.user.id,
        })),
        skipDuplicates: true,
      }),
      db.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'staff_attendance.mark_all_present',
          entityType: 'StaffAttendance',
          entityId: 'bulk',
          diff: { date: parsed.date, count: toCreate.length },
        },
      }),
    ]);
  }

  revalidatePath('/staff-attendance');

  const [roster, kpis] = await Promise.all([
    getStaffRoster(date),
    getStaffKpis(date),
  ]);
  return { ok: true, marked: toCreate.length, roster, kpis };
}

/**
 * Convenience read used by the client when the date changes — returns a fresh
 * roster + KPIs without a full page reload.
 */
export async function loadStaffRoster(
  date: string,
): Promise<{ roster: StaffRosterRow[]; kpis: StaffKpis }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const d = parseISODate(date);
  const [roster, kpis] = await Promise.all([
    getStaffRoster(d),
    getStaffKpis(d),
  ]);
  return { roster, kpis };
}
