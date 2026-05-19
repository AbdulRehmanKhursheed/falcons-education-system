/**
 * Homework queries — feed the staff `/homework` list, detail, and form pickers.
 *
 * Shapes are fully serialisable (no Prisma Date/Decimal types) so they can
 * flow into client components without further processing.
 */

import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────

export type HomeworkKpis = {
  totalActive: number; // dueDate >= today
  dueThisWeek: number;
  overdue: number;
  postedRecent: number; // last 7 days
};

export type HomeworkRow = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  classroomId: string;
  classroomName: string;
  dueDate: string; // ISO
  attachmentUrl: string | null;
  postedAt: string;
  postedById: string;
  postedByName: string;
};

export type HomeworkDetail = HomeworkRow & {
  classroomProgramKind: string;
};

export type SubjectOption = {
  id: string;
  name: string;
};

export type ClassroomOption = {
  id: string;
  name: string;
  programKind: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// ── KPIs ───────────────────────────────────────────────────────────────────

export async function getHomeworkKpis(opts: { classroomIds?: string[] } = {}): Promise<HomeworkKpis> {
  const today = startOfDay(new Date());
  const sevenDaysAhead = new Date(today);
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const classroomFilter = opts.classroomIds && opts.classroomIds.length > 0
    ? { classroomId: { in: opts.classroomIds } }
    : {};

  const [totalActive, dueThisWeek, overdue, postedRecent] = await Promise.all([
    db.homework.count({
      where: { ...classroomFilter, dueDate: { gte: today } },
    }),
    db.homework.count({
      where: {
        ...classroomFilter,
        dueDate: { gte: today, lt: sevenDaysAhead },
      },
    }),
    db.homework.count({
      where: { ...classroomFilter, dueDate: { lt: today } },
    }),
    db.homework.count({
      where: { ...classroomFilter, postedAt: { gte: sevenDaysAgo } },
    }),
  ]);

  return { totalActive, dueThisWeek, overdue, postedRecent };
}

// ── List ───────────────────────────────────────────────────────────────────

type HomeworkListOpts = {
  query?: string;
  classroomId?: string;
  subjectId?: string;
  activeOnly?: boolean;
  classroomIds?: string[]; // for teacher gating
  take?: number;
  skip?: number;
};

export async function getHomework(
  opts: HomeworkListOpts = {},
): Promise<{ rows: HomeworkRow[]; total: number }> {
  const {
    query,
    classroomId,
    subjectId,
    activeOnly = true,
    classroomIds,
    take = 50,
    skip = 0,
  } = opts;

  const today = startOfDay(new Date());

  // Resolve subjectId → subject name (Homework table stores name, not id).
  let subjectName: string | undefined;
  if (subjectId && subjectId !== 'All') {
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      select: { name: true },
    });
    if (subject) subjectName = subject.name;
    else {
      // Picked a subject that doesn't exist — return zero rows.
      return { rows: [], total: 0 };
    }
  }

  const where: Prisma.HomeworkWhereInput = {
    ...(activeOnly ? { dueDate: { gte: today } } : {}),
    ...(classroomId && classroomId !== 'All' ? { classroomId } : {}),
    ...(classroomIds && classroomIds.length > 0
      ? { classroomId: { in: classroomIds } }
      : {}),
    ...(subjectName ? { subject: subjectName } : {}),
    ...(query && query.trim().length > 0
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.homework.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { postedAt: 'desc' }],
      take,
      skip,
      select: {
        id: true,
        subject: true,
        title: true,
        description: true,
        classroomId: true,
        classroom: { select: { name: true } },
        dueDate: true,
        attachmentUrl: true,
        postedAt: true,
        postedById: true,
        postedBy: { select: { name: true } },
      },
    }),
    db.homework.count({ where }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      title: r.title,
      description: r.description,
      classroomId: r.classroomId,
      classroomName: r.classroom.name,
      dueDate: r.dueDate.toISOString(),
      attachmentUrl: r.attachmentUrl,
      postedAt: r.postedAt.toISOString(),
      postedById: r.postedById,
      postedByName: r.postedBy.name,
    })),
    total,
  };
}

// ── Detail ─────────────────────────────────────────────────────────────────

export async function getHomeworkDetail(id: string): Promise<HomeworkDetail | null> {
  const row = await db.homework.findUnique({
    where: { id },
    select: {
      id: true,
      subject: true,
      title: true,
      description: true,
      classroomId: true,
      classroom: { select: { name: true, programKind: true } },
      dueDate: true,
      attachmentUrl: true,
      postedAt: true,
      postedById: true,
      postedBy: { select: { name: true } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    subject: row.subject,
    title: row.title,
    description: row.description,
    classroomId: row.classroomId,
    classroomName: row.classroom.name,
    classroomProgramKind: row.classroom.programKind,
    dueDate: row.dueDate.toISOString(),
    attachmentUrl: row.attachmentUrl,
    postedAt: row.postedAt.toISOString(),
    postedById: row.postedById,
    postedByName: row.postedBy.name,
  };
}

// ── Filter helpers ─────────────────────────────────────────────────────────

export async function getSubjectsForFilter(): Promise<SubjectOption[]> {
  const rows = await db.subject.findMany({
    where: { active: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true },
  });
  return rows;
}

/**
 * Classrooms for the current academic year, used by both the list filter and
 * the create/edit form pickers. Teachers can pass `restrictTo` to clip the list
 * down to homerooms they actually own.
 */
export async function getClassroomsForFilter(opts: {
  restrictTo?: string[];
} = {}): Promise<ClassroomOption[]> {
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const where: Prisma.ClassroomWhereInput = {
    ...(currentYear ? { academicYearId: currentYear.id } : {}),
    ...(opts.restrictTo && opts.restrictTo.length > 0
      ? { id: { in: opts.restrictTo } }
      : {}),
  };

  const rows = await db.classroom.findMany({
    where,
    orderBy: { name: 'asc' },
    select: { id: true, name: true, programKind: true },
  });
  return rows;
}

/**
 * Resolve a teacher's homeroom classroom IDs by their userId. Returns an empty
 * array if the user has no teacher record or no homerooms — callers should
 * treat that as "no access".
 */
export async function getTeacherHomeroomIds(userId: string): Promise<string[]> {
  const teacher = await db.teacher.findUnique({
    where: { userId },
    select: { homerooms: { select: { id: true } } },
  });
  return teacher?.homerooms.map((c) => c.id) ?? [];
}
