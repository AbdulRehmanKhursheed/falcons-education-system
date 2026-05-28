'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  createBatchSchema,
  updateBatchSchema,
  enrollStudentSchema,
  updateEnrollmentStatusSchema,
  type CreateBatchInput,
  type UpdateBatchInput,
  type EnrollStudentInput,
  type UpdateEnrollmentStatusInput,
} from '@/lib/schemas/coaching';

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const EDIT_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] as const;

// ── Create batch ───────────────────────────────────────────────────────

export async function createBatch(
  input: CreateBatchInput,
): Promise<ActionResult<{ batchId: string }>> {
  const session = await requireRole([...EDIT_ROLES]);

  const parsed = createBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const d = parsed.data;

  // Validate teacher (when supplied) is real + active. Avoids dangling refs.
  if (d.teacherId) {
    const t = await db.teacher.findUnique({
      where: { id: d.teacherId },
      select: { isActive: true },
    });
    if (!t || !t.isActive) return { ok: false, error: 'Teacher not found or inactive' };
  }

  let createdId: string;
  try {
    const batch = await db.$transaction(async (tx) => {
      const b = await tx.coachingBatch.create({
        data: {
          name: d.name,
          subject: d.subject,
          level: d.level,
          weekdays: d.weekdays,
          startTime: d.startTime,
          endTime: d.endTime,
          teacherId: d.teacherId || null,
          monthlyFee: new Prisma.Decimal(d.monthlyFee),
          capacity: d.capacity,
          notes: d.notes,
          isActive: true,
        },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'coaching_batch.create',
          entityType: 'CoachingBatch',
          entityId: b.id,
          diff: {
            name: d.name,
            subject: d.subject,
            level: d.level,
            weekdays: d.weekdays,
          },
        },
      });
      return b;
    });
    createdId = batch.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create batch';
    return { ok: false, error: msg };
  }

  revalidatePath('/coaching');
  return { ok: true, data: { batchId: createdId } };
}

export async function createBatchAndRedirect(
  input: CreateBatchInput,
): Promise<ActionResult> {
  const res = await createBatch(input);
  if (!res.ok) return res;
  redirect(`/coaching/${res.data!.batchId}`);
}

// ── Update batch ───────────────────────────────────────────────────────

export async function updateBatch(
  id: string,
  input: UpdateBatchInput,
): Promise<ActionResult> {
  const session = await requireRole([...EDIT_ROLES]);

  const parsed = updateBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const d = parsed.data;

  const existing = await db.coachingBatch.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: 'Batch not found' };

  if (d.teacherId) {
    const t = await db.teacher.findUnique({
      where: { id: d.teacherId },
      select: { isActive: true },
    });
    if (!t) return { ok: false, error: 'Teacher not found' };
  }

  await db.$transaction([
    db.coachingBatch.update({
      where: { id },
      data: {
        name: d.name,
        subject: d.subject,
        level: d.level,
        weekdays: d.weekdays,
        startTime: d.startTime,
        endTime: d.endTime,
        teacherId: d.teacherId || null,
        monthlyFee: new Prisma.Decimal(d.monthlyFee),
        capacity: d.capacity,
        notes: d.notes,
      },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'coaching_batch.update',
        entityType: 'CoachingBatch',
        entityId: id,
        diff: {
          name: d.name,
          level: d.level,
          weekdays: d.weekdays,
          capacity: d.capacity,
          monthlyFee: d.monthlyFee,
        },
      },
    }),
  ]);

  revalidatePath('/coaching');
  revalidatePath(`/coaching/${id}`);
  return { ok: true };
}

// ── Toggle active (archive / restore) ──────────────────────────────────

