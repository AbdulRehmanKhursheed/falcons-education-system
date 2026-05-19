/**
 * Attendance queries — all return plain serializable shapes (no Prisma Decimal,
 * no Date — only strings/numbers) so components can be either Server or Client.
 *
 * Date handling: dates are stored as midnight UTC (the seed does
 * `d.setHours(0, 0, 0, 0)`). When clients send YYYY-MM-DD strings, we parse to
 * that same canonical midnight using `parseISODate` below.
 */

import { db } from '@/lib/db';
import type { AttendanceStatus } from '@prisma/client';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Parse YYYY-MM-DD into the canonical midnight Date used everywhere. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

/** Today at midnight, matching seed convention. */
export function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format Date → YYYY-MM-DD. */
export function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ── KPIs ─────────────────────────────────────────────────────────────────

export type AttendanceKpis = {
  date: string; // ISO YYYY-MM-DD
  totalEnrolled: number;
  totalMarked: number;
  present: number;
  absent: number;
  late: number;
  sick: number;
  excused: number;
  attendancePercent: number; // 0–100, 1 decimal
};

export async function getTodayKpis(): Promise<AttendanceKpis> {
  return getKpisForDate(todayMidnight());
}

export async function getKpisForDate(date: Date): Promise<AttendanceKpis> {
  const [grouped, totalEnrolled] = await Promise.all([
    db.attendance.groupBy({
      by: ['status'],
      where: { date },
      _count: { _all: true },
    }),
    db.enrollment.count({
      where: {
        withdrawnAt: null,
        classroom: { academicYear: { isCurrent: true } },
      },
    }),
  ]);

  const counts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    SICK: 0,
    EXCUSED: 0,
  };
  for (const g of grouped) {
    counts[g.status] = g._count._all;
  }

  const totalMarked =
    counts.PRESENT + counts.ABSENT + counts.LATE + counts.SICK + counts.EXCUSED;

  // Treat PRESENT + LATE as "attended" for the headline percentage; this
  // matches the convention used in lib/queries/students.ts.
  const attended = counts.PRESENT + counts.LATE;
  const attendancePercent =
    totalMarked > 0 ? Math.round((attended / totalMarked) * 1000) / 10 : 0;

  return {
    date: toISODate(date),
    totalEnrolled,
    totalMarked,
    present: counts.PRESENT,
    absent: counts.ABSENT,
    late: counts.LATE,
    sick: counts.SICK,
    excused: counts.EXCUSED,
    attendancePercent,
  };
}

// ── Classroom selector ───────────────────────────────────────────────────

export type ClassroomOption = {
  id: string;
  name: string;
  programKind: string;
  enrolledCount: number;
};

/**
 * Returns classrooms in the order used by the seed (Nursery → Class 6) by
 * ordering programKind then name.
 */
export async function getClassroomsForSelector(): Promise<ClassroomOption[]> {
  // Pull the current academic year so we don't list stale rooms.
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const rows = await db.classroom.findMany({
    where: currentYear ? { academicYearId: currentYear.id } : {},
    select: {
      id: true,
      name: true,
      programKind: true,
      _count: { select: { enrollments: { where: { withdrawnAt: null } } } },
    },
  });

  // Stable display order matching the seed: NURSERY, MONTESSORI, KINDERGARTEN,
  // then PRIMARY by classroom name (Class 1, Class 2, ...).
  const programOrder: Record<string, number> = {
    NURSERY: 0,
    MONTESSORI: 1,
    KINDERGARTEN: 2,
    PRIMARY: 3,
    EVENING_COACHING: 4,
    SATURDAY_COACHING: 5,
    COMPUTER_COURSE: 6,
  };

  return rows
    .map((c) => ({
      id: c.id,
      name: c.name,
      programKind: c.programKind,
      enrolledCount: c._count.enrollments,
    }))
    .sort((a, b) => {
      const pa = programOrder[a.programKind] ?? 99;
      const pb = programOrder[b.programKind] ?? 99;
      if (pa !== pb) return pa - pb;
      // Natural sort: "Class 2" before "Class 10"
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
}

// ── Roster ───────────────────────────────────────────────────────────────

export type RosterRow = {
  studentId: string;
  rollNo: string;
  name: string;
  status: 'active' | 'on-leave' | 'inactive' | 'graduated';
  guardianName: string | null;
  guardianPhone: string | null;
  guardianWhatsapp: string | null;
  currentStatus: AttendanceStatus | null;
  remark: string | null;
};

const studentStatusMap: Record<string, RosterRow['status']> = {
  ACTIVE: 'active',
  ON_LEAVE: 'on-leave',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
};

export async function getRoster(
  classroomId: string,
  date: Date,
): Promise<RosterRow[]> {
  const enrollments = await db.enrollment.findMany({
    where: { classroomId, withdrawnAt: null },
    select: {
      student: {
        select: {
          id: true,
          rollNo: true,
          fullName: true,
          status: true,
          deletedAt: true,
          guardians: {
            where: { isPrimary: true },
            take: 1,
            select: {
              guardian: {
                select: { fullName: true, phone: true, whatsapp: true },
              },
            },
          },
          attendance: {
            where: { date },
            take: 1,
            select: { status: true, remark: true },
          },
        },
      },
    },
  });

  return enrollments
    .filter((e) => e.student.deletedAt === null)
    .map((e) => {
      const s = e.student;
      const guardian = s.guardians[0]?.guardian ?? null;
      const att = s.attendance[0] ?? null;
      return {
        studentId: s.id,
        rollNo: s.rollNo,
        name: s.fullName,
        status: studentStatusMap[s.status] ?? 'active',
        guardianName: guardian?.fullName ?? null,
        guardianPhone: guardian?.phone ?? null,
        guardianWhatsapp: guardian?.whatsapp ?? null,
        currentStatus: att?.status ?? null,
        remark: att?.remark ?? null,
      };
    })
    .sort((a, b) =>
      a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }),
    );
}

// ── Per-classroom daily summary ─────────────────────────────────────────

export type ClassroomDailySummary = {
  classroomId: string;
  date: string;
  totalEnrolled: number;
  marked: number;
  present: number;
  absent: number;
  late: number;
  sick: number;
  excused: number;
  unmarked: number;
  attendancePercent: number;
};

export async function getClassroomDailySummary(
  classroomId: string,
  date: Date,
): Promise<ClassroomDailySummary> {
  const [grouped, totalEnrolled] = await Promise.all([
    db.attendance.groupBy({
      by: ['status'],
      where: { classroomId, date },
      _count: { _all: true },
    }),
    db.enrollment.count({ where: { classroomId, withdrawnAt: null } }),
  ]);

  const counts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    SICK: 0,
    EXCUSED: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;

  const marked =
    counts.PRESENT + counts.ABSENT + counts.LATE + counts.SICK + counts.EXCUSED;
  const attended = counts.PRESENT + counts.LATE;
  const attendancePercent =
    marked > 0 ? Math.round((attended / marked) * 1000) / 10 : 0;

  return {
    classroomId,
    date: toISODate(date),
    totalEnrolled,
    marked,
    present: counts.PRESENT,
    absent: counts.ABSENT,
    late: counts.LATE,
    sick: counts.SICK,
    excused: counts.EXCUSED,
    unmarked: Math.max(0, totalEnrolled - marked),
    attendancePercent,
  };
}
