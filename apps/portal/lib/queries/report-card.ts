/**
 * Report card queries — power the per-student, per-term print page.
 *
 * Two compiled shapes exist depending on the student's program kind:
 *   • Primary (Class 1–6) → scored subject rows + overall summary
 *   • Early years (Nursery / Montessori / Kindergarten) → grouped Montessori
 *     observations by area
 *
 * Term-to-date mapping is not in the schema — attendance % is computed over
 * a 30-day window ending today (documented limitation surfaced in the UI).
 */

import { db } from '@/lib/db';
import { deriveGrade } from '@/lib/schemas/assessments';
import type { ProgramKind } from '@prisma/client';

// ── Public types ───────────────────────────────────────────────────────────

export type ReportCardStudent = {
  id: string;
  rollNo: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string | null;
  photoUrl: string | null;
  classroomId: string | null;
  classroomName: string | null;
  programKind: ProgramKind | null;
  homeroomTeacherName: string | null;
};

export type ReportCardSubjectRow = {
  subjectName: string;
  score: number;
  scoreMax: number;
  percentage: number;
  grade: string;
  assessedAt: string;
  assessedByName: string | null;
};

export type ReportCardObservationRow = {
  milestone: string;
  notes: string | null;
  assessedAt: string;
  assessedByName: string | null;
};

export type ReportCardObservationGroup = {
  area: string;
  observations: ReportCardObservationRow[];
};

export type ReportCardAttendance = {
  windowLabel: string;
  attendancePct: number;
  present: number;
  late: number;
  absent: number;
  sick: number;
  excused: number;
  totalMarked: number;
};

