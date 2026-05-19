'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  subjectCreateSchema,
  subjectUpdateSchema,
  type SubjectCreateInput,
  type SubjectUpdateInput,
} from '@/lib/schemas/timetable';
import type { ActionResult } from '@/app/(app)/settings/_actions';

function revalidate() {
  revalidatePath('/settings/subjects');
  revalidatePath('/timetable');
}

export async function createSubject(
  input: SubjectCreateInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = subjectCreateSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }
  const data = parsed.data;

  // Name uniqueness — fail fast with a friendly message before the db throws.
  const nameClash = await db.subject.findUnique({ where: { name: data.name } });
  if (nameClash) {
    return {
      ok: false,
      error: `A subject named "${data.name}" already exists`,
      field: 'name',
    };
  }
  if (data.code) {
    const codeClash = await db.subject.findUnique({
      where: { code: data.code },
    });
    if (codeClash) {
      return {
        ok: false,
        error: `Subject code "${data.code}" is already in use`,
        field: 'code',
      };
    }
  }

  const created = await db.subject.create({
    data: {
      name: data.name,
      code: data.code,
      order: data.order,
      active: data.active,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'subject.create',
      entityType: 'Subject',
      entityId: created.id,
      diff: {
        name: created.name,
        code: created.code,
        order: created.order,
        active: created.active,
      },
    },
  });

  revalidate();
  return { ok: true };
}

export async function updateSubject(
  input: SubjectUpdateInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = subjectUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }
  const data = parsed.data;

  const previous = await db.subject.findUnique({ where: { id: data.id } });
  if (!previous) return { ok: false, error: 'Subject not found' };

  // Uniqueness checks ignoring the current row.
  if (data.name !== previous.name) {
    const nameClash = await db.subject.findUnique({ where: { name: data.name } });
    if (nameClash && nameClash.id !== data.id) {
      return {
        ok: false,
        error: `A subject named "${data.name}" already exists`,
        field: 'name',
      };
    }
  }
  if (data.code && data.code !== previous.code) {
    const codeClash = await db.subject.findUnique({ where: { code: data.code } });
    if (codeClash && codeClash.id !== data.id) {
      return {
        ok: false,
        error: `Subject code "${data.code}" is already in use`,
        field: 'code',
      };
    }
  }

  await db.subject.update({
    where: { id: data.id },
    data: {
      name: data.name,
      code: data.code,
      order: data.order,
      active: data.active,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'subject.update',
      entityType: 'Subject',
      entityId: data.id,
      diff: {
        from: {
          name: previous.name,
          code: previous.code,
          order: previous.order,
          active: previous.active,
        },
        to: {
          name: data.name,
          code: data.code,
          order: data.order,
          active: data.active,
        },
      },
    },
  });

  revalidate();
  return { ok: true };
}

export async function toggleSubjectActive(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const target = await db.subject.findUnique({ where: { id } });
  if (!target) return { ok: false, error: 'Subject not found' };

  const nextActive = !target.active;
  await db.subject.update({
    where: { id },
    data: { active: nextActive },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: nextActive ? 'subject.activate' : 'subject.deactivate',
      entityType: 'Subject',
      entityId: id,
      diff: { active: nextActive },
    },
  });

  revalidate();
  return { ok: true };
}
