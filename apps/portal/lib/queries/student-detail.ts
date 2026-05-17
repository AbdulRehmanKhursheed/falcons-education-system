/**
 * Student detail queries — used by `/students/[id]` and its edit page.
 *
 * Returns plain, fully serialisable shapes (no Prisma Decimal/Date) so they
 * can flow from server components into client components without further
 * processing.
 */

import { db } from '@/lib/db';

export type StudentGuardianDetail = {
  guardianId: string;
  fullName: string;
  relation: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  occupation: string | null;
  cnic: string | null;
  isPrimary: boolean;
};

export type StudentEnrollmentDetail = {
  enrollmentId: string;
  classroomId: string;
  classroomName: string;
  programKind: string;
  homeroomTeacherName: string | null;
  enrolledAt: string;
};

export type StudentAttendanceDay = {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'SICK' | 'EXCUSED' | null;
};

export type StudentAttendanceSummary = {
  windowDays: number;
  totals: { present: number; absent: number; late: number; sick: number; excused: number };
  attendancePct: number;
  daily: StudentAttendanceDay[];
};

export type StudentInvoiceRow = {
  id: string;
  invoiceNo: string;
  monthYear: string;
  total: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  issuedAt: string;
};

export type StudentAssessmentRow = {
  id: string;
  kind: string;
  term: string | null;
  subject: string | null;
  area: string | null;
  milestone: string | null;
  score: number | null;
  scoreMax: number | null;
  grade: string | null;
  notes: string | null;
  assessedAt: string;
  assessedByName: string | null;
};

export type StudentDetail = {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string | null;
  bloodGroup: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'GRADUATED';
  photoUrl: string | null;
  admissionDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  guardians: StudentGuardianDetail[];
  enrollment: StudentEnrollmentDetail | null;
  attendance: StudentAttendanceSummary;
  outstandingDues: number;
  invoices: StudentInvoiceRow[];
  assessments: StudentAssessmentRow[];
};

export type AuditEntry = {
  id: string;
  action: string;
  actorName: string | null;
  diff: unknown;
  createdAt: string;
};

function calcAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getStudentDetail(id: string): Promise<StudentDetail | null> {
  const thirty = startOfDay(new Date());
  thirty.setDate(thirty.getDate() - 29); // inclusive 30-day window ending today

  const student = await db.student.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      rollNo: true,
      firstName: true,
      lastName: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
      bloodGroup: true,
      status: true,
      photoUrl: true,
      admissionDate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      guardians: {
        select: {
          isPrimary: true,
          guardian: {
            select: {
              id: true,
              fullName: true,
              relation: true,
              phone: true,
              whatsapp: true,
              email: true,
              occupation: true,
              cnic: true,
              isPrimary: true,
            },
          },
        },
      },
      enrollments: {
        where: { withdrawnAt: null },
        orderBy: { enrolledAt: 'desc' },
        take: 1,
        select: {
          id: true,
          enrolledAt: true,
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
      invoices: {
        orderBy: { issuedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          invoiceNo: true,
          monthYear: true,
          total: true,
          amountPaid: true,
          status: true,
          dueDate: true,
          issuedAt: true,
        },
      },
      assessments: {
        orderBy: { assessedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          kind: true,
          term: true,
          subject: true,
          area: true,
          milestone: true,
          score: true,
          scoreMax: true,
          grade: true,
          notes: true,
          assessedAt: true,
          assessedBy: { select: { name: true } },
        },
      },
      attendance: {
        where: { date: { gte: thirty } },
        orderBy: { date: 'asc' },
        select: { date: true, status: true },
      },
    },
  });

  if (!student) return null;

  // Outstanding dues — exclude PAID/CANCELLED.
  const openInvoices = await db.invoice.findMany({
    where: {
      studentId: id,
      status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
    },
    select: { total: true, amountPaid: true },
  });
  const outstandingDues = openInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
    0,
  );

  // Attendance window: build a 30-day timeline. Map by yyyy-mm-dd.
  const today = startOfDay(new Date());
  const daysWindow: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    daysWindow.push(d);
  }
  const attendMap = new Map<string, StudentAttendanceDay['status']>();
  for (const a of student.attendance) {
    const key = startOfDay(a.date).toISOString().slice(0, 10);
    attendMap.set(key, a.status);
  }
  const daily: StudentAttendanceDay[] = daysWindow.map((d) => {
    const key = d.toISOString().slice(0, 10);
    return { date: key, status: attendMap.get(key) ?? null };
  });

  const totals = { present: 0, absent: 0, late: 0, sick: 0, excused: 0 };
  for (const d of daily) {
    if (d.status === 'PRESENT') totals.present++;
    else if (d.status === 'ABSENT') totals.absent++;
    else if (d.status === 'LATE') totals.late++;
    else if (d.status === 'SICK') totals.sick++;
    else if (d.status === 'EXCUSED') totals.excused++;
  }
  const marked =
    totals.present + totals.absent + totals.late + totals.sick + totals.excused;
  const attendancePct =
    marked > 0 ? Math.round(((totals.present + totals.late) / marked) * 100) : 0;

  const enrollmentRow = student.enrollments[0];
  const enrollment: StudentEnrollmentDetail | null = enrollmentRow
    ? {
        enrollmentId: enrollmentRow.id,
        classroomId: enrollmentRow.classroom.id,
        classroomName: enrollmentRow.classroom.name,
        programKind: enrollmentRow.classroom.programKind,
        homeroomTeacherName:
          enrollmentRow.classroom.homeroomTeacher?.user?.name ?? null,
        enrolledAt: enrollmentRow.enrolledAt.toISOString(),
      }
    : null;

  const guardians: StudentGuardianDetail[] = student.guardians.map((sg) => ({
    guardianId: sg.guardian.id,
    fullName: sg.guardian.fullName,
    relation: sg.guardian.relation,
    phone: sg.guardian.phone,
    whatsapp: sg.guardian.whatsapp,
    email: sg.guardian.email,
    occupation: sg.guardian.occupation,
    cnic: sg.guardian.cnic,
    isPrimary: sg.isPrimary || sg.guardian.isPrimary,
  }));
  // Primary first
  guardians.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return {
    id: student.id,
    rollNo: student.rollNo,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth.toISOString(),
    age: calcAge(student.dateOfBirth),
    gender: student.gender,
    bloodGroup: student.bloodGroup,
    status: student.status,
    photoUrl: student.photoUrl,
    admissionDate: student.admissionDate?.toISOString() ?? null,
    notes: student.notes,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
    guardians,
    enrollment,
    attendance: { windowDays: 30, totals, attendancePct, daily },
    outstandingDues,
    invoices: student.invoices.map((i) => ({
      id: i.id,
      invoiceNo: i.invoiceNo,
      monthYear: i.monthYear,
      total: Number(i.total),
      amountPaid: Number(i.amountPaid),
      status: i.status,
      dueDate: i.dueDate.toISOString(),
      issuedAt: i.issuedAt.toISOString(),
    })),
    assessments: student.assessments.map((a) => ({
      id: a.id,
      kind: a.kind,
      term: a.term,
      subject: a.subject,
      area: a.area,
      milestone: a.milestone,
      score: a.score !== null ? Number(a.score) : null,
      scoreMax: a.scoreMax !== null ? Number(a.scoreMax) : null,
      grade: a.grade,
      notes: a.notes,
      assessedAt: a.assessedAt.toISOString(),
      assessedByName: a.assessedBy?.name ?? null,
    })),
  };
}

export async function getStudentActivity(id: string): Promise<AuditEntry[]> {
  const rows = await db.auditLog.findMany({
    where: { entityType: 'Student', entityId: id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      action: true,
      diff: true,
      createdAt: true,
      actor: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorName: r.actor?.name ?? null,
    diff: r.diff,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type ClassroomOption = {
  id: string;
  name: string;
  programKind: string;
};

export async function getClassroomsForEnrollment(): Promise<ClassroomOption[]> {
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  const rows = await db.classroom.findMany({
    where: currentYear ? { academicYearId: currentYear.id } : {},
    orderBy: { name: 'asc' },
    select: { id: true, name: true, programKind: true },
  });
  return rows;
}

export type GuardianSearchResult = {
  id: string;
  fullName: string;
  relation: string;
  phone: string;
  email: string | null;
};

export async function searchGuardiansByPhone(
  query: string,
): Promise<GuardianSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await db.guardian.findMany({
    where: {
      deletedAt: null,
      OR: [
        { phone: { contains: q, mode: 'insensitive' } },
        { whatsapp: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 8,
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      relation: true,
      phone: true,
      email: true,
    },
  });
  return rows;
}
