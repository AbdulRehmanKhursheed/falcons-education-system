/**
 * Student list queries — return the same shape as the previous mock-data
 * `Student` type so the table component swaps in cleanly.
 *
 * NOTE: `attendance30d` is currently a fixed estimate based on the student's
 * recent attendance records. We do a single grouped query rather than 30
 * per-student queries.
 */

import { db } from '@/lib/db';

export type StudentRow = {
  id: string;
  rollNo: string;
  name: string;
  classroom: string;
  guardian: string;
  guardianPhone: string;
  attendance30d: number; // %
  duesPKR: number;
  status: 'active' | 'on-leave' | 'inactive';
};

const statusMap: Record<string, StudentRow['status']> = {
  ACTIVE: 'active',
  ON_LEAVE: 'on-leave',
  INACTIVE: 'inactive',
  GRADUATED: 'inactive',
};

type StudentQuery = {
  query?: string;
  classroom?: string; // classroom name or 'All'
  take?: number;
  skip?: number;
};

export async function getStudents(opts: StudentQuery = {}): Promise<{
  rows: StudentRow[];
  total: number;
  classrooms: string[];
}> {
  const { query = '', classroom = 'All', take = 50, skip = 0 } = opts;
  const q = query.trim();

  const where: Parameters<typeof db.student.findMany>[0] extends { where?: infer W }
    ? W
    : Record<string, unknown> = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { rollNo: { contains: q, mode: 'insensitive' } },
            {
              guardians: {
                some: {
                  guardian: { fullName: { contains: q, mode: 'insensitive' } },
                },
              },
            },
          ],
        }
      : {}),
    ...(classroom && classroom !== 'All'
      ? {
          enrollments: {
            some: {
              classroom: {
                name: classroom,
                academicYear: { isCurrent: true },
              },
              withdrawnAt: null,
            },
          },
        }
      : {}),
  };

  const [students, total, allClassrooms] = await Promise.all([
    db.student.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      take,
      skip,
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        rollNo: true,
        fullName: true,
        status: true,
        enrollments: {
          where: { withdrawnAt: null },
          take: 1,
          select: { classroom: { select: { name: true } } },
        },
        guardians: {
          where: { isPrimary: true },
          take: 1,
          select: {
            guardian: { select: { fullName: true, phone: true } },
          },
        },
        invoices: {
          where: { status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
          select: { total: true, amountPaid: true },
        },
        attendance: {
          where: {
            date: {
              gte: (() => {
                const d = new Date();
                d.setDate(d.getDate() - 30);
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
            },
          },
          select: { status: true },
        },
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.student.count({ where: where as any }),
    db.classroom.findMany({
      where: { academicYear: { isCurrent: true } },
      select: { name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const rows: StudentRow[] = students.map((s) => {
    const primary = s.guardians[0]?.guardian;
    const classroomName = s.enrollments[0]?.classroom.name ?? '—';
    const duesPKR = s.invoices.reduce(
      (sum, i) => sum + (Number(i.total) - Number(i.amountPaid)),
      0,
    );
    const total = s.attendance.length;
    const present = s.attendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE',
    ).length;
    const attendance30d = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      id: s.id,
      rollNo: s.rollNo,
      name: s.fullName,
      classroom: classroomName,
      guardian: primary?.fullName ?? '—',
      guardianPhone: primary?.phone ?? '—',
      attendance30d,
      duesPKR,
      status: statusMap[s.status] ?? 'active',
    };
  });

  return {
    rows,
    total,
    classrooms: ['All', ...allClassrooms.map((c) => c.name)],
  };
}
