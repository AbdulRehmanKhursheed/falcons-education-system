import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type StudentHit = {
  id: string;
  name: string;
  rollNo: string;
  classroom: string;
};

type InvoiceHit = {
  id: string;
  invoiceNo: string;
  total: number;
  studentName: string;
  status: string;
};

type ApplicationHit = {
  id: string;
  applicantName: string;
  stage: string;
  programInterest: string;
};

type SearchResponse = {
  students: StudentHit[];
  invoices: InvoiceHit[];
  applications: ApplicationHit[];
};

const EMPTY: SearchResponse = { students: [], invoices: [], applications: [] };

/**
 * Cross-entity search used by the Cmd-K command palette.
 *
 * - Requires a session (any signed-in user).
 * - Returns up to 5 hits per category, 20 total.
 * - Searches `fullName` / `rollNo` / primary guardian name for students,
 *   `invoiceNo` + student `fullName` / `rollNo` for invoices, and
 *   `applicantName` / `parentPhone` for applications.
 * - Short-circuits when the trimmed query is < 2 chars.
 *
 * Role gating (P0-01): the search payload is scoped by role to prevent
 * information leaks via the global palette —
 *   - PARENT → no hits at all (return EMPTY).
 *   - ACCOUNTANT → invoices only; students/applications empty.
 *   - TEACHER → only students enrolled in classrooms where the requester is
 *               `homeroomTeacher`; no invoices or applications.
 *   - SUPER_ADMIN / SCHOOL_ADMIN → full payload (current behaviour).
 */
export async function GET(req: NextRequest) {
  const session = await requireSession();
  const role = session.user.role as
    | 'SUPER_ADMIN'
    | 'SCHOOL_ADMIN'
    | 'TEACHER'
    | 'PARENT'
    | 'ACCOUNTANT';

  const raw = req.nextUrl.searchParams.get('q') ?? '';
  const q = raw.trim();

  if (q.length < 2) {
    return NextResponse.json(EMPTY, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // PARENT: never expose any cross-entity hits.
  if (role === 'PARENT') {
    return NextResponse.json(EMPTY, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const wantStudents =
    role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'TEACHER';
  const wantInvoices =
    role === 'SUPER_ADMIN' ||
    role === 'SCHOOL_ADMIN' ||
    role === 'ACCOUNTANT';
  const wantApplications =
    role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN';

  // TEACHER: restrict students to those in their homeroom classrooms.
  let teacherClassroomIds: string[] | null = null;
  if (role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
      select: { homerooms: { select: { id: true } } },
    });
    teacherClassroomIds = (teacher?.homerooms ?? []).map((c) => c.id);
    // No homerooms → no student visibility at all.
    if (teacherClassroomIds.length === 0) {
      return NextResponse.json(EMPTY, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
  }

  const [students, invoices, applications] = await Promise.all([
    wantStudents
      ? db.student.findMany({
          where: {
            deletedAt: null,
            ...(teacherClassroomIds
              ? {
                  enrollments: {
                    some: {
                      withdrawnAt: null,
                      classroomId: { in: teacherClassroomIds },
                    },
                  },
                }
              : {}),
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
          },
          take: 5,
          orderBy: { fullName: 'asc' },
          select: {
            id: true,
            fullName: true,
            rollNo: true,
            enrollments: {
              where: { withdrawnAt: null },
              take: 1,
              select: { classroom: { select: { name: true } } },
            },
          },
        })
      : Promise.resolve([] as Array<{
          id: string;
          fullName: string;
          rollNo: string;
          enrollments: { classroom: { name: string } }[];
        }>),
    wantInvoices
      ? db.invoice.findMany({
          where: {
            OR: [
              { invoiceNo: { contains: q, mode: 'insensitive' } },
              { student: { fullName: { contains: q, mode: 'insensitive' } } },
              { student: { rollNo: { contains: q, mode: 'insensitive' } } },
            ],
          },
          take: 5,
          orderBy: [{ issuedAt: 'desc' }, { invoiceNo: 'desc' }],
          select: {
            id: true,
            invoiceNo: true,
            total: true,
            status: true,
            student: { select: { fullName: true } },
          },
        })
      : Promise.resolve([] as Array<{
          id: string;
          invoiceNo: string;
          total: unknown;
          status: string;
          student: { fullName: string };
        }>),
    wantApplications
      ? db.application.findMany({
          where: {
            OR: [
              { applicantName: { contains: q, mode: 'insensitive' } },
              { parentPhone: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            applicantName: true,
            stage: true,
            programInterest: true,
          },
        })
      : Promise.resolve([] as Array<{
          id: string;
          applicantName: string;
          stage: string;
          programInterest: string;
        }>),
  ]);

  const payload: SearchResponse = {
    students: students.map((s) => ({
      id: s.id,
      name: s.fullName,
      rollNo: s.rollNo,
      classroom: s.enrollments[0]?.classroom.name ?? '—',
    })),
    invoices: invoices.map((i) => ({
      id: i.id,
      invoiceNo: i.invoiceNo,
      total: Number(i.total),
      studentName: i.student.fullName,
      status: i.status,
    })),
    applications: applications.map((a) => ({
      id: a.id,
      applicantName: a.applicantName,
      stage: a.stage,
      programInterest: a.programInterest,
    })),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
