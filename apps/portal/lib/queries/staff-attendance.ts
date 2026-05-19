/**
 * Staff attendance queries — daily marking for TEACHER / SCHOOL_ADMIN /
 * ACCOUNTANT users. Mirrors the shape of lib/queries/attendance.ts so the UI
 * can reuse the same ergonomics.
 *
 * Date handling: matches the existing convention — dates are stored as midnight
 * UTC (the seed does `d.setHours(0, 0, 0, 0)`). YYYY-MM-DD strings parse into
 * that same canonical midnight.
 */

import { db } from '@/lib/db';
import type { AttendanceStatus, Role } from '@prisma/client';
import {
  parseISODate,
  todayMidnight,
  toISODate,
} from '@/lib/queries/attendance';

// Re-export so callers don't need to import from two places.
export { parseISODate, todayMidnight, toISODate };

// ── KPIs ─────────────────────────────────────────────────────────────────

export type StaffKpis = {
  date: string; // ISO YYYY-MM-DD
  totalStaff: number;
  present: number;
  late: number;
  absent: number;
  sick: number;
  excused: number;
  /** Attendance % across the past 7 calendar days (PRESENT + LATE / marked). */
  attendancePercent: number;
};

const STAFF_ROLES: Role[] = ['TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTANT'];

export async function getStaffKpis(date: Date): Promise<StaffKpis> {
  // 7-day window: [date - 6, date] inclusive at calendar-day granularity.
  const windowEnd = new Date(date);
  const windowStart = new Date(date);
  windowStart.setDate(windowStart.getDate() - 6);

  const [grouped, totalStaff, weekGrouped] = await Promise.all([
    db.staffAttendance.groupBy({
      by: ['status'],
      where: { date },
      _count: { _all: true },
    }),
    db.user.count({
      where: {
        deletedAt: null,
        active: true,
        role: { in: STAFF_ROLES },
      },
    }),
    db.staffAttendance.groupBy({
      by: ['status'],
      where: { date: { gte: windowStart, lte: windowEnd } },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    SICK: 0,
    EXCUSED: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;

  const weekCounts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    SICK: 0,
    EXCUSED: 0,
  };
  for (const g of weekGrouped) weekCounts[g.status] = g._count._all;

  const weekMarked =
    weekCounts.PRESENT +
    weekCounts.ABSENT +
    weekCounts.LATE +
    weekCounts.SICK +
    weekCounts.EXCUSED;
  const weekAttended = weekCounts.PRESENT + weekCounts.LATE;
  const attendancePercent =
    weekMarked > 0
      ? Math.round((weekAttended / weekMarked) * 1000) / 10
      : 0;

  return {
    date: toISODate(date),
    totalStaff,
    present: counts.PRESENT,
    late: counts.LATE,
    absent: counts.ABSENT,
    sick: counts.SICK,
    excused: counts.EXCUSED,
    attendancePercent,
  };
}

// ── Roster ───────────────────────────────────────────────────────────────

export type StaffRosterRow = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  currentStatus: AttendanceStatus | null;
  remark: string | null;
};

// Sort priority for the staff roster: admin first, then teachers, then accountants.
const rolePriority: Record<Role, number> = {
  SUPER_ADMIN: 0,
  SCHOOL_ADMIN: 1,
  TEACHER: 2,
  ACCOUNTANT: 3,
  PARENT: 9, // never present in roster, but keeps the type total
};

export async function getStaffRoster(date: Date): Promise<StaffRosterRow[]> {
  const users = await db.user.findMany({
    where: {
      deletedAt: null,
      active: true,
      role: { in: STAFF_ROLES },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      staffAttendance: {
        where: { date },
        take: 1,
        select: { status: true, remark: true },
      },
    },
  });

  return users
    .map((u) => {
      const att = u.staffAttendance[0] ?? null;
      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        currentStatus: att?.status ?? null,
        remark: att?.remark ?? null,
      };
    })
    .sort((a, b) => {
      const pa = rolePriority[a.role] ?? 99;
      const pb = rolePriority[b.role] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });
}
