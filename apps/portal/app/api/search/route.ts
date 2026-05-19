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
 */
export async function GET(req: NextRequest) {
  await requireSession();

  const raw = req.nextUrl.searchParams.get('q') ?? '';
  const q = raw.trim();

  if (q.length < 2) {
    return NextResponse.json(EMPTY, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const [students, invoices, applications] = await Promise.all([
    db.student.findMany({
      where: {
        deletedAt: null,
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
    }),
    db.invoice.findMany({
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
    }),
    db.application.findMany({
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
    }),
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
