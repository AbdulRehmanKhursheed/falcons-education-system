'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { getStudents, type StudentRow } from '@/lib/queries/students';

// ── Search (existing) ─────────────────────────────────────────────────────

export async function searchStudents(
  query: string,
  classroom: string,
  page = 1,
): Promise<{ rows: StudentRow[]; total: number; page: number; pageSize: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const pageSize = 50;
  const skip = Math.max(0, (page - 1) * pageSize);

  const { rows, total } = await getStudents({
    query,
    classroom,
    take: pageSize,
    skip,
  });

  return { rows, total, page, pageSize };
}

// ── Bulk actions ──────────────────────────────────────────────────────────

export type BulkResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

function dedupe(ids: string[]): string[] {
  return Array.from(new Set(ids.map((s) => s.trim()).filter(Boolean)));
}

/**
 * Soft-archive a batch of students. Sets deletedAt + status=INACTIVE and
 * withdraws their open enrollments. Writes a single audit log entry summarising
 * the bulk action plus a per-student diff list. Idempotent: already-archived
 * students are skipped.
 */
export async function bulkArchiveStudents(ids: string[]): Promise<BulkResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const uniqueIds = dedupe(ids);
  if (uniqueIds.length === 0) {
    return { ok: false, error: 'No students selected.' };
  }

  // Resolve which IDs are valid + not yet archived. We only touch those.
  const targets = await db.student.findMany({
    where: { id: { in: uniqueIds }, deletedAt: null },
    select: { id: true, fullName: true, rollNo: true },
  });

  if (targets.length === 0) {
    return { ok: false, error: 'Selected students are already archived or missing.' };
  }

  const targetIds = targets.map((t) => t.id);
  const now = new Date();

  try {
    await db.$transaction([
      db.student.updateMany({
        where: { id: { in: targetIds } },
        data: { deletedAt: now, status: 'INACTIVE' },
      }),
      db.enrollment.updateMany({
        where: { studentId: { in: targetIds }, withdrawnAt: null },
        data: { withdrawnAt: now },
      }),
      db.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'student.bulk_archive',
          entityType: 'Student',
          entityId: targetIds[0],
          diff: {
            count: targetIds.length,
            studentIds: targetIds,
            students: targets.map((t) => ({ id: t.id, rollNo: t.rollNo, fullName: t.fullName })),
          },
        },
      }),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to archive students';
    return { ok: false, error: msg };
  }

  revalidatePath('/students');
  revalidatePath('/dashboard');
  return { ok: true, count: targetIds.length };
}

/**
 * Move a batch of students to a new classroom. Closes any open enrollments and
 * creates a new one for each student. If an old (withdrawn) enrollment for the
 * same classroom already exists, we re-open it via `updateMany` instead of
 * creating a duplicate (Enrollment has @@unique([studentId, classroomId])).
 */
