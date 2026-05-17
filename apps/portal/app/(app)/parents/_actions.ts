'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  updateGuardianSchema,
  linkGuardianToStudentSchema,
} from '@/lib/schemas/parents';

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
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
 * Update guardian contact info. Admin-only. Writes audit log row
 * `guardian.update` with a before/after diff for the changed fields.
 */
export async function updateGuardian(
  guardianId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = updateGuardianSchema.safeParse({
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp') ?? undefined,
    email: formData.get('email') ?? undefined,
    occupation: formData.get('occupation') ?? undefined,
    address: formData.get('address') ?? undefined,
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

  const existing = await db.guardian.findUnique({
    where: { id: guardianId },
    select: {
      id: true,
      phone: true,
      whatsapp: true,
      email: true,
      occupation: true,
      address: true,
    },
  });
  if (!existing) return { ok: false, error: 'Guardian not found' };

  await db.$transaction(async (tx) => {
    await tx.guardian.update({
      where: { id: guardianId },
      data: {
        phone: data.phone,
        whatsapp: data.whatsapp ?? null,
        email: data.email ?? null,
        occupation: data.occupation ?? null,
        address: data.address ?? null,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'guardian.update',
        entityType: 'Guardian',
        entityId: guardianId,
        diff: {
          before: existing,
          after: {
            phone: data.phone,
            whatsapp: data.whatsapp ?? null,
            email: data.email ?? null,
            occupation: data.occupation ?? null,
            address: data.address ?? null,
          },
        },
      },
    });
  });

  revalidatePath('/parents');
  revalidatePath(`/parents/${guardianId}`);
  return { ok: true };
}

/**
 * Link a guardian to a student. If `isPrimary` is true, demotes any other
 * primary guardian on the same student (only one primary per student).
 */
export async function linkGuardianToStudent(
  guardianId: string,
  studentId: string,
  isPrimary: boolean,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = linkGuardianToStudentSchema.safeParse({
    guardianId,
    studentId,
    isPrimary,
  });
  if (!parsed.success) return { ok: false, error: 'Invalid payload' };

  await db.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.studentGuardian.updateMany({
        where: { studentId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    await tx.studentGuardian.upsert({
      where: { studentId_guardianId: { studentId, guardianId } },
      create: { studentId, guardianId, isPrimary },
      update: { isPrimary },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'guardian.link_student',
        entityType: 'Guardian',
        entityId: guardianId,
        diff: { studentId, isPrimary },
      },
    });
  });

  revalidatePath('/parents');
  revalidatePath(`/parents/${guardianId}`);
  return { ok: true };
}