export async function toggleBatchActive(
  id: string,
  nextActive: boolean,
): Promise<ActionResult> {
  const session = await requireRole([...EDIT_ROLES]);

  const existing = await db.coachingBatch.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!existing) return { ok: false, error: 'Batch not found' };
  if (existing.isActive === nextActive) return { ok: true };

  await db.$transaction([
    db.coachingBatch.update({
      where: { id },
      data: { isActive: nextActive },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: nextActive ? 'coaching_batch.restore' : 'coaching_batch.archive',
        entityType: 'CoachingBatch',
        entityId: id,
        diff: { prev: existing.isActive, next: nextActive },
      },
    }),
  ]);

  revalidatePath('/coaching');
  revalidatePath(`/coaching/${id}`);
  return { ok: true };
}

// ── Enroll student ─────────────────────────────────────────────────────

export async function enrollStudent(
  batchId: string,
  input: EnrollStudentInput,
): Promise<ActionResult<{ enrollmentId: string }>> {
  const session = await requireRole([...EDIT_ROLES]);

  const parsed = enrollStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const d = parsed.data;

  const [batch, student] = await Promise.all([
    db.coachingBatch.findUnique({
      where: { id: batchId },
      select: { id: true, capacity: true, isActive: true },
    }),
    db.student.findUnique({
      where: { id: d.studentId },
      select: { id: true, status: true },
    }),
  ]);
  if (!batch) return { ok: false, error: 'Batch not found' };
  if (!batch.isActive)
    return { ok: false, error: 'Cannot enroll into an archived batch' };
  if (!student) return { ok: false, error: 'Student not found' };
  if (student.status !== 'ACTIVE')
    return {
      ok: false,
      error: 'Only active students can be enrolled in a coaching batch',
    };

  // Capacity check — count ACTIVE enrollments only. PAUSED/DROPPED don't
  // occupy a seat.
  const activeCount = await db.coachingEnrollment.count({
    where: { batchId, status: 'ACTIVE' },
  });
  if (activeCount >= batch.capacity) {
    return { ok: false, error: 'Batch is at capacity' };
  }

  // Reject duplicates against the unique constraint with a friendlier error.
  const existing = await db.coachingEnrollment.findUnique({
    where: { batchId_studentId: { batchId, studentId: d.studentId } },
    select: { id: true, status: true },
  });
  if (existing) {
    return {
      ok: false,
      error: `Student already on this batch (${existing.status.toLowerCase()})`,
    };
  }

  const joinedOn = d.joinedOn ? new Date(d.joinedOn) : new Date();

  let enrollmentId: string;
  try {
    const result = await db.$transaction(async (tx) => {
      const e = await tx.coachingEnrollment.create({
        data: {
          batchId,
          studentId: d.studentId,
          joinedOn,
          notes: d.notes,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'coaching_enrollment.create',
          entityType: 'CoachingEnrollment',
          entityId: e.id,
          diff: { batchId, studentId: d.studentId },
        },
      });
      return e;
    });
    enrollmentId = result.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to enroll student';
    return { ok: false, error: msg };
  }

  revalidatePath('/coaching');
  revalidatePath(`/coaching/${batchId}`);
  return { ok: true, data: { enrollmentId } };
}

// ── Update enrollment status ───────────────────────────────────────────

export async function updateEnrollmentStatus(
  enrollmentId: string,
  input: UpdateEnrollmentStatusInput,
): Promise<ActionResult> {
  const session = await requireRole([...EDIT_ROLES]);

  const parsed = updateEnrollmentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { status } = parsed.data;

  const existing = await db.coachingEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, batchId: true, status: true },
  });
  if (!existing) return { ok: false, error: 'Enrollment not found' };
  if (existing.status === status) return { ok: true };

  const isClosing = status === 'COMPLETED' || status === 'DROPPED';

  await db.$transaction([
    db.coachingEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        leftOn: isClosing ? new Date() : null,
      },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'coaching_enrollment.status_change',
        entityType: 'CoachingEnrollment',
        entityId: enrollmentId,
        diff: { prev: existing.status, next: status },
      },
    }),
  ]);

  revalidatePath('/coaching');
  revalidatePath(`/coaching/${existing.batchId}`);
  return { ok: true };
}