export async function bulkMoveClassroom(
  ids: string[],
  classroomId: string,
): Promise<BulkResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const uniqueIds = dedupe(ids);
  if (uniqueIds.length === 0) {
    return { ok: false, error: 'No students selected.' };
  }
  if (!classroomId) {
    return { ok: false, error: 'Pick a destination classroom.' };
  }

  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true, name: true },
  });
  if (!classroom) return { ok: false, error: 'Classroom not found.' };

  const targets = await db.student.findMany({
    where: { id: { in: uniqueIds }, deletedAt: null },
    select: { id: true, rollNo: true, fullName: true },
  });

  if (targets.length === 0) {
    return { ok: false, error: 'No valid students in the selection.' };
  }

  const targetIds = targets.map((t) => t.id);
  const now = new Date();

  try {
    await db.$transaction(async (tx) => {
      // 1. Close any other open enrollments (different classroom).
      await tx.enrollment.updateMany({
        where: {
          studentId: { in: targetIds },
          withdrawnAt: null,
          NOT: { classroomId },
        },
        data: { withdrawnAt: now },
      });

      // 2. Per student: upsert the destination-classroom enrollment so the
      //    unique(studentId, classroomId) constraint doesn't bite us when the
      //    pairing was previously withdrawn.
      for (const id of targetIds) {
        await tx.enrollment.upsert({
          where: { studentId_classroomId: { studentId: id, classroomId } },
          create: { studentId: id, classroomId, enrolledAt: now },
          update: { withdrawnAt: null, enrolledAt: now },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'student.bulk_move_classroom',
          entityType: 'Student',
          entityId: targetIds[0],
          diff: {
            count: targetIds.length,
            classroomId,
            classroomName: classroom.name,
            studentIds: targetIds,
          },
        },
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to move students';
    return { ok: false, error: msg };
  }

  revalidatePath('/students');
  revalidatePath('/attendance');
  revalidatePath('/dashboard');
  return { ok: true, count: targetIds.length };
}

// ── CSV export ────────────────────────────────────────────────────────────

export type BulkCsvResult =
  | { ok: true; csv: string; count: number }
  | { ok: false; error: string };

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build a CSV string for the selected students. Returned as a string so the
 * client component can stream it into a Blob and trigger a download. Server-
 * side because it goes deeper than the in-memory table rows (guardian email,
 * CNIC, blood group, etc.).
 */
export async function bulkExportCsv(ids: string[]): Promise<BulkCsvResult> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const uniqueIds = dedupe(ids);
  if (uniqueIds.length === 0) {
    return { ok: false, error: 'No students selected.' };
  }

  const students = await db.student.findMany({
    where: { id: { in: uniqueIds }, deletedAt: null },
    orderBy: { fullName: 'asc' },
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
      admissionDate: true,
      enrollments: {
        where: { withdrawnAt: null },
        take: 1,
        select: {
          classroom: { select: { name: true, programKind: true } },
        },
      },
      guardians: {
        where: { isPrimary: true },
        take: 1,
        select: {
          guardian: {
            select: {
              fullName: true,
              relation: true,
              phone: true,
              whatsapp: true,
              email: true,
              cnic: true,
              occupation: true,
            },
          },
        },
      },
      invoices: {
        where: { status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
        select: { total: true, amountPaid: true },
      },
    },
  });

  if (students.length === 0) {
    return { ok: false, error: 'No matching active students.' };
  }

  const header = [
    'Roll No',
    'First Name',
    'Last Name',
    'Full Name',
    'Date of Birth',
    'Gender',
    'Blood Group',
    'Status',
    'Admission Date',
    'Classroom',
    'Program',
    'Guardian Name',
    'Guardian Relation',
    'Guardian Phone',
    'Guardian WhatsApp',
    'Guardian Email',
    'Guardian CNIC',
    'Guardian Occupation',
    'Outstanding Dues (PKR)',
  ];

  const lines: string[] = [header.map(csvEscape).join(',')];

  for (const s of students) {
    const enrollment = s.enrollments[0];
    const guardian = s.guardians[0]?.guardian;
    const dues = s.invoices.reduce(
      (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
      0,
    );
    const row = [
      s.rollNo,
      s.firstName,
      s.lastName,
      s.fullName,
      s.dateOfBirth.toISOString().slice(0, 10),
      s.gender ?? '',
      s.bloodGroup ?? '',
      s.status,
      s.admissionDate ? s.admissionDate.toISOString().slice(0, 10) : '',
      enrollment?.classroom.name ?? '',
      enrollment?.classroom.programKind ?? '',
      guardian?.fullName ?? '',
      guardian?.relation ?? '',
      guardian?.phone ?? '',
      guardian?.whatsapp ?? '',
      guardian?.email ?? '',
      guardian?.cnic ?? '',
      guardian?.occupation ?? '',
      dues,
    ];
    lines.push(row.map(csvEscape).join(','));
  }

  return { ok: true, csv: lines.join('\n'), count: students.length };
}

// ── Classrooms for the move dropdown ──────────────────────────────────────

export type BulkClassroomOption = {
  id: string;
  name: string;
  programKind: string;
};

export async function getClassroomOptionsForBulk(): Promise<BulkClassroomOption[]> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  const rows = await db.classroom.findMany({
    where: currentYear ? { academicYearId: currentYear.id } : {},
    orderBy: [{ programKind: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, programKind: true },
  });
  return rows;
}
