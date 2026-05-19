'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  periodCreateSchema,
  periodUpdateSchema,
  type PeriodCreateInput,
  type PeriodUpdateInput,
} from '@/lib/schemas/timetable';
import type { ActionResult } from '@/app/(app)/settings/_actions';

function revalidate() {
  revalidatePath('/settings/periods');
  revalidatePath('/timetable');
}

export async function createPeriod(
  input: PeriodCreateInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = periodCreateSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }
  const data = parsed.data;

  const numberClash = await db.period.findUnique({
    where: { number: data.number },
  });
  if (numberClash) {
    return {
      ok: false,
      error: `Period number ${data.number} is already used`,
      field: 'number',
    };
  }

  const created = await db.period.create({
    data: {
      number: data.number,
      startTime: data.startTime,
      endTime: data.endTime,
      label: data.label,
      isBreak: data.isBreak,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'period.create',
      entityType: 'Period',
      entityId: created.id,
      diff: {
        number: created.number,
        startTime: created.startTime,
        endTime: created.endTime,
        label: created.label,
        isBreak: created.isBreak,
      },
    },
  });

  revalidate();
  return { ok: true };
}

export async function updatePeriod(
  input: PeriodUpdateInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = periodUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }
  const data = parsed.data;

  const previous = await db.period.findUnique({ where: { id: data.id } });
  if (!previous) return { ok: false, error: 'Period not found' };

  if (data.number !== previous.number) {
    const clash = await db.period.findUnique({
      where: { number: data.number },
    });
    if (clash && clash.id !== data.id) {
      return {
        ok: false,
        error: `Period number ${data.number} is already used`,
        field: 'number',
      };
    }
  }

  await db.period.update({
    where: { id: data.id },
    data: {
      number: data.number,
      startTime: data.startTime,
      endTime: data.endTime,
      label: data.label,
      isBreak: data.isBreak,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'period.update',
      entityType: 'Period',
      entityId: data.id,
      diff: {
        from: {
          number: previous.number,
          startTime: previous.startTime,
          endTime: previous.endTime,
          label: previous.label,
          isBreak: previous.isBreak,
        },
        to: {
          number: data.number,
          startTime: data.startTime,
          endTime: data.endTime,
          label: data.label,
          isBreak: data.isBreak,
        },
      },
    },
  });

  revalidate();
  return { ok: true };
}

export async function deletePeriod(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const target = await db.period.findUnique({
    where: { id },
    select: {
      id: true,
      number: true,
      label: true,
      _count: { select: { timetableEntries: true } },
    },
  });
  if (!target) return { ok: false, error: 'Period not found' };

  if (target._count.timetableEntries > 0) {
    return {
      ok: false,
      error: `Cannot delete — ${target._count.timetableEntries} timetable ${
        target._count.timetableEntries === 1 ? 'entry references' : 'entries reference'
      } this period`,
    };
  }

  await db.period.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'period.delete',
      entityType: 'Period',
      entityId: id,
      diff: { number: target.number, label: target.label },
    },
  });

  revalidate();
  return { ok: true };
}
