/**
 * Assessment queries — feed both list views (Montessori vs Primary) and the
 * detail page. All Decimal values are converted to `number` before crossing
 * the server/client boundary so React Server Components can serialize cleanly.
 *
 * Conventions:
 *   • Montessori view reads only NURSERY / MONTESSORI / KINDERGARTEN classrooms.
 *   • Primary view reads only PRIMARY classrooms (Class 1–6).
 *   • Distinct term + subject filter lists are derived from real Assessment rows.
 */

import { db } from '@/lib/db';
import type { AssessmentKind, ProgramKind } from '@prisma/client';

// ── Shared types ───────────────────────────────────────────────────────────

export type AssessmentKpis = {
  totalThisTerm: number;
  studentsAssessedThisMonth: number;
  pendingStudents: number;
  avgGradePct: number; // 0–100; computed from PRIMARY_GRADE rows in current term
  currentTermLabel: string;
};

export type MontessoriObservationRow = {
  id: string;
  studentId: string;
  studentName: string;
  classroom: string | null;
  area: string;
  milestone: string;
  notesSnippet: string | null;
  assessedByName: string;
  assessedAt: string; // ISO
  term: string | null;
};

export type PrimaryGradeRow = {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classroom: string | null;
  term: string;
  subject: string;
  score: number | null;
  scoreMax: number | null;
  scorePct: number | null;
  grade: string | null;
  assessedAt: string; // ISO
  assessedByName: string;
};

export type AssessmentDetail = {
  id: string;
  kind: AssessmentKind;
  studentId: string;
  studentName: string;
  rollNo: string;
  classroom: string | null;
  area: string | null;
  milestone: string | null;
  notes: string | null;
  term: string | null;
  subject: string | null;
  score: number | null;
  scoreMax: number | null;
  scorePct: number | null;
  grade: string | null;
  assessedAt: string;
  assessedByName: string;
  assessedById: string;
};

