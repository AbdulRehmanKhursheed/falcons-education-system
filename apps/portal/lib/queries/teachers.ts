/**
 * Teachers queries — KPI strip, paged grid, and full detail (homerooms,
 * recent audit log). All return plain serializable objects (no Prisma
 * Decimal / Date instances exposed) so they can be passed to client
 * components freely.
 */

import { db } from '@/lib/db';

export type TeacherListRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  qualification: string | null;
  joinedAtIso: string | null;
  isActive: boolean;
  homerooms: Array<{ id: string; name: string; studentCount: number }>;
};

export type TeachersKpis = {
  totalActive: number;
  totalInactive: number;
  homeroomAssigned: number;
  classroomsCovered: number;
  avgStudentsPerTeacher: number;
};

export async function getTeachersKpis(): Promise<TeachersKpis> {
  const [activeCount, inactiveCount, classroomsWithHomeroom, totalEnrollments] =
    await Promise.all([
      db.teacher.count({ where: { isActive: true, user: { deletedAt: null } } }),
      db.teacher.count({
        where: { isActive: false, user: { deletedAt: null } },
      }),
      db.classroom.findMany({
        where: { homeroomTeacherId: { not: null } },
        select: { homeroomTeacherId: true },
      }),
      db.enrollment.count({ where: { withdrawnAt: null } }),
    ]);

  const teachersWithHomeroom = new Set(
    classroomsWithHomeroom
      .map((c) => c.homeroomTeacherId)
      .filter((id): id is string => Boolean(id)),
  ).size;

  const avg =
    activeCount > 0
      ? Math.round((totalEnrollments / activeCount) * 10) / 10
      : 0;

  return {
    totalActive: activeCount,
    totalInactive: inactiveCount,
    homeroomAssigned: teachersWithHomeroom,
    classroomsCovered: classroomsWithHomeroom.length,
    avgStudentsPerTeacher: avg,
  };
}

type GetTeachersOpts = {
  query?: string;
  activeOnly?: boolean;
  take?: number;
  skip?: number;
};

export async function getTeachers(
  opts: GetTeachersOpts = {},
): Promise<{ rows: TeacherListRow[]; total: number }> {
  const { query = '', activeOnly = false, take = 60, skip = 0 } = opts;
  const q = query.trim();

  const where = {
    user: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    ...(activeOnly ? { isActive: true } : {}),
  };

  const [teachers, total] = await Promise.all([
    db.teacher.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      take,
      skip,
      orderBy: { user: { name: 'asc' } },
      select: {
        id: true,
        userId: true,
        qualification: true,
        joinedAt: true,
        isActive: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        homerooms: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { enrollments: { where: { withdrawnAt: null } } },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.teacher.count({ where: where as any }),
  ]);

  const rows: TeacherListRow[] = teachers.map((t) => ({
    id: t.id,
    userId: t.userId,
    name: t.user.name,
    email: t.user.email,
    phone: t.user.phone,
    avatarUrl: t.user.avatarUrl,
    qualification: t.qualification,
    joinedAtIso: t.joinedAt ? t.joinedAt.toISOString() : null,
    isActive: t.isActive,
    homerooms: t.homerooms.map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: c._count.enrollments,
    })),
  }));

  return { rows, total };
}

export type TeacherDetail = TeacherListRow & {
  joinedAtIso: string | null;
  createdAtIso: string;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAtIso: string;
  }>;
};

export async function getTeacherDetail(
  id: string,
): Promise<TeacherDetail | null> {
  const t = await db.teacher.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      qualification: true,
      joinedAt: true,
      isActive: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      homerooms: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { enrollments: { where: { withdrawnAt: null } } },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
  });
  if (!t) return null;

  const recent = await db.auditLog.findMany({
    where: { actorId: t.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      createdAt: true,
    },
  });

  return {
    id: t.id,
    userId: t.userId,
    name: t.user.name,
    email: t.user.email,
    phone: t.user.phone,
    avatarUrl: t.user.avatarUrl,
    qualification: t.qualification,
    joinedAtIso: t.joinedAt ? t.joinedAt.toISOString() : null,
    createdAtIso: t.createdAt.toISOString(),
    isActive: t.isActive,
    homerooms: t.homerooms.map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: c._count.enrollments,
    })),
    recentActivity: recent.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      createdAtIso: r.createdAt.toISOString(),
    })),
  };
}

export type ClassroomOption = {
  id: string;
  name: string;
  currentHomeroomTeacherId: string | null;
};

export async function getClassroomOptions(): Promise<ClassroomOption[]> {
  const rows = await db.classroom.findMany({
    select: { id: true, name: true, homeroomTeacherId: true },
    orderBy: { name: 'asc' },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    currentHomeroomTeacherId: c.homeroomTeacherId,
  }));
}
