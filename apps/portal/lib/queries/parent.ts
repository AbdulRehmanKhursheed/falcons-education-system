/**
 * Parent portal queries — every read used by the `/parent/*` route group.
 *
 * Auth rule: every accessor takes a `userId` (the logged-in PARENT) and
 * scopes results through the User → Guardian → StudentGuardian → Student
 * chain. The `assertOwnsStudent` helper throws `notFound()` when a parent
 * tries to reach a child they aren't linked to — this is the single point
 * of enforcement for URL-fuzzing protection.
 *
 * All values are converted to plain JSON-safe shapes (no Prisma Decimal /
 * Date) before being returned, so they can be passed into Client Components
 * unchanged.
 */

import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { ProgramKind } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────

export type ParentChildCard = {
  id: string;
  rollNo: string;
  fullName: string;
  firstName: string;
  photoUrl: string | null;
  classroomId: string | null;
  classroomName: string | null;
  programKind: ProgramKind | null;
  attendancePct: number; // last 30 days, 0–100
  outstandingDues: number;
  weeklyHomework: number;
};

export type ParentChildHeader = {
  id: string;
  rollNo: string;
  fullName: string;
  firstName: string;
  photoUrl: string | null;
  classroomId: string | null;
  classroomName: string | null;
  programKind: ProgramKind | null;
};

export type ParentNotificationRow = {
  id: string;
  kind: 'ADMISSION' | 'FEE' | 'ATTENDANCE' | 'ASSESSMENT' | 'ANNOUNCEMENT' | 'SYSTEM';
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type ParentAnnouncementRow = {
  id: string;
  title: string;
  body: string;
  audience: 'ALL' | 'STAFF_ONLY' | 'PARENTS_ONLY' | 'CLASSROOM' | 'CUSTOM';
  classroomName: string | null;
  pinned: boolean;
  publishAt: string;
  postedByName: string | null;
};

export type ChildOverview = {
  child: ParentChildHeader;
  attendancePct: number;
  attendancePctPrev: number;
  totalMarkedLast30: number;
  absentLast30: number;
  outstandingDues: number;
  latestInvoice: {
    id: string;
    invoiceNo: string;
    monthYear: string;
    status: string;
    total: number;
    amountPaid: number;
    dueDate: string;
  } | null;
  upcomingHomework: Array<{
    id: string;
    subject: string;
    title: string;
    dueDate: string;
  }>;
  latestAssessment: {
    id: string;
    kind: string;
    summary: string;
    detail: string | null;
    assessedAt: string;
  } | null;
};

export type ChildAttendanceDay = {
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'SICK' | 'EXCUSED' | null;
  remark: string | null;
};

export type ChildAttendance = {
  windowDays: number;
  daily: ChildAttendanceDay[];
  totals: {
    present: number;
    absent: number;
    late: number;
    sick: number;
    excused: number;
    marked: number;
  };
  attendancePct: number;
  attendancePctPrev: number;
  absences: Array<{
    date: string;
    status: 'ABSENT' | 'SICK' | 'EXCUSED';
    remark: string | null;
  }>;
};

export type ChildInvoiceRow = {
  id: string;
  invoiceNo: string;
  monthYear: string;
  status: string;
  total: number;
  amountPaid: number;
  due: number;
  dueDate: string;
  issuedAt: string;
};

export type ChildInvoiceData = {
  outstandingTotal: number;
  invoices: ChildInvoiceRow[];
};

export type ChildAssessment = {
  id: string;
  kind: 'MONTESSORI_OBSERVATION' | 'PRIMARY_GRADE' | 'PROGRESS_NOTE';
  term: string | null;
  subject: string | null;
  area: string | null;
  milestone: string | null;
  notes: string | null;
  score: number | null;
  scoreMax: number | null;
  grade: string | null;
  assessedAt: string;
  assessedByName: string | null;
};

export type ChildAssessmentsView =
  | {
      style: 'montessori';
      observations: ChildAssessment[];
    }
  | {
      style: 'primary';
      groups: Array<{
        term: string;
        rows: ChildAssessment[];
      }>;
    };

export type ChildHomeworkRow = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  dueDate: string;
  postedAt: string;
  attachmentUrl: string | null;
  postedByName: string | null;
};