export type PickerStudent = {
  id: string;
  rollNo: string;
  name: string;
  classroom: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const earlyYearsKinds: ProgramKind[] = ['NURSERY', 'MONTESSORI', 'KINDERGARTEN'];
const primaryKinds: ProgramKind[] = ['PRIMARY'];

function snippet(s: string | null | undefined, max = 120): string | null {
  if (!s) return null;
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

function currentTermLabel(now = new Date()): string {
  // Falcons uses three terms per academic year. Reasonable defaults:
  //   Jan–Apr → Term 1, May–Aug → Term 2, Sep–Dec → Term 3.
  const m = now.getMonth(); // 0–11
  const year = now.getFullYear();
  const term = m <= 3 ? 1 : m <= 7 ? 2 : 3;
  return `Term ${term} · ${year}`;
}

function pct(score: number | null, max: number | null): number | null {
  if (score === null || max === null || max <= 0) return null;
  return Math.round((score / max) * 1000) / 10; // one decimal
}

// ── KPIs ───────────────────────────────────────────────────────────────────

export async function getAssessmentsKpis(): Promise<AssessmentKpis> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  sixtyDaysAgo.setHours(0, 0, 0, 0);

  const termLabel = currentTermLabel(now);

  const [totalThisTerm, monthAssessments, primaryThisTerm, totalActiveStudents, recentAssessedIds] =
    await Promise.all([
      db.assessment.count({ where: { term: termLabel } }),
      db.assessment.findMany({
        where: { assessedAt: { gte: monthStart } },
        select: { studentId: true },
      }),
      db.assessment.findMany({
        where: { kind: 'PRIMARY_GRADE', term: termLabel },
        select: { score: true, scoreMax: true },
      }),
      db.student.count({ where: { deletedAt: null, status: { in: ['ACTIVE', 'ON_LEAVE'] } } }),
      db.assessment.findMany({
        where: { assessedAt: { gte: sixtyDaysAgo } },
        select: { studentId: true },
        distinct: ['studentId'],
      }),
    ]);

  const studentsAssessedThisMonth = new Set(monthAssessments.map((a) => a.studentId)).size;
  const pendingStudents = Math.max(0, totalActiveStudents - recentAssessedIds.length);

  // Average grade % across all primary grade rows this term.
  let totalPct = 0;
  let counted = 0;
  for (const row of primaryThisTerm) {
    const s = row.score === null ? null : Number(row.score);
    const m = row.scoreMax === null ? null : Number(row.scoreMax);
    if (s !== null && m !== null && m > 0) {
      totalPct += (s / m) * 100;
      counted++;
    }
  }
  const avgGradePct = counted > 0 ? Math.round((totalPct / counted) * 10) / 10 : 0;

  return {
    totalThisTerm,
    studentsAssessedThisMonth,
    pendingStudents,
    avgGradePct,
    currentTermLabel: termLabel,
  };
}

// ── Montessori observations list ───────────────────────────────────────────

type MontessoriListOpts = {
  classroomId?: string; // pass 'All' / undefined for no filter
  take?: number;
  skip?: number;
};

export async function getMontessoriObservations(
  opts: MontessoriListOpts = {},
): Promise<{ rows: MontessoriObservationRow[]; total: number }> {
  const { classroomId, take = 30, skip = 0 } = opts;
  const filter = classroomId && classroomId !== 'All' ? classroomId : undefined;

  const where = {
    kind: 'MONTESSORI_OBSERVATION' as const,
    student: {
      enrollments: {
        some: {
          withdrawnAt: null,
          classroom: filter
            ? { id: filter }
            : { programKind: { in: earlyYearsKinds } },
        },
      },
    },
  };

  const [rows, total] = await Promise.all([
    db.assessment.findMany({
      where,
      orderBy: { assessedAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        studentId: true,
        area: true,
        milestone: true,
        notes: true,
        term: true,
        assessedAt: true,
        assessedBy: { select: { name: true } },
        student: {
          select: {
            fullName: true,
            enrollments: {
              where: { withdrawnAt: null },
              take: 1,
              select: { classroom: { select: { name: true } } },
            },
          },
        },
      },
    }),
    db.assessment.count({ where }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.fullName,
      classroom: r.student.enrollments[0]?.classroom.name ?? null,
      area: r.area ?? '—',
      milestone: r.milestone ?? '—',
      notesSnippet: snippet(r.notes, 180),
      assessedByName: r.assessedBy.name,
      assessedAt: r.assessedAt.toISOString(),
      term: r.term,
    })),
    total,
  };
}

// ── Primary grades list ────────────────────────────────────────────────────

type PrimaryListOpts = {
  classroomId?: string;
  term?: string;
  subject?: string;
  take?: number;
  skip?: number;
};

export async function getPrimaryGrades(
  opts: PrimaryListOpts = {},
): Promise<{ rows: PrimaryGradeRow[]; total: number }> {
  const { classroomId, term, subject, take = 100, skip = 0 } = opts;

  const where = {
    kind: 'PRIMARY_GRADE' as const,
    ...(term && term !== 'All' ? { term } : {}),
    ...(subject && subject !== 'All' ? { subject } : {}),
    student: {
      enrollments: {
        some: {
          withdrawnAt: null,
          classroom:
            classroomId && classroomId !== 'All'
              ? { id: classroomId }
              : { programKind: { in: primaryKinds } },
        },
      },
    },
  };

  const [rows, total] = await Promise.all([
    db.assessment.findMany({
      where,
      orderBy: [{ assessedAt: 'desc' }],
      take,
      skip,
      select: {
        id: true,
        studentId: true,
        term: true,
        subject: true,
        score: true,
        scoreMax: true,
        grade: true,
        assessedAt: true,
        assessedBy: { select: { name: true } },
        student: {
          select: {
            fullName: true,
            rollNo: true,
            enrollments: {
              where: { withdrawnAt: null },
              take: 1,
              select: { classroom: { select: { name: true } } },
            },
          },
        },
      },
    }),
    db.assessment.count({ where }),
  ]);

  return {
    rows: rows.map((r) => {
      const score = r.score === null ? null : Number(r.score);
      const max = r.scoreMax === null ? null : Number(r.scoreMax);
      return {
        id: r.id,
        studentId: r.studentId,
        studentName: r.student.fullName,
        rollNo: r.student.rollNo,
        classroom: r.student.enrollments[0]?.classroom.name ?? null,
        term: r.term ?? '—',
        subject: r.subject ?? '—',
        score,
        scoreMax: max,
        scorePct: pct(score, max),
        grade: r.grade,
        assessedAt: r.assessedAt.toISOString(),
        assessedByName: r.assessedBy.name,
      };
    }),
    total,
  };
}

