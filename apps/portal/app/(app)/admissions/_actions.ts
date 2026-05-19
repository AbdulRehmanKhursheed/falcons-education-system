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

export type MoveStageResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Legal stage transitions for the admissions pipeline.
 *
 * - `ENROLLED` is terminal — the application is bound to a Student record and
 *   reverting it would orphan the student.
 * - `DECLINED` / `WITHDRAWN` allow re-opening back to `RECEIVED`, but cannot
 *   jump directly to later stages.
 * - All other transitions follow the forward funnel and side-exits (decline
 *   or withdraw) at every step.
 */
const legalTransitions: Record<ApplicationStage, ApplicationStage[]> = {
  RECEIVED: ['INTERVIEW', 'DECLINED', 'WITHDRAWN'],
  INTERVIEW: ['APPROVED', 'DECLINED', 'WITHDRAWN'],
  APPROVED: ['ENROLLED', 'DECLINED', 'WITHDRAWN'],
  ENROLLED: [], // terminal
  DECLINED: ['RECEIVED'],
  WITHDRAWN: ['RECEIVED'],
};

/**
 * Move an application to a new stage.
 *
 * P0-07: validates against `legalTransitions` to prevent illegal moves like
 * ENROLLED → RECEIVED that would orphan a linked student record. The audit
 * diff records both the previous and new stage.
 */
export async function moveStage(
  applicationId: string,
  newStage: keyof typeof stageReverseMap,
): Promise<MoveStageResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const target = stageReverseMap[newStage];
  if (!target) return { ok: false, error: `Unknown stage: ${newStage}` };

  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { stage: true },
  });
  if (!app) return { ok: false, error: 'Application not found' };

  if (app.stage === target) return { ok: true };

  const allowed = legalTransitions[app.stage];
  if (!allowed.includes(target)) {
    return {
      ok: false,
      error: `Illegal stage transition: ${app.stage.toLowerCase()} → ${target.toLowerCase()}.`,
    };
  }

  await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { stage: target },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'application.stage_change',
        entityType: 'Application',
        entityId: applicationId,
        diff: { prevStage: app.stage, newStage: target },
      },
    }),
  ]);

  revalidatePath('/admissions');
  revalidatePath('/dashboard');
  return { ok: true };
}
