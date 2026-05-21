'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  createHomeworkSchema,
  updateHomeworkSchema,
} from '@/lib/schemas/homework';

export type ActionState =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function flattenZodErrors(error: import('zod').ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function readForm(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' && v.trim() === '') continue;
    cleaned[k] = v;
  }
  return cleaned;
}

function prismaErrorMessage(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return `Database error (${err.code}). Please retry.`;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong while saving the homework.';
}

/**
 * Confirm a TEACHER actually owns the classroom they're posting to.
 * Returns null if allowed, an error string if not.
 */
async function ensureTeacherOwnsClassroom(
  userId: string,
  classroomId: string,
): Promise<string | null> {
  const teacher = await db.teacher.findUnique({
    where: { userId },
    select: { homerooms: { select: { id: true } } },
  });
  if (!teacher) return 'Your teacher profile is missing.';
  const owned = new Set(teacher.homerooms.map((c) => c.id));
  if (!owned.has(classroomId)) return 'You can only post to your own homerooms.';
  return null;
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createHomework(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const raw = readForm(formData);
  const parsed = createHomeworkSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const { classroomId, subjectId, title, description, dueDate, attachmentUrl } =
    parsed.data;

  // Teacher classroom ownership gate.
  if (session.user.role === 'TEACHER') {
    const err = await ensureTeacherOwnsClassroom(session.user.id, classroomId);
    if (err) {
      return {
        ok: false,
        error: err,
        fieldErrors: { classroomId: 'Pick a classroom you teach' },
      };
    }
  }

  // Resolve subject name from the Subject master.
  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    select: { name: true, active: true },
  });
  if (!subject || !subject.active) {
    return {
      ok: false,
      error: 'Selected subject is not available.',
      fieldErrors: { subjectId: 'Pick a valid subject' },
    };
  }

  let created;
  try {
    created = await db.homework.create({
      data: {
        classroomId,
        subject: subject.name,
        title,
        description: description ?? null,
        dueDate: new Date(dueDate),
        attachmentUrl: attachmentUrl ?? null,
        postedById: session.user.id,
      },
      select: { id: true },
    });
  } catch (err) {
    return { ok: false, error: prismaErrorMessage(err) };
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'homework.create',
      entityType: 'Homework',
      entityId: created.id,
      diff: {
        classroomId,
        subject: subject.name,
        title,
        dueDate,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  // Notification fan-out — best effort, never blocks the post. We use a
  // per-recipient `linkFor` builder so each parent's notification deep-links
  // into the right child's homework page (`/parent/kids/<their-kid>/homework`).
  // The previous broadcast pointed at `/parent/homework/<id>`, which doesn't
  // exist in the parent portal.
  try {
    const { notifyClassroomParents } = await import('@/lib/notify');
    await notifyClassroomParents(
      classroomId,
      {
        // The Notification.kind enum doesn't have a dedicated HOMEWORK value,
        // so we map homework posts to ASSESSMENT — academics inbox. (Aligns
        // with the dashboard NotificationStrip icon mapping.)
        kind: 'ASSESSMENT',
        title: `New homework · ${subject.name}`,
        body: title,
      },
      {
        linkFor: (studentId) => `/parent/kids/${studentId}/homework`,
      },
    );
  } catch (err) {
    console.warn('[homework] notification fan-out failed', err);
  }

  revalidatePath('/homework');
  revalidatePath('/dashboard');
  revalidatePath('/parent');
  revalidatePath('/parent/homework');
  redirect(`/homework/${created.id}`);
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateHomework(
  id: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const existing = await db.homework.findUnique({
    where: { id },
    select: { id: true, postedById: true, classroomId: true },
  });
  if (!existing) return { ok: false, error: 'Homework no longer exists.' };

  // TEACHERS can only edit their own posts.
  if (
    session.user.role === 'TEACHER' &&
    existing.postedById !== session.user.id
  ) {
    return { ok: false, error: 'You can only edit your own homework posts.' };
  }

  const raw = readForm(formData);
  const parsed = updateHomeworkSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const nextClassroomId = input.classroomId ?? existing.classroomId;

  // Re-validate teacher ownership against the destination classroom.
  if (session.user.role === 'TEACHER') {
    const err = await ensureTeacherOwnsClassroom(session.user.id, nextClassroomId);
    if (err) {
      return {
        ok: false,
        error: err,
        fieldErrors: { classroomId: 'Pick a classroom you teach' },
      };
    }
  }

  let subjectName: string | undefined;
  if (input.subjectId) {
    const subject = await db.subject.findUnique({
      where: { id: input.subjectId },
      select: { name: true, active: true },
    });
    if (!subject || !subject.active) {
      return {
        ok: false,
        error: 'Selected subject is not available.',
        fieldErrors: { subjectId: 'Pick a valid subject' },
      };
    }
    subjectName = subject.name;
  }

  const data: Prisma.HomeworkUpdateInput = {
    ...(input.classroomId
      ? { classroom: { connect: { id: input.classroomId } } }
      : {}),
    ...(subjectName ? { subject: subjectName } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description ?? null }
      : {}),
    ...(input.dueDate ? { dueDate: new Date(input.dueDate) } : {}),
    ...(input.attachmentUrl !== undefined
      ? { attachmentUrl: input.attachmentUrl ?? null }
      : {}),
  };

  try {
    await db.homework.update({ where: { id }, data });
  } catch (err) {
    return { ok: false, error: prismaErrorMessage(err) };
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'homework.update',
      entityType: 'Homework',
      entityId: id,
      diff: input as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/homework');
  revalidatePath(`/homework/${id}`);
  revalidatePath('/parent');
  revalidatePath('/parent/homework');
  return { ok: true, id };
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteHomework(id: string): Promise<void> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const existing = await db.homework.findUnique({
    where: { id },
    select: { id: true, postedById: true, classroomId: true, title: true },
  });
  if (!existing) return;

  if (
    session.user.role === 'TEACHER' &&
    existing.postedById !== session.user.id
  ) {
    // Silent: returning prevents leaking that the row exists.
    return;
  }

  await db.homework.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'homework.delete',
      entityType: 'Homework',
      entityId: id,
      diff: {
        classroomId: existing.classroomId,
        title: existing.title,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/homework');
  revalidatePath('/dashboard');
  revalidatePath('/parent');
  revalidatePath('/parent/homework');
  redirect('/homework');
}
