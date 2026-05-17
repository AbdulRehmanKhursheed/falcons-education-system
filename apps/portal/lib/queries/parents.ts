/**
 * Parents (Guardians) queries — KPI strip, paged list with children rollups,
 * and full guardian detail (each child with attendance30d + dues).
 *
 * All results are plain serializable shapes; phone numbers stay raw — the
 * UI formats them and derives the wa.me link via `lib/whatsapp.ts`.
 */

import { db } from '@/lib/db';

export type ChildSummary = {
  id: string;
  name: string;
  rollNo: string;
  classroom: string;
  attendance30d: number; // %
  duesPKR: number;
  isPrimary: boolean;
};

export type GuardianRow = {
  id: string;
  fullName: string;
  relation: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  occupation: string | null;
  isPrimary: boolean;
  children: ChildSummary[];
};

export type GuardiansKpis = {
  totalGuardians: number;
  primaryContacts: number;
  multipleChildren: number;
  withWhatsapp: number;
};

export async function getParentsKpis(): Promise<GuardiansKpis> {
  const [total, primary, withWa, multi] = await Promise.all([
    db.guardian.count({ where: { deletedAt: null } }),
    db.guardian.count({ where: { deletedAt: null, isPrimary: true } }),
    db.guardian.count({
      where: { deletedAt: null, whatsapp: { not: null } },
    }),
    db.studentGuardian.groupBy({
      by: ['guardianId'],
      _count: { studentId: true },
      having: { studentId: { _count: { gt: 1 } } },
    }),
  ]);

  return {
    totalGuardians: total,
    primaryContacts: primary,
    multipleChildren: multi.length,
    withWhatsapp: withWa,
  };
}

type GetGuardiansOpts = {
  query?: string;
  relation?: string; // 'All' | 'Father' | 'Mother' | 'Guardian'
  take?: number;
  skip?: number;
};

function thirtyDaysAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getGuardians(
  opts: GetGuardiansOpts = {},
): Promise<{ rows: GuardianRow[]; total: number; relations: string[] }> {
  const { query = '', relation = 'All', take = 60, skip = 0 } = opts;
  const q = query.trim();
  const since = thirtyDaysAgo();

  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q } },
            { whatsapp: { contains: q } },
          ],
        }
      : {}),
    ...(relation && relation !== 'All' ? { relation } : {}),
  };

  const [guardians, total] = await Promise.all([
    db.guardian.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      take,
      skip,
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        relation: true,
        phone: true,
        whatsapp: true,
        email: true,
        occupation: true,
        isPrimary: true,
        students: {
          select: {
            isPrimary: true,
            student: {
              select: {
                id: true,
                fullName: true,
                rollNo: true,
                enrollments: {
                  where: { withdrawnAt: null },
                  take: 1,
                  select: { classroom: { select: { name: true } } },
                },
                invoices: {
                  where: {
                    status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
                  },
                  select: { total: true, amountPaid: true },
                },
                attendance: {
                  where: { date: { gte: since } },
                  select: { status: true },
                },
              },
            },
          },
        },
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.guardian.count({ where: where as any }),
  ]);

  const rows: GuardianRow[] = guardians.map((g) => ({
    id: g.id,
    fullName: g.fullName,
    relation: g.relation,
    phone: g.phone,
    whatsapp: g.whatsapp,
    email: g.email,
    occupation: g.occupation,
    isPrimary: g.isPrimary,
    children: g.students.map((sg) => {
      const s = sg.student;
      const attTotal = s.attendance.length;
      const attPresent = s.attendance.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE',
      ).length;
      const attendance30d =
        attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;
      const duesPKR = s.invoices.reduce(
        (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
        0,
      );
      return {
        id: s.id,
        name: s.fullName,
        rollNo: s.rollNo,
        classroom: s.enrollments[0]?.classroom.name ?? '—',
        attendance30d,
        duesPKR,
        isPrimary: sg.isPrimary,
      };
    }),
  }));

  return {
    rows,
    total,
    relations: ['All', 'Father', 'Mother', 'Guardian'],
  };
}

export type GuardianDetail = GuardianRow & {
  cnic: string | null;
  address: string | null;
  createdAtIso: string;
};

export async function getGuardianDetail(
  id: string,
): Promise<GuardianDetail | null> {
  const since = thirtyDaysAgo();
  const g = await db.guardian.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      relation: true,
      phone: true,
      whatsapp: true,
      email: true,
      occupation: true,
      isPrimary: true,
      cnic: true,
      address: true,
      createdAt: true,
      students: {
        select: {
          isPrimary: true,
          student: {
            select: {
              id: true,
              fullName: true,
              rollNo: true,
              enrollments: {
                where: { withdrawnAt: null },
                take: 1,
                select: { classroom: { select: { name: true } } },
              },
              invoices: {
                where: {
                  status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
                },
                select: { total: true, amountPaid: true },
              },
              attendance: {
                where: { date: { gte: since } },
                select: { status: true },
              },
            },
          },
        },
      },
    },
  });
  if (!g) return null;

  const children: ChildSummary[] = g.students.map((sg) => {
    const s = sg.student;
    const attTotal = s.attendance.length;
    const attPresent = s.attendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE',
    ).length;
    const attendance30d =
      attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;
    const duesPKR = s.invoices.reduce(
      (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
      0,
    );
    return {
      id: s.id,
      name: s.fullName,
      rollNo: s.rollNo,
      classroom: s.enrollments[0]?.classroom.name ?? '—',
      attendance30d,
      duesPKR,
      isPrimary: sg.isPrimary,
    };
  });

  return {
    id: g.id,
    fullName: g.fullName,
    relation: g.relation,
    phone: g.phone,
    whatsapp: g.whatsapp,
    email: g.email,
    occupation: g.occupation,
    isPrimary: g.isPrimary,
    cnic: g.cnic,
    address: g.address,
    createdAtIso: g.createdAt.toISOString(),
    children,
  };
}
