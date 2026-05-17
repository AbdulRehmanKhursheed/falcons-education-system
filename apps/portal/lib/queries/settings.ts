/**
 * Settings queries — read-side helpers for the Settings module.
 */

import { db } from '@/lib/db';
import type { Role, AnnouncementAudience } from '@prisma/client';

// ── KPI cards on the settings landing ──────────────────────────────────────

export type SettingsKpis = {
  academicYears: number;
  currentYearName: string | null;
  users: number;
  activeUsers: number;
  feeStructures: number;
  announcements: number;
  pinnedAnnouncements: number;
};

export async function getSettingsKpis(): Promise<SettingsKpis> {
  const [
    academicYears,
    currentYear,
    users,
    activeUsers,
    feeStructures,
    announcements,
    pinnedAnnouncements,
  ] = await Promise.all([
    db.academicYear.count(),
    db.academicYear.findFirst({
      where: { isCurrent: true },
      select: { name: true },
    }),
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, active: true } }),
    db.feeStructure.count({ where: { active: true } }),
    db.announcement.count(),
    db.announcement.count({ where: { pinned: true } }),
  ]);

  return {
    academicYears,
    currentYearName: currentYear?.name ?? null,
    users,
    activeUsers,
    feeStructures,
    announcements,
    pinnedAnnouncements,
  };
}

// ── Academic years ─────────────────────────────────────────────────────────

export type AcademicYearRow = {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  isCurrent: boolean;
  classroomCount: number;
};

export async function getAcademicYears(): Promise<AcademicYearRow[]> {
  const years = await db.academicYear.findMany({
    orderBy: [{ startDate: 'desc' }],
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      _count: { select: { classrooms: true } },
    },
  });

  return years.map((y) => ({
    id: y.id,
    name: y.name,
    startDate: y.startDate.toISOString(),
    endDate: y.endDate.toISOString(),
    isCurrent: y.isCurrent,
    classroomCount: y._count.classrooms,
  }));
}

// ── Users ──────────────────────────────────────────────────────────────────

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  phone: string | null;
  updatedAt: string;       // ISO — used as "last activity" proxy
  hasPassword: boolean;
  createdAt: string;
};

type UserQuery = {
  role?: Role | null;
  activeOnly?: boolean;
  query?: string;
};

export async function getUsers(opts: UserQuery = {}): Promise<UserRow[]> {
  const { role, activeOnly, query } = opts;
  const q = (query ?? '').trim();

  const users = await db.user.findMany({
    where: {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(activeOnly ? { active: true } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      phone: true,
      updatedAt: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    phone: u.phone,
    updatedAt: u.updatedAt.toISOString(),
    createdAt: u.createdAt.toISOString(),
    hasPassword: Boolean(u.passwordHash),
  }));
}

// ── Announcements ──────────────────────────────────────────────────────────

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  classroomId: string | null;
  classroomName: string | null;
  publishAt: string;
  expiresAt: string | null;
  pinned: boolean;
  postedById: string;
  postedByName: string;
  createdAt: string;
};

export async function getAnnouncements(): Promise<AnnouncementRow[]> {
  const rows = await db.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { publishAt: 'desc' }],
    select: {
      id: true,
      title: true,
      body: true,
      audience: true,
      classroomId: true,
      classroom: { select: { name: true } },
      publishAt: true,
      expiresAt: true,
      pinned: true,
      postedById: true,
      postedBy: { select: { name: true } },
      createdAt: true,
    },
  });

  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    audience: a.audience,
    classroomId: a.classroomId,
    classroomName: a.classroom?.name ?? null,
    publishAt: a.publishAt.toISOString(),
    expiresAt: a.expiresAt?.toISOString() ?? null,
    pinned: a.pinned,
    postedById: a.postedById,
    postedByName: a.postedBy.name,
    createdAt: a.createdAt.toISOString(),
  }));
}

// ── Classrooms for select dropdowns ────────────────────────────────────────

export type ClassroomOption = {
  id: string;
  name: string;
  academicYear: string;
};

export async function getClassroomOptions(): Promise<ClassroomOption[]> {
  const rows = await db.classroom.findMany({
    orderBy: [{ academicYear: { startDate: 'desc' } }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      academicYear: { select: { name: true } },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    academicYear: c.academicYear.name,
  }));
}
