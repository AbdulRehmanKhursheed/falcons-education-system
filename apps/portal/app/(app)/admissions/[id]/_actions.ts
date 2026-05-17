'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  updateApplicationSchema,
  scheduleInterviewSchema,
  declineApplicationSchema,
  convertToStudentSchema,
  addDocumentSchema,
  createApplicationSchema,
  type UpdateApplicationInput,
  type ScheduleInterviewInput,
  type DeclineApplicationInput,
  type ConvertToStudentInput,
  type AddDocumentInput,
  type CreateApplicationInput,
} from '@/lib/schemas/admissions';

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ── Update application ─────────────────────────────────────────────────

export async function updateApplication(
  id: string,
  input: UpdateApplicationInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = updateApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const data = parsed.data;

  const existing = await db.application.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: 'Application not found' };

  await db.$transaction([
    db.application.update({
      where: { id },
      data: {
        applicantName: data.applicantName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        childAge: data.childAge,
        programInterest: data.programInterest,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail ?? undefined,
        interviewAt: data.interviewAt ? new Date(data.interviewAt) : undefined,
        interviewNotes: data.interviewNotes,
        notes: data.notes,
      },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'application.update',
        entityType: 'Application',
        entityId: id,
        diff: { ...data },
      },
    }),
  ]);

  revalidatePath('/admissions');
  revalidatePath(`/admissions/${id}`);
  return { ok: true };
}

// ── Schedule interview ─────────────────────────────────────────────────

export async function scheduleInterview(
  id: string,
  input: ScheduleInterviewInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = scheduleInterviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { interviewAt, interviewNotes } = parsed.data;

  const existing = await db.application.findUnique({
    where: { id },
    select: { stage: true },
  });
  if (!existing) return { ok: false, error: 'Application not found' };

  const interviewDate = new Date(interviewAt);
  if (Number.isNaN(interviewDate.getTime())) {
    return { ok: false, error: 'Invalid interview date/time' };
  }

  await db.$transaction([
    db.application.update({
      where: { id },
      data: {
        interviewAt: interviewDate,
        interviewNotes,
        stage:
          existing.stage === 'RECEIVED' || existing.stage === 'WITHDRAWN'
            ? 'INTERVIEW'
            : undefined,
      },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'application.schedule_interview',
        entityType: 'Application',
        entityId: id,
        diff: { interviewAt: interviewDate.toISOString() },
      },
    }),
  ]);

  revalidatePath('/admissions');
  revalidatePath(`/admissions/${id}`);
  return { ok: true };
}

// ── Decline ────────────────────────────────────────────────────────────

export async function declineApplication(
  id: string,
  input: DeclineApplicationInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = declineApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { reason } = parsed.data;

  const existing = await db.application.findUnique({
    where: { id },
    select: { id: true, stage: true, interviewNotes: true },
  });
  if (!existing) return { ok: false, error: 'Application not found' };
  if (existing.stage === 'ENROLLED') {
    return { ok: false, error: 'Cannot decline an enrolled application' };
  }

  const stamp = new Date().toISOString();
  const merged = existing.interviewNotes
    ? `${existing.interviewNotes}\n\n[Declined ${stamp}] ${reason}`
    : `[Declined ${stamp}] ${reason}`;

  await db.$transaction([
    db.application.update({
      where: { id },
      data: { stage: 'DECLINED', interviewNotes: merged },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'application.decline',
        entityType: 'Application',
        entityId: id,
        diff: { reason },
      },
    }),
  ]);

  revalidatePath('/admissions');
  revalidatePath(`/admissions/${id}`);
  return { ok: true };
}

// ── Approve ────────────────────────────────────────────────────────────

export async function approveApplication(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.application.findUnique({
    where: { id },
    select: { stage: true },
  });
  if (!existing) return { ok: false, error: 'Application not found' };
  if (existing.stage === 'ENROLLED') {
    return { ok: false, error: 'Already enrolled' };
  }
  if (existing.stage === 'DECLINED') {
    return { ok: false, error: 'Cannot approve a declined application' };
  }

  await db.$transaction([
    db.application.update({ where: { id }, data: { stage: 'APPROVED' } }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'application.approve',
        entityType: 'Application',
        entityId: id,
      },
    }),
  ]);

  revalidatePath('/admissions');
  revalidatePath(`/admissions/${id}`);
  return { ok: true };
}

// ── Convert to student ─────────────────────────────────────────────────