export type ChildTimetableRow = {
  id: string;
  dayOfWeek: number; // 1 = Mon … 6 = Sat
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string | null;
  subjectName: string | null;
  teacherName: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toISODateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const earlyYears = new Set(['NURSERY', 'MONTESSORI', 'KINDERGARTEN']);

function isEarlyYears(kind: ProgramKind | null | undefined): boolean {
  return !!kind && earlyYears.has(kind);
}

// ── Children list / ownership check ───────────────────────────────────────

/**
 * Every Student linked (via Guardian → StudentGuardian) to the given user.
 * Returns the lightweight header shape needed by the sidebar & dashboard.
 */
export async function getParentChildren(
  userId: string,
): Promise<ParentChildHeader[]> {
  const guardian = await db.guardian.findUnique({
    where: { userId },
    select: {
      id: true,
      students: {
        select: {
          student: {
            select: {
              id: true,
              rollNo: true,
              firstName: true,
              fullName: true,
              photoUrl: true,
              deletedAt: true,
              enrollments: {
                where: { withdrawnAt: null },
                orderBy: { enrolledAt: 'desc' },
                take: 1,
                select: {
                  classroom: {
                    select: { id: true, name: true, programKind: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!guardian) return [];

  return guardian.students
    .map((sg) => sg.student)
    .filter((s) => s.deletedAt === null)
    .map((s) => {
      const enr = s.enrollments[0];
      return {
        id: s.id,
        rollNo: s.rollNo,
        fullName: s.fullName,
        firstName: s.firstName,
        photoUrl: s.photoUrl,
        classroomId: enr?.classroom.id ?? null,
        classroomName: enr?.classroom.name ?? null,
        programKind: (enr?.classroom.programKind as ProgramKind) ?? null,
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/**
 * Throws Next's notFound() if the given parent user is NOT linked to the
 * requested studentId. The intent is to render a 404 rather than reveal
 * the existence of the student.
 */
export async function assertOwnsStudent(
  userId: string,
  studentId: string,
): Promise<void> {
  const link = await db.studentGuardian.findFirst({
    where: {
      studentId,
      guardian: { userId },
      student: { deletedAt: null },
    },
    select: { studentId: true },
  });
  if (!link) notFound();
}

/**
 * Header info for one child — used at the top of every per-child sub-page.
 * Assumes the caller has already asserted ownership.
 */
export async function getChildHeader(
  studentId: string,
): Promise<ParentChildHeader | null> {
  const student = await db.student.findFirst({
    where: { id: studentId, deletedAt: null },
    select: {
      id: true,
      rollNo: true,
      firstName: true,
      fullName: true,
      photoUrl: true,
      enrollments: {
        where: { withdrawnAt: null },
        orderBy: { enrolledAt: 'desc' },
        take: 1,
        select: {
          classroom: { select: { id: true, name: true, programKind: true } },
        },
      },
    },
  });
  if (!student) return null;
  const enr = student.enrollments[0];
  return {
    id: student.id,
    rollNo: student.rollNo,
    firstName: student.firstName,
    fullName: student.fullName,
    photoUrl: student.photoUrl,
    classroomId: enr?.classroom.id ?? null,
    classroomName: enr?.classroom.name ?? null,
    programKind: (enr?.classroom.programKind as ProgramKind) ?? null,
  };
}

// ── Dashboard cards ───────────────────────────────────────────────────────

/**
 * Same data set as getParentChildren plus the at-a-glance counters that
 * render on each dashboard card (attendance %, outstanding dues, weekly
 * homework count). One round-trip per stat type, kept lean.
 */
export async function getParentChildCards(
  userId: string,
): Promise<ParentChildCard[]> {
  const children = await getParentChildren(userId);
  if (children.length === 0) return [];

  const studentIds = children.map((c) => c.id);
  const classroomIds = Array.from(
    new Set(children.map((c) => c.classroomId).filter((id): id is string => !!id)),
  );

  const today = startOfDay(new Date());
  const thirty = new Date(today);
  thirty.setDate(thirty.getDate() - 29);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [attendanceRows, openInvoices, homeworkCounts] = await Promise.all([
    db.attendance.findMany({
      where: { studentId: { in: studentIds }, date: { gte: thirty } },
      select: { studentId: true, status: true },
    }),
    db.invoice.findMany({
      where: {
        studentId: { in: studentIds },
        status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
      select: { studentId: true, total: true, amountPaid: true },
    }),
    classroomIds.length > 0
      ? db.homework.groupBy({
          by: ['classroomId'],
          where: {
            classroomId: { in: classroomIds },
            dueDate: { gte: weekStart, lte: weekEnd },
          },
          _count: { _all: true },
        })
      : Promise.resolve([] as Array<{ classroomId: string; _count: { _all: number } }>),
  ]);

  const attendanceByStudent = new Map<
    string,
    { marked: number; attended: number }
  >();
  for (const a of attendanceRows) {
    const entry = attendanceByStudent.get(a.studentId) ?? { marked: 0, attended: 0 };
    entry.marked++;
    if (a.status === 'PRESENT' || a.status === 'LATE') entry.attended++;
    attendanceByStudent.set(a.studentId, entry);
  }

  const duesByStudent = new Map<string, number>();
  for (const inv of openInvoices) {
    const open = Number(inv.total) - Number(inv.amountPaid);
    duesByStudent.set(inv.studentId, (duesByStudent.get(inv.studentId) ?? 0) + open);
  }

  const homeworkByClassroom = new Map<string, number>();
  for (const row of homeworkCounts) {
    homeworkByClassroom.set(row.classroomId, row._count._all);
  }

  return children.map((c) => {
    const att = attendanceByStudent.get(c.id);
    const pct =
      att && att.marked > 0 ? Math.round((att.attended / att.marked) * 100) : 0;
    return {
      ...c,
      attendancePct: pct,
      outstandingDues: duesByStudent.get(c.id) ?? 0,
      weeklyHomework: c.classroomId
        ? homeworkByClassroom.get(c.classroomId) ?? 0
        : 0,
    };
  });
}

// ── Per-child overview hub ────────────────────────────────────────────────

export async function getChildOverview(
  studentId: string,
): Promise<ChildOverview | null> {
  const header = await getChildHeader(studentId);
  if (!header) return null;

  const today = startOfDay(new Date());
  const thirty = new Date(today);
  thirty.setDate(thirty.getDate() - 29);
  const sixty = new Date(today);
  sixty.setDate(sixty.getDate() - 59);

  const [attendanceRows, latestInvoice, openInvoices, upcomingHw, latestAssessment] =
    await Promise.all([
      db.attendance.findMany({
        where: { studentId, date: { gte: sixty } },
        select: { date: true, status: true },
      }),
      db.invoice.findFirst({
        where: { studentId },
        orderBy: { issuedAt: 'desc' },
        select: {
          id: true,
          invoiceNo: true,
          monthYear: true,
          status: true,
          total: true,
          amountPaid: true,
          dueDate: true,
        },
      }),
      db.invoice.findMany({
        where: {
          studentId,
          status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        select: { total: true, amountPaid: true },
      }),
      header.classroomId
        ? db.homework.findMany({
            where: {
              classroomId: header.classroomId,
              dueDate: { gte: today },
            },
            orderBy: { dueDate: 'asc' },
            take: 3,
            select: { id: true, subject: true, title: true, dueDate: true },
          })
        : Promise.resolve([] as Array<{ id: string; subject: string; title: string; dueDate: Date }>),
      db.assessment.findFirst({
        where: { studentId },
        orderBy: { assessedAt: 'desc' },
        select: {
          id: true,
          kind: true,
          term: true,
          subject: true,
          area: true,
          milestone: true,
          notes: true,
          score: true,
          scoreMax: true,
          grade: true,
          assessedAt: true,
        },
      }),
    ]);

  // Last-30 and prior-30 attendance percentages.
  let recentMarked = 0;
  let recentAttended = 0;
  let prevMarked = 0;
  let prevAttended = 0;
  let absentCount = 0;
  for (const a of attendanceRows) {
    const d = startOfDay(a.date);
    if (d >= thirty) {
      recentMarked++;
      if (a.status === 'PRESENT' || a.status === 'LATE') recentAttended++;
      if (a.status === 'ABSENT') absentCount++;
    } else {
      prevMarked++;
      if (a.status === 'PRESENT' || a.status === 'LATE') prevAttended++;
    }
  }
  const attendancePct =
    recentMarked > 0 ? Math.round((recentAttended / recentMarked) * 100) : 0;
  const attendancePctPrev =
    prevMarked > 0 ? Math.round((prevAttended / prevMarked) * 100) : 0;

  const outstandingDues = openInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
    0,
  );

  let assessmentSummary: ChildOverview['latestAssessment'] = null;
  if (latestAssessment) {
    const summary =
      latestAssessment.kind === 'PRIMARY_GRADE'
        ? `${latestAssessment.subject ?? 'Subject'}${latestAssessment.term ? ` · ${latestAssessment.term}` : ''}`
        : latestAssessment.area || latestAssessment.term || 'Observation';
    let detail: string | null = null;
    if (latestAssessment.kind === 'PRIMARY_GRADE' && latestAssessment.score !== null && latestAssessment.scoreMax !== null) {
      detail = `${Number(latestAssessment.score)}/${Number(latestAssessment.scoreMax)}${latestAssessment.grade ? ` · ${latestAssessment.grade}` : ''}`;
    } else {
      detail = latestAssessment.milestone ?? latestAssessment.notes ?? null;
    }
    assessmentSummary = {
      id: latestAssessment.id,
      kind: latestAssessment.kind,
      summary,
      detail,
      assessedAt: latestAssessment.assessedAt.toISOString(),
    };
  }

  return {
    child: header,
    attendancePct,
    attendancePctPrev,
    totalMarkedLast30: recentMarked,
    absentLast30: absentCount,
    outstandingDues,
    latestInvoice: latestInvoice
      ? {
          id: latestInvoice.id,
          invoiceNo: latestInvoice.invoiceNo,
          monthYear: latestInvoice.monthYear,
          status: latestInvoice.status,
          total: Number(latestInvoice.total),
          amountPaid: Number(latestInvoice.amountPaid),
          dueDate: latestInvoice.dueDate.toISOString(),
        }
      : null,
    upcomingHomework: upcomingHw.map((h) => ({
      id: h.id,
      subject: h.subject,
      title: h.title,
      dueDate: h.dueDate.toISOString(),
    })),
    latestAssessment: assessmentSummary,
  };
}

// ── Per-child attendance page ─────────────────────────────────────────────

export async function getChildAttendance(
  studentId: string,
): Promise<ChildAttendance> {
  const today = startOfDay(new Date());
  const thirty = new Date(today);
  thirty.setDate(thirty.getDate() - 29);
  const sixty = new Date(today);
  sixty.setDate(sixty.getDate() - 59);

  const rows = await db.attendance.findMany({
    where: { studentId, date: { gte: sixty } },
    orderBy: { date: 'asc' },
    select: { date: true, status: true, remark: true },
  });

  const byDate = new Map<string, { status: ChildAttendanceDay['status']; remark: string | null }>();
  for (const r of rows) {
    byDate.set(toISODateKey(startOfDay(r.date)), { status: r.status, remark: r.remark });
  }

  // Build the rolling 30-day timeline ending today.
  const days: ChildAttendanceDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toISODateKey(d);
    const entry = byDate.get(key);
    days.push({ date: key, status: entry?.status ?? null, remark: entry?.remark ?? null });
  }

  const totals = { present: 0, absent: 0, late: 0, sick: 0, excused: 0, marked: 0 };
  for (const d of days) {
    if (d.status === 'PRESENT') totals.present++;
    else if (d.status === 'ABSENT') totals.absent++;
    else if (d.status === 'LATE') totals.late++;
    else if (d.status === 'SICK') totals.sick++;
    else if (d.status === 'EXCUSED') totals.excused++;
  }
  totals.marked = totals.present + totals.absent + totals.late + totals.sick + totals.excused;
  const attendancePct =
    totals.marked > 0
      ? Math.round(((totals.present + totals.late) / totals.marked) * 100)
      : 0;

  // Prior 30 days
  let prevMarked = 0;
  let prevAttended = 0;
  for (const r of rows) {
    const d = startOfDay(r.date);
    if (d < thirty) {
      prevMarked++;
      if (r.status === 'PRESENT' || r.status === 'LATE') prevAttended++;
    }
  }
  const attendancePctPrev =
    prevMarked > 0 ? Math.round((prevAttended / prevMarked) * 100) : 0;

  const absences = days
    .filter((d) => d.status === 'ABSENT' || d.status === 'SICK' || d.status === 'EXCUSED')
    .map((d) => ({
      date: d.date,
      status: d.status as 'ABSENT' | 'SICK' | 'EXCUSED',
      remark: d.remark,
    }));

  return {
    windowDays: 30,
    daily: days,
    totals,
    attendancePct,
    attendancePctPrev,
    absences,
  };
}

// ── Per-child fees page ───────────────────────────────────────────────────

export async function getChildInvoices(
  studentId: string,
): Promise<ChildInvoiceData> {
  const rows = await db.invoice.findMany({
    where: { studentId },
    orderBy: [{ issuedAt: 'desc' }],
    select: {
      id: true,
      invoiceNo: true,
      monthYear: true,
      status: true,
      total: true,
      amountPaid: true,
      dueDate: true,
      issuedAt: true,
    },
  });

  const invoices: ChildInvoiceRow[] = rows.map((r) => ({
    id: r.id,
    invoiceNo: r.invoiceNo,
    monthYear: r.monthYear,
    status: r.status,
    total: Number(r.total),
    amountPaid: Number(r.amountPaid),
    due: Math.max(0, Number(r.total) - Number(r.amountPaid)),
    dueDate: r.dueDate.toISOString(),
    issuedAt: r.issuedAt.toISOString(),
  }));

  const outstandingTotal = invoices
    .filter((i) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status))
    .reduce((s, i) => s + i.due, 0);

  return { outstandingTotal, invoices };
}

// ── Per-child grades / observations ───────────────────────────────────────

export async function getChildAssessments(
  studentId: string,
): Promise<ChildAssessmentsView> {
  const header = await getChildHeader(studentId);
  const useMontessori = isEarlyYears(header?.programKind);

  const rows = await db.assessment.findMany({
    where: { studentId },
    orderBy: { assessedAt: 'desc' },
    select: {
      id: true,
      kind: true,
      term: true,
      subject: true,
      area: true,
      milestone: true,
      notes: true,
      score: true,
      scoreMax: true,
      grade: true,
      assessedAt: true,
      assessedBy: { select: { name: true } },
    },
  });

  const mapped: ChildAssessment[] = rows.map((a) => ({
    id: a.id,
    kind: a.kind,
    term: a.term,
    subject: a.subject,
    area: a.area,
    milestone: a.milestone,
    notes: a.notes,
    score: a.score !== null ? Number(a.score) : null,
    scoreMax: a.scoreMax !== null ? Number(a.scoreMax) : null,
    grade: a.grade,
    assessedAt: a.assessedAt.toISOString(),
    assessedByName: a.assessedBy?.name ?? null,
  }));

  if (useMontessori) {
    return { style: 'montessori', observations: mapped };
  }

  // Group primary grades by term.
  const groupsMap = new Map<string, ChildAssessment[]>();
  for (const a of mapped) {
    const term = a.term ?? 'Other';
    if (!groupsMap.has(term)) groupsMap.set(term, []);
    groupsMap.get(term)!.push(a);
  }
  const groups = Array.from(groupsMap.entries()).map(([term, rows]) => ({
    term,
    rows,
  }));
  // Newest term first based on the latest assessedAt within each group.
  groups.sort((a, b) => {
    const aMax = Math.max(...a.rows.map((r) => new Date(r.assessedAt).getTime()));
    const bMax = Math.max(...b.rows.map((r) => new Date(r.assessedAt).getTime()));
    return bMax - aMax;
  });
  return { style: 'primary', groups };
}

// ── Per-child homework ────────────────────────────────────────────────────

export async function getChildHomework(
  studentId: string,
): Promise<ChildHomeworkRow[]> {
  const header = await getChildHeader(studentId);
  if (!header?.classroomId) return [];

  const rows = await db.homework.findMany({
    where: { classroomId: header.classroomId },
    orderBy: [{ dueDate: 'desc' }, { postedAt: 'desc' }],
    select: {
      id: true,
      subject: true,
      title: true,
      description: true,
      dueDate: true,
      attachmentUrl: true,
      postedAt: true,
      postedBy: { select: { name: true } },
    },
  });

  return rows.map((h) => ({
    id: h.id,
    subject: h.subject,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate.toISOString(),
    postedAt: h.postedAt.toISOString(),
    attachmentUrl: h.attachmentUrl,
    postedByName: h.postedBy?.name ?? null,
  }));
}

// ── Per-child timetable ───────────────────────────────────────────────────

export async function getChildTimetable(
  studentId: string,
): Promise<ChildTimetableRow[]> {
  const header = await getChildHeader(studentId);
  if (!header?.classroomId) return [];

  const rows = await db.timetableEntry.findMany({
    where: { classroomId: header.classroomId },
    orderBy: [{ dayOfWeek: 'asc' }, { period: { number: 'asc' } }],
    select: {
      id: true,
      dayOfWeek: true,
      period: {
        select: {
          number: true,
          startTime: true,
          endTime: true,
          label: true,
          isBreak: true,
        },
      },
      subject: { select: { name: true } },
      teacher: { select: { user: { select: { name: true } } } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    dayOfWeek: r.dayOfWeek,
    periodNumber: r.period.number,
    startTime: r.period.startTime,
    endTime: r.period.endTime,
    isBreak: r.period.isBreak,
    label: r.period.label,
    subjectName: r.subject?.name ?? null,
    teacherName: r.teacher?.user?.name ?? null,
  }));
}

// ── Notifications + announcements ─────────────────────────────────────────

export async function getParentNotifications(
  userId: string,
  take = 8,
): Promise<ParentNotificationRow[]> {
  const rows = await db.notification.findMany({
    where: { userId },
    orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
    take,
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      link: true,
      read: true,
      createdAt: true,
    },
  });
  return rows.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, read: false } });
}

/**
 * Every announcement visible to this parent: audience ALL or PARENTS_ONLY,
 * plus CLASSROOM-targeted to any of their kids' classrooms. Only active
 * (not yet expired). Pinned first, then newest.
 */
export async function getParentAnnouncements(
  userId: string,
  take?: number,
): Promise<ParentAnnouncementRow[]> {
  const children = await getParentChildren(userId);
  const classroomIds = Array.from(
    new Set(children.map((c) => c.classroomId).filter((id): id is string => !!id)),
  );

  const now = new Date();
  const where = {
    AND: [
      { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      { publishAt: { lte: now } },
      {
        OR: [
          { audience: 'ALL' as const },
          { audience: 'PARENTS_ONLY' as const },
          ...(classroomIds.length > 0
            ? [
                {
                  audience: 'CLASSROOM' as const,
                  classroomId: { in: classroomIds },
                },
              ]
            : []),
        ],
      },
    ],
  };

  const rows = await db.announcement.findMany({
    where,
    orderBy: [{ pinned: 'desc' }, { publishAt: 'desc' }],
    ...(take ? { take } : {}),
    select: {
      id: true,
      title: true,
      body: true,
      audience: true,
      pinned: true,
      publishAt: true,
      classroom: { select: { name: true } },
      postedBy: { select: { name: true } },
    },
  });

  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    audience: a.audience,
    classroomName: a.classroom?.name ?? null,
    pinned: a.pinned,
    publishAt: a.publishAt.toISOString(),
    postedByName: a.postedBy?.name ?? null,
  }));
}
