'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  createTeacherSchema,
  updateTeacherSchema,
  assignHomeroomSchema,
} from '@/lib/schemas/teachers';

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  teacherId?: string;
};

function flattenZodErrors(
  errs: Record<string, { _errors?: string[] }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(errs)) {
    if (key === '_errors') continue;
    const first = val?._errors?.[0];
    if (first) out[key] = first;
  }
  return out;
}

/**
 * Create a Teacher + linked User in one transaction. Admin-only.
 * - Email must be globally unique on User
 * - Password is bcrypt-hashed (10 rounds)
 * - Writes an AuditLog row tagged `teacher.create`
 * - Returns `{ ok: true, teacherId }` so the form can redirect on success
 */
export async function createTeacher(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = createTeacherSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? undefined,
    qualification: formData.get('qualification') ?? undefined,
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flattenZodErrors(
        parsed.error.format() as Record<string, { _errors?: string[] }>,
      ),
    };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: 'A user with that email already exists' },
    };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const teacher = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        passwordHash,
        role: 'TEACHER',
        active: true,
      },
    });
    const t = await tx.teacher.create({
      data: {
        userId: user.id,
        qualification: data.qualification,
        joinedAt: new Date(),
        isActive: true,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'teacher.create',
        entityType: 'Teacher',
        entityId: t.id,
        diff: {
          name: data.name,
          email: data.email,
          qualification: data.qualification ?? null,
        },
      },
    });
    return t;
  });

  revalidatePath('/teachers');
  return { ok: true, teacherId: teacher.id };
}

/**
 * Update a teacher's qualification + active flag. Admin-only.
 * Also keeps the linked User.active in sync so deactivated teachers can't log in.
 */
export async function updateTeacher(
  teacherId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = updateTeacherSchema.safeParse({
    qualification: formData.get('qualification') ?? undefined,
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flattenZodErrors(
        parsed.error.format() as Record<string, { _errors?: string[] }>,
      ),
    };
  }
  const data = parsed.data;

  const t = await db.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true, userId: true, qualification: true, isActive: true },
  });
  if (!t) return { ok: false, error: 'Teacher not found' };

  await db.$transaction(async (tx) => {
    await tx.teacher.update({
      where: { id: teacherId },
      data: { qualification: data.qualification, isActive: data.active },
    });
    await tx.user.update({
      where: { id: t.userId },
      data: { active: data.active },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'teacher.update',
        entityType: 'Teacher',
        entityId: teacherId,
        diff: {
          before: { qualification: t.qualification, isActive: t.isActive },
          after: { qualification: data.qualification ?? null, isActive: data.active },
        },
      },
    });
  });

  revalidatePath('/teachers');
  revalidatePath(`/teachers/${teacherId}`);
  return { ok: true };
}

/**
 * Assign or unassign a homeroom classroom for a teacher.
 * Pass `classroomId: null` to clear the assignment for the teacher's
 * currently assigned classroom (no-op if no current homeroom).
 */
export async function assignHomeroom(
  teacherId: string,
  classroomId: string | null,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = assignHomeroomSchema.safeParse({ teacherId, classroomId });
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload' };
  }

  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true },
  });
  if (!teacher) return { ok: false, error: 'Teacher not found' };

  if (classroomId) {
    await db.classroom.update({
      where: { id: classroomId },
      data: { homeroomTeacherId: teacherId },
    });
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'teacher.assign_homeroom',
        entityType: 'Classroom',
        entityId: classroomId,
        diff: { teacherId },
      },
    });
  } else {
    // Clear all classrooms currently homeroom'd by this teacher
    await db.classroom.updateMany({
      where: { homeroomTeacherId: teacherId },
      data: { homeroomTeacherId: null },
    });
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'teacher.unassign_homeroom',
        entityType: 'Teacher',
        entityId: teacherId,
        diff: {},
      },
    });
  }

  revalidatePath('/teachers');
  revalidatePath(`/teachers/${teacherId}`);
  return { ok: true };
}

/**
 * Convenience wrapper used by the "Add teacher" form on `/teachers/new`.
 * On success, redirects to the created teacher's detail page.
 */
export async function createTeacherAndRedirect(formData: FormData) {
  const result = await createTeacher(formData);
  if (result.ok && result.teacherId) {
    redirect(`/teachers/${result.teacherId}`);
  }
  return result;
}