async function nextRollNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FES-${year}-`;
  const latest = await db.student.findFirst({
    where: { rollNo: { startsWith: prefix } },
    orderBy: { rollNo: 'desc' },
    select: { rollNo: true },
  });
  let next = 1;
  if (latest) {
    const n = parseInt(latest.rollNo.slice(prefix.length), 10);
    if (!Number.isNaN(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

export async function convertToStudent(
  applicationId: string,
  input: ConvertToStudentInput,
): Promise<ActionResult<{ studentId: string; rollNo: string }>> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = convertToStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { classroomId } = parsed.data;

  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      stage: true,
      applicantName: true,
      dateOfBirth: true,
      parentName: true,
      parentPhone: true,
      parentEmail: true,
      studentId: true,
    },
  });
  if (!app) return { ok: false, error: 'Application not found' };
  if (app.stage !== 'APPROVED') {
    return {
      ok: false,
      error: 'Only approved applications can be converted to a student',
    };
  }
  if (app.studentId) {
    return { ok: false, error: 'Application already linked to a student' };
  }

  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true },
  });
  if (!classroom) return { ok: false, error: 'Classroom not found' };

  const rollNo = parsed.data.rollNo?.trim() || (await nextRollNo());

  // Conflict check on roll no if user supplied one
  if (parsed.data.rollNo) {
    const clash = await db.student.findUnique({
      where: { rollNo },
      select: { id: true },
    });
    if (clash) return { ok: false, error: 'Roll number already in use' };
  }

  const { firstName, lastName } = splitName(app.applicantName);
  const dob = app.dateOfBirth ?? new Date(); // fallback when application didn't capture DoB

  try {
    const result = await db.$transaction(async (tx) => {
      // Reuse guardian by phone if exists; else create new
      let guardianId: string;
      const existingGuardian = await tx.guardian.findFirst({
        where: { phone: app.parentPhone, deletedAt: null },
        select: { id: true },
      });
      if (existingGuardian) {
        guardianId = existingGuardian.id;
      } else {
        const created = await tx.guardian.create({
          data: {
            fullName: app.parentName,
            relation: 'Guardian',
            phone: app.parentPhone,
            whatsapp: app.parentPhone,
            email: app.parentEmail,
            isPrimary: true,
          },
          select: { id: true },
        });
        guardianId = created.id;
      }

      const student = await tx.student.create({
        data: {
          rollNo,
          firstName,
          lastName,
          fullName: app.applicantName,
          dateOfBirth: dob,
          status: 'ACTIVE',
          admissionDate: new Date(),
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
          enrolledAt: new Date(),
        },
      });

      await tx.application.update({
        where: { id: applicationId },
        data: {
          stage: 'ENROLLED',
          studentId: student.id,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'application.convert_to_student',
          entityType: 'Application',
          entityId: applicationId,
          diff: { studentId: student.id, rollNo, classroomId },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'student.create',
          entityType: 'Student',
          entityId: student.id,
          diff: { fromApplicationId: applicationId, rollNo, classroomId },
        },
      });

      return { id: student.id };
    });

    revalidatePath('/admissions');
    revalidatePath(`/admissions/${applicationId}`);
    revalidatePath('/students');
    revalidatePath('/dashboard');
    return { ok: true, data: { studentId: result.id, rollNo } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to convert application';
    return { ok: false, error: msg };
  }
}

// ── Add document ───────────────────────────────────────────────────────

export async function addDocument(
  applicationId: string,
  input: AddDocumentInput,
): Promise<ActionResult<{ documentId: string }>> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = addDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { label, url, mimeType, sizeBytes } = parsed.data;

  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });
  if (!app) return { ok: false, error: 'Application not found' };

  const doc = await db.document.create({
    data: {
      applicationId,
      label,
      url,
      mimeType,
      sizeBytes: typeof sizeBytes === 'number' ? sizeBytes : undefined,
    },
    select: { id: true },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'application.add_document',
      entityType: 'Application',
      entityId: applicationId,
      diff: { documentId: doc.id, label, url },
    },
  });

  revalidatePath(`/admissions/${applicationId}`);
  return { ok: true, data: { documentId: doc.id } };
}

export async function removeDocument(
  applicationId: string,
  documentId: string,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const doc = await db.document.findFirst({
    where: { id: documentId, applicationId },
    select: { id: true },
  });
  if (!doc) return { ok: false, error: 'Document not found' };

  await db.$transaction([
    db.document.delete({ where: { id: documentId } }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'application.remove_document',
        entityType: 'Application',
        entityId: applicationId,
        diff: { documentId },
      },
    }),
  ]);

  revalidatePath(`/admissions/${applicationId}`);
  return { ok: true };
}

// ── Create application ─────────────────────────────────────────────────

export async function createApplication(
  input: CreateApplicationInput,
): Promise<ActionResult<{ applicationId: string }>> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = createApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const d = parsed.data;

  const app = await db.application.create({
    data: {
      applicantName: d.applicantName,
      dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : undefined,
      childAge: d.childAge,
      programInterest: d.programInterest,
      parentName: d.parentName,
      parentPhone: d.parentPhone,
      parentEmail: d.parentEmail,
      source: d.source,
      notes: d.notes,
      stage: 'RECEIVED',
    },
    select: { id: true },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'application.create',
      entityType: 'Application',
      entityId: app.id,
      diff: { source: d.source, programInterest: d.programInterest },
    },
  });

  revalidatePath('/admissions');
  revalidatePath('/dashboard');
  return { ok: true, data: { applicationId: app.id } };
}

export async function createApplicationAndRedirect(
  input: CreateApplicationInput,
): Promise<ActionResult> {
  const res = await createApplication(input);
  if (!res.ok) return res;
  redirect(`/admissions/${res.data!.applicationId}`);
}
