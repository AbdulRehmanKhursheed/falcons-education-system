/**
 * Coaching center — server-side reads.
 *
 * All values returned to client components are plain serializable types
 * (no Prisma Decimal / Date instances). Monthly fee is returned as a number
 * (PKR) since amounts fit comfortably in JS number range for this domain.
 */

import { db } from '@/lib/db';
import type {
  CoachingLevel,
  CoachingWeekday,
  CoachingEnrollmentStatus,
} from '@prisma/client';

export type CoachingBatchRow = {
  id: string;
  name: string;
  subject: string;
  level: CoachingLevel;
  weekdays: CoachingWeekday[];
  startTime: string;
  endTime: string;
  teacherName: string | null;
  monthlyFee: number;
  capacity: number;
  enrolledActive: number;
  isActive: boolean;
};

type ListBatchesOpts = {
  search?: string;
  level?: CoachingLevel | 'ALL';
  subject?: string | 'ALL';
  /** undefined = both; true = active only; false = archived only. */
  active?: boolean;
};

export async function listBatches(
  opts: ListBatchesOpts = {},
): Promise<CoachingBatchRow[]> {
  const { search, level, subject, active } = opts;
  const trimmed = search?.trim();

  const batches = await db.coachingBatch.findMany({
    where: {
      AND: [
        active === undefined ? {} : { isActive: active },
        level && level !== 'ALL' ? { level } : {},
        subject && subject !== 'ALL' ? { subject } : {},
        trimmed
          ? {
              OR: [
                { name: { contains: trimmed, mode: 'insensitive' } },
                { subject: { contains: trimmed, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      subject: true,
      level: true,
      weekdays: true,
      startTime: true,
      endTime: true,
      monthlyFee: true,
      capacity: true,
      isActive: true,
      teacher: { select: { user: { select: { name: true } } } },
      _count: {
        select: { enrollments: { where: { status: 'ACTIVE' } } },
      },
    },
  });

  return batches.map((b) => ({
    id: b.id,
    name: b.name,
    subject: b.subject,
    level: b.level,
    weekdays: b.weekdays,
    startTime: b.startTime,
    endTime: b.endTime,
    teacherName: b.teacher?.user?.name ?? null,
    monthlyFee: Number(b.monthlyFee),
    capacity: b.capacity,
    enrolledActive: b._count.enrollments,
    isActive: b.isActive,
  }));
}

export async function listDistinctSubjects(): Promise<string[]> {
  const rows = await db.coachingBatch.findMany({
    distinct: ['subject'],
    orderBy: { subject: 'asc' },
    select: { subject: true },
  });
  return rows.map((r) => r.subject);
}

export type CoachingBatchDetail = {
  id: string;
  name: string;
  subject: string;
  level: CoachingLevel;
  weekdays: CoachingWeekday[];
  startTime: string;
  endTime: string;
  monthlyFee: number;
  capacity: number;
  isActive: boolean;
  notes: string | null;
  teacherId: string | null;
  teacherName: string | null;
  enrollments: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentRollNo: string;
    status: CoachingEnrollmentStatus;
    joinedOnIso: string;
    leftOnIso: string | null;
  }>;
  attendanceCount30d: number;
};

export async function getBatch(id: string): Promise<CoachingBatchDetail | null> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const batch = await db.coachingBatch.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      subject: true,
      level: true,
      weekdays: true,
      startTime: true,
      endTime: true,
      monthlyFee: true,
      capacity: true,
      isActive: true,
      notes: true,
      teacherId: true,
      teacher: { select: { user: { select: { name: true } } } },
      enrollments: {
        orderBy: [{ status: 'asc' }, { joinedOn: 'desc' }],
        select: {
          id: true,
          status: true,
          joinedOn: true,
          leftOn: true,
          student: {
            select: { id: true, fullName: true, rollNo: true },
          },
        },
      },
    },
  });

  if (!batch) return null;

  const attendanceCount30d = await db.coachingAttendance.count({
    where: { batchId: id, date: { gte: since } },
  });

  return {
    id: batch.id,
    name: batch.name,
    subject: batch.subject,
    level: batch.level,
    weekdays: batch.weekdays,
    startTime: batch.startTime,
    endTime: batch.endTime,
    monthlyFee: Number(batch.monthlyFee),
    capacity: batch.capacity,
    isActive: batch.isActive,
    notes: batch.notes,
    teacherId: batch.teacherId,
    teacherName: batch.teacher?.user?.name ?? null,
    enrollments: batch.enrollments.map((e) => ({
      id: e.id,
      studentId: e.student.id,
      studentName: e.student.fullName,
      studentRollNo: e.student.rollNo,
      status: e.status,
      joinedOnIso: e.joinedOn.toISOString(),
      leftOnIso: e.leftOn ? e.leftOn.toISOString() : null,
    })),
    attendanceCount30d,
  };
}

export type AvailableStudent = {
  id: string;
  fullName: string;
  rollNo: string;
  classroomName: string | null;
};

/**
 * Students NOT currently enrolled in the given batch (any status counts as
 * enrolled so we don't double-add — the unique constraint on
 * (batchId, studentId) would reject regardless).
 */
export async function listAvailableStudents(
  batchId: string,
): Promise<AvailableStudent[]> {
  const existing = await db.coachingEnrollment.findMany({
    where: { batchId },
    select: { studentId: true },
  });
  const taken = new Set(existing.map((e) => e.studentId));

  const students = await db.student.findMany({
    where: { status: 'ACTIVE', id: { notIn: Array.from(taken) } },
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      rollNo: true,
      enrollments: {
        where: { withdrawnAt: null },
        take: 1,
        orderBy: { enrolledAt: 'desc' },
        select: { classroom: { select: { name: true } } },
      },
    },
  });

  return students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    rollNo: s.rollNo,
    classroomName: s.enrollments[0]?.classroom?.name ?? null,
  }));
}

export type ActiveTeacherOption = {
  id: string;
  name: string;
};

/**
 * Active teachers for the batch form's "assign teacher" select.
 */
export async function listActiveTeachers(): Promise<ActiveTeacherOption[]> {
  const teachers = await db.teacher.findMany({
    where: { isActive: true, user: { deletedAt: null, active: true } },
    orderBy: { user: { name: 'asc' } },
    select: { id: true, user: { select: { name: true } } },
  });
  return teachers.map((t) => ({ id: t.id, name: t.user.name }));
}
