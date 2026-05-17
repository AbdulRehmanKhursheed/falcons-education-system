'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { feeStructureSchema, type FeeStructureInput } from '@/lib/schemas/fees';
import type { ActionResult } from '@/app/(app)/fees/_actions';

export async function upsertFeeStructure(
  input: FeeStructureInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = feeStructureSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { id, classroomId, name, amount, frequency, active } = parsed.data;

  // Confirm classroom exists.
  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true },
  });
  if (!classroom) return { ok: false, error: 'Classroom not found' };

  let resultId: string;
  if (id) {
    const existing = await db.feeStructure.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: 'Fee structure not found' };
    const updated = await db.feeStructure.update({
      where: { id },
      data: { classroomId, name, amount, frequency, active: active ?? true },
      select: { id: true },
    });
    resultId = updated.id;
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'fee_structure.update',
        entityType: 'FeeStructure',
        entityId: resultId,
        diff: { classroomId, name, amount, frequency, active: active ?? true },
      },
    });
  } else {
    const created = await db.feeStructure.create({
      data: {
        classroomId,
        name,
        amount,
        frequency,
        active: active ?? true,
      },
      select: { id: true },
    });
    resultId = created.id;
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'fee_structure.create',
        entityType: 'FeeStructure',
        entityId: resultId,
        diff: { classroomId, name, amount, frequency, active: active ?? true },
      },
    });
  }

  revalidatePath('/fees/structures');
  revalidatePath('/fees');
  return { ok: true, data: { id: resultId } };
}

export async function toggleFeeStructureActive(
  id: string,
): Promise<ActionResult<{ active: boolean }>> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.feeStructure.findUnique({
    where: { id },
    select: { active: true },
  });
  if (!existing) return { ok: false, error: 'Fee structure not found' };

  const next = !existing.active;
  await db.$transaction([
    db.feeStructure.update({ where: { id }, data: { active: next } }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: next ? 'fee_structure.activate' : 'fee_structure.deactivate',
        entityType: 'FeeStructure',
        entityId: id,
      },
    }),
  ]);

  revalidatePath('/fees/structures');
  revalidatePath('/fees');
  return { ok: true, data: { active: next } };
}
