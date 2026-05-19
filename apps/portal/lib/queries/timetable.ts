/**
 * Timetable queries — return plain serializable shapes (no Prisma Date or
 * Decimal). Used by the timetable page, the inline editor, and the Subjects +
 * Periods management screens.
 */

import { db } from '@/lib/db';
import type { AppRole } from '@/lib/auth-helpers';

// ── KPIs ────────────────────────────────────────────────────────────────────

export type TimetableKpis = {
  classroomsWithTimetables: number;
  totalClassrooms: number;
  periods: number;
  subjectsUsed: number;
  unassignedSlots: number;
};

/**
 * "Unassigned slots" = classroom × dayOfWeek × non-break period combinations
 * that don't currently have a TimetableEntry, OR have an entry with no
 * subject (e.g. Assembly / free-play). Counted only against the current
 * academic year and the days that already have at least one entry on record
 * for that classroom — otherwise a brand-new classroom with no schedule yet
 * would dwarf the number.
 */
export async function getTimetableKpis(): Promise<TimetableKpis> {
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const [classrooms, periods, distinctEntries, totalClassrooms] =
    await Promise.all([
      db.classroom.findMany({
        where: currentYear ? { academicYearId: currentYear.id } : {},
        select: { id: true },
      }),
      db.period.findMany({ select: { id: true, isBreak: true } }),
      db.timetableEntry.findMany({
        where: currentYear
          ? { classroom: { academicYearId: currentYear.id } }
          : {},
        select: { classroomId: true, dayOfWeek: true, periodId: true, subjectId: true },
      }),
      db.classroom.count({
        where: currentYear ? { academicYearId: currentYear.id } : {},
      }),
    ]);

  const teachingPeriodIds = periods.filter((p) => !p.isBreak).map((p) => p.id);

  // Per-classroom: which days are "in use" (have any entry), and which
  // (day, period) combinations are filled with a subject.
  const filledByClass = new Map<string, Set<string>>(); // key: `${day}:${periodId}`
  const daysInUseByClass = new Map<string, Set<number>>();

  for (const e of distinctEntries) {
    let filled = filledByClass.get(e.classroomId);
    if (!filled) {
      filled = new Set();
      filledByClass.set(e.classroomId, filled);
    }
    if (e.subjectId) {
      filled.add(`${e.dayOfWeek}:${e.periodId}`);
    }

    let days = daysInUseByClass.get(e.classroomId);
    if (!days) {
      days = new Set();
      daysInUseByClass.set(e.classroomId, days);
    }
    days.add(e.dayOfWeek);
  }

  let unassignedSlots = 0;
  for (const c of classrooms) {
    const days = daysInUseByClass.get(c.id);
    if (!days || days.size === 0) continue; // skip classrooms with no schedule at all
    const filled = filledByClass.get(c.id) ?? new Set<string>();
    for (const day of days) {
      for (const periodId of teachingPeriodIds) {
        if (!filled.has(`${day}:${periodId}`)) unassignedSlots++;
      }
    }
  }

  // Track subjects actually used in any entry — gives a sense of "how much of
  // the master list is in play".
  const subjectsUsed = new Set(
    distinctEntries.map((e) => e.subjectId).filter((v): v is string => Boolean(v)),
  ).size;

  return {
    classroomsWithTimetables: daysInUseByClass.size,
    totalClassrooms,
    periods: periods.length,
    subjectsUsed,
    unassignedSlots,
  };
}

// ── Classroom selector ─────────────────────────────────────────────────────

export type TimetableClassroomOption = {
  id: string;
  name: string;
  programKind: string;
  hasTimetable: boolean;
};

const programOrder: Record<string, number> = {
  NURSERY: 0,
  MONTESSORI: 1,
  KINDERGARTEN: 2,
  PRIMARY: 3,
  EVENING_COACHING: 4,
  SATURDAY_COACHING: 5,
  COMPUTER_COURSE: 6,
};

