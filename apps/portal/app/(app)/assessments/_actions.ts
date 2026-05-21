'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma, type AssessmentKind } from '@prisma/client';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  assessmentInputSchema,
  deriveGrade,
  type AssessmentInput,
} from '@/lib/schemas/assessments';

export type ActionState =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Convert a Zod error into a flat fieldErrors map keyed by field name.
 */
function flattenZodErrors(error: import('zod').ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Coerce the form payload into a shape `assessmentInputSchema` accepts.
 * The new/edit form is a plain HTML <form> — we accept FormData and
 * normalize before validating.
 */
function readForm(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  // Strip empty strings so optional fields fall through cleanly.
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' && v.trim() === '') continue;
    cleaned[k] = v;
  }
  return cleaned;
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createAssessment(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const raw = readForm(formData);
  const parsed = assessmentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  // Make sure the chosen student actually exists / isn't soft-deleted.
  const student = await db.student.findFirst({
    where: { id: parsed.data.studentId, deletedAt: null },
    select: { id: true },
  });
  if (!student) {
    return {
      ok: false,
      error: 'Selected student was not found.',
      fieldErrors: { studentId: 'Pick a valid student' },
    };
  }

  const data = buildPrismaData(parsed.data);

  let created;
  try {
    created = await db.assessment.create({
      data: {
        ...data,
        assessedById: session.user.id,
      },
      select: { id: true },
    });
  } catch (err) {
    return { ok: false, error: prismaErrorMessage(err) };
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'assessment.create',
      entityType: 'Assessment',
      entityId: created.id,
      diff: data as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/assessments');
  revalidatePath('/dashboard');
  redirect(`/assessments/${created.id}`);
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateAssessment(
  id: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const existing = await db.assessment.findUnique({
    where: { id },
    select: { id: true, assessedById: true, studentId: true },
  });
  if (!existing) return { ok: false, error: 'Assessment no longer exists.' };

  // TEACHERS can only edit their own records.
  if (
    session.user.role === 'TEACHER' &&
    existing.assessedById !== session.user.id
  ) {
    return { ok: false, error: 'You can only edit your own assessments.' };
  }

  const raw = readForm(formData);
  const parsed = assessmentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  // Don't allow the studentId to be silently rewritten by a crafted FormData
  // POST — a teacher could otherwise reassign their own assessment to any
  // student in the school. Editing the subject of an assessment is not a
  // supported workflow; force delete+recreate for that.
  if (parsed.data.studentId !== existing.studentId) {
    return {
      ok: false,
      error:
        'You cannot move an assessment to a different student. Delete this one and create a new assessment instead.',
      fieldErrors: { studentId: 'Reassigning students is not supported' },
    };
  }

  const data = buildPrismaData(parsed.data);

  try {
    await db.assessment.update({ where: { id }, data });
  } catch (err) {
    return { ok: false, error: prismaErrorMessage(err) };
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'assessment.update',
      entityType: 'Assessment',
      entityId: id,
      diff: data as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/assessments');
  revalidatePath(`/assessments/${id}`);
  return { ok: true, id };
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteAssessment(id: string): Promise<void> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.assessment.findUnique({
    where: { id },
    select: { id: true, kind: true },
  });
  if (!existing) return;

  await db.assessment.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'assessment.delete',
      entityType: 'Assessment',
      entityId: id,
      diff: { kind: existing.kind } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/assessments');
  revalidatePath('/dashboard');
  redirect('/assessments');
}

// ── Internals ──────────────────────────────────────────────────────────────

type AssessmentColumns = {
  kind: AssessmentKind;
  studentId: string;
  term: string | null;
  subject: string | null;
  score: Prisma.Decimal | null;
  scoreMax: Prisma.Decimal | null;
  grade: string | null;
  area: string | null;
  milestone: string | null;
  notes: string | null;
};

function buildPrismaData(input: AssessmentInput): AssessmentColumns {
  if (input.kind === 'MONTESSORI_OBSERVATION') {
    return {
      kind: 'MONTESSORI_OBSERVATION',
      studentId: input.studentId,
      term: input.term ?? null,
      subject: null,
      score: null,
      scoreMax: null,
      grade: null,
      area: input.area,
      milestone: input.milestone,
      notes: input.notes ?? null,
    };
  }

  // PRIMARY_GRADE — derive grade if not explicitly provided.
  const grade = input.grade ?? deriveGrade(input.score, input.scoreMax);
  return {
    kind: 'PRIMARY_GRADE',
    studentId: input.studentId,
    term: input.term,
    subject: input.subject,
    score: new Prisma.Decimal(input.score),
    scoreMax: new Prisma.Decimal(input.scoreMax),
    grade,
    area: null,
    milestone: null,
    notes: input.notes ?? null,
  };
}

function prismaErrorMessage(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return `Database error (${err.code}). Please retry.`;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong while saving the assessment.';
}