// ── Single assessment detail ───────────────────────────────────────────────

export async function getAssessment(id: string): Promise<AssessmentDetail | null> {
  const a = await db.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      kind: true,
      studentId: true,
      area: true,
      milestone: true,
      notes: true,
      term: true,
      subject: true,
      score: true,
      scoreMax: true,
      grade: true,
      assessedAt: true,
      assessedById: true,
      assessedBy: { select: { name: true } },
      student: {
        select: {
          fullName: true,
          rollNo: true,
          enrollments: {
            where: { withdrawnAt: null },
            take: 1,
            select: { classroom: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!a) return null;

  const score = a.score === null ? null : Number(a.score);
  const max = a.scoreMax === null ? null : Number(a.scoreMax);

  return {
    id: a.id,
    kind: a.kind,
    studentId: a.studentId,
    studentName: a.student.fullName,
    rollNo: a.student.rollNo,
    classroom: a.student.enrollments[0]?.classroom.name ?? null,
    area: a.area,
    milestone: a.milestone,
    notes: a.notes,
    term: a.term,
    subject: a.subject,
    score,
    scoreMax: max,
    scorePct: pct(score, max),
    grade: a.grade,
    assessedAt: a.assessedAt.toISOString(),
    assessedByName: a.assessedBy.name,
    assessedById: a.assessedById,
  };
}

// ── Picker / filter helpers ────────────────────────────────────────────────

/**
 * Returns the active students eligible for an assessment of the given group.
 *   • 'early-years' → NURSERY / MONTESSORI / KINDERGARTEN
 *   • 'primary'     → PRIMARY (Class 1–6)
 */
export async function getStudentsForPicker(
  group: 'early-years' | 'primary',
): Promise<PickerStudent[]> {
  const kinds = group === 'early-years' ? earlyYearsKinds : primaryKinds;
  const students = await db.student.findMany({
    where: {
      deletedAt: null,
      status: { in: ['ACTIVE', 'ON_LEAVE'] },
      enrollments: {
        some: {
          withdrawnAt: null,
          classroom: { programKind: { in: kinds } },
        },
      },
    },
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      rollNo: true,
      fullName: true,
      enrollments: {
        where: { withdrawnAt: null },
        take: 1,
        select: { classroom: { select: { name: true } } },
      },
    },
  });

  return students.map((s) => ({
    id: s.id,
    rollNo: s.rollNo,
    name: s.fullName,
    classroom: s.enrollments[0]?.classroom.name ?? null,
  }));
}

export async function getClassroomsForFilter(
  group: 'early-years' | 'primary',
): Promise<Array<{ id: string; name: string }>> {
  const kinds = group === 'early-years' ? earlyYearsKinds : primaryKinds;
  const rows = await db.classroom.findMany({
    where: { programKind: { in: kinds } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return rows;
}

export async function getTermsForFilter(): Promise<string[]> {
  const rows = await db.assessment.findMany({
    where: { term: { not: null } },
    select: { term: true },
    distinct: ['term'],
    orderBy: { term: 'desc' },
  });
  return rows.map((r) => r.term!).filter(Boolean);
}

export async function getSubjectsForFilter(): Promise<string[]> {
  const rows = await db.assessment.findMany({
    where: { kind: 'PRIMARY_GRADE', subject: { not: null } },
    select: { subject: true },
    distinct: ['subject'],
    orderBy: { subject: 'asc' },
  });
  return rows.map((r) => r.subject!).filter(Boolean);
}