export async function getClassroomsForTimetable(
  userId: string,
  role: AppRole,
): Promise<TimetableClassroomOption[]> {
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  // Teachers see only their homeroom classes; everyone else sees all.
  let teacherFilter: { homeroomTeacherId: string } | undefined;
  if (role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!teacher) return [];
    teacherFilter = { homeroomTeacherId: teacher.id };
  }

  const rows = await db.classroom.findMany({
    where: {
      ...(currentYear ? { academicYearId: currentYear.id } : {}),
      ...(teacherFilter ?? {}),
    },
    select: {
      id: true,
      name: true,
      programKind: true,
      _count: { select: { timetableEntries: true } },
    },
  });

  return rows
    .map((c) => ({
      id: c.id,
      name: c.name,
      programKind: c.programKind,
      hasTimetable: c._count.timetableEntries > 0,
    }))
    .sort((a, b) => {
      const pa = programOrder[a.programKind] ?? 99;
      const pb = programOrder[b.programKind] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
}

// ── Periods (for grid rows) ────────────────────────────────────────────────

export type PeriodRow = {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  label: string | null;
  isBreak: boolean;
};

export async function getAllPeriods(): Promise<PeriodRow[]> {
  const rows = await db.period.findMany({
    orderBy: { number: 'asc' },
    select: {
      id: true,
      number: true,
      startTime: true,
      endTime: true,
      label: true,
      isBreak: true,
    },
  });
  return rows;
}

// ── Subjects ───────────────────────────────────────────────────────────────

export type SubjectRow = {
  id: string;
  name: string;
  code: string | null;
  order: number;
  active: boolean;
};

export async function getAllSubjects(): Promise<SubjectRow[]> {
  const rows = await db.subject.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, code: true, order: true, active: true },
  });
  return rows.map((s) => ({ ...s, code: s.code ?? null }));
}

/** Active subjects only — used in the entry editor dropdown. */
export async function getSubjects(): Promise<SubjectRow[]> {
  const rows = await db.subject.findMany({
    where: { active: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, code: true, order: true, active: true },
  });
  return rows.map((s) => ({ ...s, code: s.code ?? null }));
}

// ── Teachers (for the entry editor dropdown) ───────────────────────────────

export type TeacherOption = {
  id: string; // Teacher.id
  name: string;
};

export async function getTeachersForSelect(): Promise<TeacherOption[]> {
  const rows = await db.teacher.findMany({
    where: {
      isActive: true,
      user: { active: true, deletedAt: null, role: 'TEACHER' },
    },
    select: {
      id: true,
      user: { select: { name: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });
  return rows.map((t) => ({ id: t.id, name: t.user.name }));
}

// ── Weekly grid for one classroom ──────────────────────────────────────────

export type TimetableEntryCell = {
  id: string;
  subjectId: string | null;
  subjectName: string | null;
  subjectCode: string | null;
  subjectOrder: number | null;
  teacherId: string | null;
  teacherName: string | null;
  notes: string | null;
};

export type TimetableGrid = {
  classroom: {
    id: string;
    name: string;
    programKind: string;
    homeroomTeacher: { name: string } | null;
  };
  periods: PeriodRow[];
  days: number[]; // [1..5] or [1..6] depending on existing entries
  /** Map `${dayOfWeek}:${periodId}` → entry data. */
  entries: Record<string, TimetableEntryCell>;
};

export async function getTimetableGrid(
  classroomId: string,
): Promise<TimetableGrid | null> {
  const [classroom, periods, rawEntries] = await Promise.all([
    db.classroom.findUnique({
      where: { id: classroomId },
      select: {
        id: true,
        name: true,
        programKind: true,
        homeroomTeacher: {
          select: { user: { select: { name: true } } },
        },
      },
    }),
    getAllPeriods(),
    db.timetableEntry.findMany({
      where: { classroomId },
      select: {
        id: true,
        dayOfWeek: true,
        periodId: true,
        notes: true,
        subject: {
          select: { id: true, name: true, code: true, order: true },
        },
        teacher: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
    }),
  ]);

  if (!classroom) return null;

  const entries: Record<string, TimetableEntryCell> = {};
  const daysWithEntries = new Set<number>();
  for (const e of rawEntries) {
    const key = `${e.dayOfWeek}:${e.periodId}`;
    daysWithEntries.add(e.dayOfWeek);
    entries[key] = {
      id: e.id,
      subjectId: e.subject?.id ?? null,
      subjectName: e.subject?.name ?? null,
      subjectCode: e.subject?.code ?? null,
      subjectOrder: e.subject?.order ?? null,
      teacherId: e.teacher?.id ?? null,
      teacherName: e.teacher?.user.name ?? null,
      notes: e.notes ?? null,
    };
  }

  // If any Saturday entry exists, show Mon-Sat. Otherwise show Mon-Fri.
  // This keeps the grid honest to what's actually scheduled.
  const showSaturday = daysWithEntries.has(6);
  const days = showSaturday ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];

  return {
    classroom: {
      id: classroom.id,
      name: classroom.name,
      programKind: classroom.programKind,
      homeroomTeacher: classroom.homeroomTeacher
        ? { name: classroom.homeroomTeacher.user.name }
        : null,
    },
    periods,
    days,
    entries,
  };
}
