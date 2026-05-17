'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import type { ApplicationStage } from '@prisma/client';

const stageReverseMap: Record<string, ApplicationStage> = {
  received: 'RECEIVED',
  interview: 'INTERVIEW',
  approved: 'APPROVED',
  enrolled: 'ENROLLED',
  declined: 'DECLINED',
};

export async function moveStage(
  applicationId: string,
  newStage: keyof typeof stageReverseMap,
) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const target = stageReverseMap[newStage];
  if (!target) throw new Error(`Unknown stage: ${newStage}`);

  await db.application.update({
    where: { id: applicationId },
    data: { stage: target },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'application.stage_change',
      entityType: 'Application',
      entityId: applicationId,
      diff: { stage: target },
    },
  });

  revalidatePath('/admissions');
  revalidatePath('/dashboard');
}
