'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  updateStudentSchema,
  createStudentSchema,
  type UpdateStudentInput,
  type CreateStudentInput,
} from '@/lib/schemas/students';

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function isoToDate(s: string | undefined | null): Date | undefined {
  if (!s) return undefined;
  // YYYY-MM-DD -> midnight UTC interpretation is OK for DoB-style fields.
  return new Date(s);
}

// ── Update student ─────────────────────────────────────────────────────

export async function updateStudent(
  id: string,
  input: UpdateStudentInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = updateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const data = parsed.data;

  const existing = await db.student.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: 'Student not found' };

  const fullName = `${data.firstName} ${data.lastName}`.trim();

  await db.$transaction([
    db.student.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        status: data.status,
        admissionDate: isoToDate(data.admissionDate),
        photoUrl: data.photoUrl,
        notes: data.notes,
      },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'student.update',
        entityType: 'Student',
        entityId: id,
        diff: { ...data },
      },
    }),
  ]);

  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
  revalidatePath('/dashboard');
  return { ok: true };
}

// ── Archive student (soft delete) ─────────────────────────────────────

export async function archiveStudent(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.student.findFirst({
    where: { id },
    select: { id: true, deletedAt: true },
  });
  if (!existing) return { ok: false, error: 'Student not found' };
  if (existing.deletedAt) return { ok: true };

  await db.$transaction([
    db.student.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    }),
    // Withdraw open enrollments
    db.enrollment.updateMany({
      where: { studentId: id, withdrawnAt: null },
      data: { withdrawnAt: new Date() },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'student.archive',
        entityType: 'Student',
        entityId: id,
      },
    }),
  ]);

  revalidatePath('/students');
  revalidatePath(`/students/${id}`);
  revalidatePath('/dashboard');
  return { ok: true };
}

// ── Create student (with guardian + enrollment) ───────────────────────

/**
 * Generate the next unique roll number in the FES-YYYY-NNNN sequence.
 *
 * Reads all existing roll numbers for the current calendar year, parses their
 * numeric suffix, and returns max + 1 padded to 4 digits.
 *
 * P0-05: this must be called inside the same transaction as the create —
 * otherwise two concurrent admin clicks pick the same number and the second
 * one crashes on the unique constraint. We also parse the suffix numerically
 * to avoid the lex-sort bug at >999 rolls (`FES-2026-1000` would sort before
 * `FES-2026-999` with `orderBy: { rollNo: 'desc' }`).
 *
 * Existing legacy roll numbers (3-digit pads like `FES-2026-001`) keep working
 * because we parse on the numeric value; new ones are emitted with 4 digits.
 */
async function nextRollNo(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FES-${year}-`;
  const existing = await tx.student.findMany({
    where: { rollNo: { startsWith: prefix } },
    select: { rollNo: true },
  });
  let max = 0;
  for (const { rollNo } of existing) {
    const n = parseInt(rollNo.slice(prefix.length), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export async function createStudent(
  input: CreateStudentInput,
): Promise<ActionResult<{ studentId: string; rollNo: string }>> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { student: s, guardian: g, classroomId } = parsed.data;

  // Ensure the classroom exists
  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true },
  });
  if (!classroom) return { ok: false, error: 'Classroom not found' };

  // Resolve/validate the guardian outside the transaction so we can return
  // a clean error before we hold any locks.
  let guardianId: string;
  let createdNewGuardian = false;
  if (g.mode === 'existing') {
    const found = await db.guardian.findFirst({
      where: { id: g.guardianId, deletedAt: null },
      select: { id: true },
    });
    if (!found) return { ok: false, error: 'Guardian not found' };
    guardianId = found.id;
  } else {
    createdNewGuardian = true;
    guardianId = ''; // assigned inside the transaction
  }

  const fullName = `${s.firstName} ${s.lastName}`.trim();

  try {
    const result = await db.$transaction(async (tx) => {
      // Compute the roll number inside the txn so the read serializes with
      // any concurrent create and prevents a unique-constraint race.
      const rollNo = await nextRollNo(tx);

      if (createdNewGuardian && g.mode === 'new') {
        const guardian = await tx.guardian.create({
          data: {
            fullName: g.fullName,
            relation: g.relation,
            phone: g.phone,
            whatsapp: g.whatsapp,
            email: g.email ?? null,
            occupation: g.occupation,
            cnic: g.cnic,
            isPrimary: true,
          },
          select: { id: true },
        });
        guardianId = guardian.id;
      }

      const student = await tx.student.create({
        data: {
          rollNo,
          firstName: s.firstName,
          lastName: s.lastName,
          fullName,
          dateOfBirth: new Date(s.dateOfBirth),
          gender: s.gender,
          bloodGroup: s.bloodGroup,
          status: s.status ?? 'ACTIVE',
          admissionDate: s.admissionDate ? new Date(s.admissionDate) : new Date(),
          photoUrl: s.photoUrl,
          notes: s.notes,
        },
        select: { id: true },
      });

      await tx.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId,
          isPrimary: true,
        },
      });

      await tx.enrollment.create({
        data: {
          studentId: student.id,
          classroomId,
          enrolledAt: s.admissionDate ? new Date(s.admissionDate) : new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'student.create',
          entityType: 'Student',
          entityId: student.id,
          diff: {
            rollNo,
            classroomId,
            guardianId,
            createdNewGuardian,
          },
        },
      });

      return { id: student.id, rollNo };
    });

    revalidatePath('/students');
    revalidatePath('/dashboard');
    return { ok: true, data: { studentId: result.id, rollNo: result.rollNo } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create student';
    return { ok: false, error: msg };
  }
}

/**
 * Server-action wrapper that creates the student then redirects to its detail
 * page (used by the create-student form which can't easily do client-side
 * navigation after a server action returns).
 */
export async function createStudentAndRedirect(
  input: CreateStudentInput,
): Promise<ActionResult> {
  const res = await createStudent(input);
  if (!res.ok) return res;
  redirect(`/students/${res.data!.studentId}`);
}