export type ReportCardData = {
  student: ReportCardStudent;
  term: string;
  isMontessori: boolean;
  primary: {
    rows: ReportCardSubjectRow[];
    totalScore: number;
    totalMax: number;
    percentage: number;
    overallGrade: string;
  };
  observations: ReportCardObservationGroup[];
  attendance: ReportCardAttendance;
  remarks: {
    text: string | null;
    by: string | null;
    at: string | null;
  };
  issuedAt: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function calcAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

const earlyYearsKinds: ProgramKind[] = [
  'NURSERY',
  'MONTESSORI',
  'KINDERGARTEN',
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── Term list ──────────────────────────────────────────────────────────────

/**
 * Distinct terms the student has assessments for, newest first. Drops null
 * `term` values — a row without a term can't anchor a report card.
 */
export async function getStudentTerms(studentId: string): Promise<string[]> {
  const rows = await db.assessment.findMany({
    where: { studentId, term: { not: null } },
    select: { term: true, assessedAt: true },
    orderBy: { assessedAt: 'desc' },
  });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    if (r.term && !seen.has(r.term)) {
      seen.add(r.term);
      out.push(r.term);
    }
  }
  return out;
}

// ── Compiled report card data ──────────────────────────────────────────────

export async function getReportCardData(
  studentId: string,
  term: string,
): Promise<ReportCardData | null> {
  const student = await db.student.findFirst({
    where: { id: studentId, deletedAt: null },
    select: {
      id: true,
      rollNo: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
      photoUrl: true,
      enrollments: {
        where: { withdrawnAt: null },
        orderBy: { enrolledAt: 'desc' },
        take: 1,
        select: {
          classroom: {
            select: {
              id: true,
              name: true,
              programKind: true,
              homeroomTeacher: {
                select: { user: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!student) return null;

  const enrollment = student.enrollments[0];
  const programKind: ProgramKind | null = enrollment?.classroom.programKind ?? null;
  const isMontessori = programKind ? earlyYearsKinds.includes(programKind) : false;

  // Pull every assessment for this term — we'll split by kind below.
  const assessments = await db.assessment.findMany({
    where: { studentId, term },
    orderBy: { assessedAt: 'asc' },
    select: {
      id: true,
      kind: true,
      subject: true,
      score: true,
      scoreMax: true,
      grade: true,
      area: true,
      milestone: true,
      notes: true,
      assessedAt: true,
      assessedBy: { select: { name: true } },
    },
  });

  // ── Primary grade rows (best-of per subject if there are duplicates) ─────
  const subjectMap = new Map<string, ReportCardSubjectRow>();
  for (const a of assessments) {
    if (a.kind !== 'PRIMARY_GRADE') continue;
    if (!a.subject || a.score === null || a.scoreMax === null) continue;
    const score = Number(a.score);
    const max = Number(a.scoreMax);
    if (!(max > 0)) continue;
    const percentage = round1((score / max) * 100);
    const grade =
      a.grade ?? deriveGrade(score, max);
    const row: ReportCardSubjectRow = {
      subjectName: a.subject,
      score,
      scoreMax: max,
      percentage,
      grade,
      assessedAt: a.assessedAt.toISOString(),
      assessedByName: a.assessedBy?.name ?? null,
    };
    const existing = subjectMap.get(a.subject);
    if (!existing || existing.percentage < percentage) {
      subjectMap.set(a.subject, row);
    }
  }
  const subjectRows = Array.from(subjectMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName),
  );

  const totalScore = subjectRows.reduce((s, r) => s + r.score, 0);
  const totalMax = subjectRows.reduce((s, r) => s + r.scoreMax, 0);
  const percentage = totalMax > 0 ? round1((totalScore / totalMax) * 100) : 0;
  const overallGrade = totalMax > 0 ? deriveGrade(totalScore, totalMax) : '—';

  // ── Montessori observations grouped by area ──────────────────────────────
  const groups = new Map<string, ReportCardObservationRow[]>();
  for (const a of assessments) {
    if (a.kind !== 'MONTESSORI_OBSERVATION') continue;
    const area = a.area?.trim() || 'General';
    const list = groups.get(area) ?? [];
    list.push({
      milestone: a.milestone?.trim() || '—',
      notes: a.notes,
      assessedAt: a.assessedAt.toISOString(),
      assessedByName: a.assessedBy?.name ?? null,
    });
    groups.set(area, list);
  }
  const observations: ReportCardObservationGroup[] = Array.from(
    groups.entries(),
  )
    .map(([area, rows]) => ({ area, observations: rows }))
    .sort((a, b) => a.area.localeCompare(b.area));

  // ── Attendance — 30-day window ending today ──────────────────────────────
  const today = startOfDay(new Date());
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 29);

  const attendanceRows = await db.attendance.findMany({
    where: { studentId, date: { gte: windowStart, lte: today } },
    select: { status: true },
  });
  const att = {
    present: 0,
    late: 0,
    absent: 0,
    sick: 0,
    excused: 0,
  };
  for (const row of attendanceRows) {
    if (row.status === 'PRESENT') att.present++;
    else if (row.status === 'LATE') att.late++;
    else if (row.status === 'ABSENT') att.absent++;
    else if (row.status === 'SICK') att.sick++;
    else if (row.status === 'EXCUSED') att.excused++;
  }
  const totalMarked =
    att.present + att.late + att.absent + att.sick + att.excused;
  const attendancePct =
    totalMarked > 0
      ? Math.round(((att.present + att.late) / totalMarked) * 100)
      : 0;

  // ── Remarks — latest assessment.notes in the term ────────────────────────
  let remarksText: string | null = null;
  let remarksBy: string | null = null;
  let remarksAt: string | null = null;
  for (let i = assessments.length - 1; i >= 0; i--) {
    const a = assessments[i];
    if (a.notes && a.notes.trim()) {
      remarksText = a.notes.trim();
      remarksBy = a.assessedBy?.name ?? null;
      remarksAt = a.assessedAt.toISOString();
      break;
    }
  }

  return {
    student: {
      id: student.id,
      rollNo: student.rollNo,
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth.toISOString(),
      age: calcAge(student.dateOfBirth),
      gender: student.gender,
      photoUrl: student.photoUrl,
      classroomId: enrollment?.classroom.id ?? null,
      classroomName: enrollment?.classroom.name ?? null,
      programKind,
      homeroomTeacherName:
        enrollment?.classroom.homeroomTeacher?.user?.name ?? null,
    },
    term,
    isMontessori,
    primary: {
      rows: subjectRows,
      totalScore,
      totalMax,
      percentage,
      overallGrade,
    },
    observations,
    attendance: {
      windowLabel: 'Last 30 days',
      attendancePct,
      present: att.present,
      late: att.late,
      absent: att.absent,
      sick: att.sick,
      excused: att.excused,
      totalMarked,
    },
    remarks: {
      text: remarksText,
      by: remarksBy,
      at: remarksAt,
    },
    issuedAt: new Date().toISOString(),
  };
}
