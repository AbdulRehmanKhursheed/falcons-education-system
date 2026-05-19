'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  cloneClassroomsSchema,
  createTargetYearSchema,
  promotionPlanSchema,
  type CloneClassroomsInput,
  type CreateTargetYearInput,
  type PromotionPlanInput,
} from '@/lib/schemas/promotion';
import {
  getSourceClassroomsWithCounts,
  getTargetClassrooms,
  type SourceClassroom,
  type TargetClassroom,
} from '@/lib/queries/promotion';

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ── Helpers ───────────────────────────────────────────────────────────────

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Client-callable loader used by the workflow component when the user changes
 * the selected academic year. The two query helpers can't be called directly
 * because the component is a Client Component.
 */
export async function loadClassroomsForPromotion(
  yearId: string,
  kind: 'source' | 'target',
): Promise<SourceClassroom[] | TargetClassroom[]> {
  await requireRole(['SUPER_ADMIN']);
  if (kind === 'source') {
    return getSourceClassroomsWithCounts(yearId);
  }
  return getTargetClassrooms(yearId);
}

// ── 1. Create a target academic year inline ────────────────────────────────

export async function createTargetYear(
  input: CreateTargetYearInput,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await requireRole(['SUPER_ADMIN']);

  const parsed = createTargetYearSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message };
  }

  const existing = await db.academicYear.findUnique({
    where: { name: parsed.data.name },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      error: `Academic year "${parsed.data.name}" already exists.`,
    };
  }

  const created = await db.academicYear.create({
    data: {
      name: parsed.data.name,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      isCurrent: false,
    },
    select: { id: true, name: true },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'academic_year.create',
      entityType: 'AcademicYear',
      entityId: created.id,
      diff: {
        name: created.name,
        via: 'promotion-workflow',
        startDate: parsed.data.startDate.toISOString(),
        endDate: parsed.data.endDate.toISOString(),
      },
    },
  });

  revalidatePath('/settings/promotion');
  revalidatePath('/settings/academic-years');
  revalidatePath('/settings');

  return { ok: true, data: created };
}

// ── 2. Clone classrooms from source year to target year ────────────────────

export async function cloneClassrooms(
  input: CloneClassroomsInput,
): Promise<ActionResult<{ created: number }>> {
  const session = await requireRole(['SUPER_ADMIN']);

  const parsed = cloneClassroomsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  if (parsed.data.sourceYearId === parsed.data.targetYearId) {
    return { ok: false, error: 'Source and target year must be different.' };
  }

  const [sourceYear, targetYear, sourceClassrooms, existingTargets] =
    await Promise.all([
      db.academicYear.findUnique({
        where: { id: parsed.data.sourceYearId },
        select: { id: true, name: true },
      }),
      db.academicYear.findUnique({
        where: { id: parsed.data.targetYearId },
        select: { id: true, name: true },
      }),
      db.classroom.findMany({
        where: { academicYearId: parsed.data.sourceYearId },
        select: {
          name: true,
          programKind: true,
          homeroomTeacherId: true,
        },
      }),
      db.classroom.findMany({
        where: { academicYearId: parsed.data.targetYearId },
        select: { name: true },
      }),
    ]);

  if (!sourceYear) return { ok: false, error: 'Source academic year not found.' };
  if (!targetYear) return { ok: false, error: 'Target academic year not found.' };

  const existingNames = new Set(existingTargets.map((c) => c.name));
  const toCreate = sourceClassrooms.filter((c) => !existingNames.has(c.name));

  if (toCreate.length === 0) {
    return { ok: true, data: { created: 0 } };
  }

  await db.$transaction([
    db.classroom.createMany({
      data: toCreate.map((c) => ({
        academicYearId: parsed.data.targetYearId,
        name: c.name,
        programKind: c.programKind,
        homeroomTeacherId: c.homeroomTeacherId,
      })),
      skipDuplicates: true,
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'classroom.clone',
        entityType: 'AcademicYear',
        entityId: parsed.data.targetYearId,
        diff: {
          fromYear: sourceYear.name,
          toYear: targetYear.name,
          cloned: toCreate.length,
          names: toCreate.map((c) => c.name),
        },
      },
    }),
  ]);

  revalidatePath('/settings/promotion');
  revalidatePath('/settings/academic-years');

  return { ok: true, data: { created: toCreate.length } };
}

// ── 3. Preview the promotion (counts only, no writes) ──────────────────────

export type PromotionPreviewRow = {
  sourceClassroomId: string;
  sourceClassroomName: string;
  action: 'move' | 'graduate' | 'skip';
  targetClassroomId: string | null;
  targetClassroomName: string | null;
  studentCount: number;
};

export type PromotionPreview = {
  totalMoved: number;
  totalGraduated: number;
  totalSkipped: number;
  rows: PromotionPreviewRow[];
};

export async function previewPromotion(
  input: PromotionPlanInput,
): Promise<ActionResult<PromotionPreview>> {
  await requireRole(['SUPER_ADMIN']);

  const parsed = promotionPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const sourceIds = parsed.data.mappings.map((m) => m.sourceClassroomId);
  const targetIds = parsed.data.mappings
    .map((m) => m.targetClassroomId)
    .filter((id): id is string => !!id);

  const [sourceRooms, targetRooms, enrollments] = await Promise.all([
    db.classroom.findMany({
      where: { id: { in: sourceIds }, academicYearId: parsed.data.sourceYearId },
      select: { id: true, name: true },
    }),
    targetIds.length > 0
      ? db.classroom.findMany({
          where: { id: { in: targetIds }, academicYearId: parsed.data.targetYearId },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as { id: string; name: string }[]),
    db.enrollment.groupBy({
      by: ['classroomId'],
      where: {
        classroomId: { in: sourceIds },
        withdrawnAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const sourceNameMap = new Map(sourceRooms.map((c) => [c.id, c.name]));
  const targetNameMap = new Map(targetRooms.map((c) => [c.id, c.name]));
  const studentCountMap = new Map(
    enrollments.map((e) => [e.classroomId, e._count._all]),
  );

  const rows: PromotionPreviewRow[] = parsed.data.mappings.map((m) => ({
    sourceClassroomId: m.sourceClassroomId,
    sourceClassroomName:
      sourceNameMap.get(m.sourceClassroomId) ?? '(missing source)',
    action: m.action,
    targetClassroomId: m.targetClassroomId ?? null,
    targetClassroomName: m.targetClassroomId
      ? (targetNameMap.get(m.targetClassroomId) ?? '(missing target)')
      : null,
    studentCount: studentCountMap.get(m.sourceClassroomId) ?? 0,
  }));

  let totalMoved = 0;
  let totalGraduated = 0;
  let totalSkipped = 0;
  for (const r of rows) {
    if (r.action === 'move') totalMoved += r.studentCount;
    else if (r.action === 'graduate') totalGraduated += r.studentCount;
    else totalSkipped += r.studentCount;
  }

  return {
    ok: true,
    data: { totalMoved, totalGraduated, totalSkipped, rows },
  };
}

// ── 4. Commit the promotion (one transaction) ──────────────────────────────

export type PromotionResult = {
  moved: number;
  graduated: number;
  skipped: number;
  sourceYearName: string;
  targetYearName: string;
};

export async function commitPromotion(
  input: PromotionPlanInput,
): Promise<ActionResult<PromotionResult>> {
  const session = await requireRole(['SUPER_ADMIN']);

  const parsed = promotionPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const [sourceYear, targetYear] = await Promise.all([
    db.academicYear.findUnique({
      where: { id: parsed.data.sourceYearId },
      select: { id: true, name: true },
    }),
    db.academicYear.findUnique({
      where: { id: parsed.data.targetYearId },
      select: { id: true, name: true },
    }),
  ]);
  if (!sourceYear) return { ok: false, error: 'Source academic year not found.' };
  if (!targetYear) return { ok: false, error: 'Target academic year not found.' };

  // Validate every source classroom belongs to the source year and every
  // referenced target classroom belongs to the target year.
  const sourceIds = parsed.data.mappings.map((m) => m.sourceClassroomId);
  const targetIds = parsed.data.mappings
    .map((m) => m.targetClassroomId)
    .filter((id): id is string => !!id);

  const [sourceRooms, targetRooms] = await Promise.all([
    db.classroom.findMany({
      where: { id: { in: sourceIds }, academicYearId: parsed.data.sourceYearId },
      select: { id: true },
    }),
    targetIds.length > 0
      ? db.classroom.findMany({
          where: { id: { in: targetIds }, academicYearId: parsed.data.targetYearId },
          select: { id: true },
        })
      : Promise.resolve([] as { id: string }[]),
  ]);
  const sourceOk = new Set(sourceRooms.map((c) => c.id));
  const targetOk = new Set(targetRooms.map((c) => c.id));
  for (const m of parsed.data.mappings) {
    if (!sourceOk.has(m.sourceClassroomId)) {
      return {
        ok: false,
        error: 'A source classroom does not belong to the source year.',
      };
    }
    if (m.action === 'move' && (!m.targetClassroomId || !targetOk.has(m.targetClassroomId))) {
      return {
        ok: false,
        error: 'A target classroom does not belong to the target year.',
      };
    }
  }

  const today = todayMidnight();

  let moved = 0;
  let graduated = 0;
  let skipped = 0;

  await db.$transaction(async (tx) => {
    for (const m of parsed.data.mappings) {
      if (m.action === 'skip') {
        // Nothing to do — enrollments stay active in the source classroom.
        const count = await tx.enrollment.count({
          where: { classroomId: m.sourceClassroomId, withdrawnAt: null },
        });
        skipped += count;
        continue;
      }

      const active = await tx.enrollment.findMany({
        where: { classroomId: m.sourceClassroomId, withdrawnAt: null },
        select: { id: true, studentId: true },
      });

      if (active.length === 0) continue;

      if (m.action === 'graduate') {
        // Withdraw current enrollment, mark student GRADUATED. No new enrollment.
        for (const enrolment of active) {
          await tx.enrollment.update({
            where: { id: enrolment.id },
            data: { withdrawnAt: today },
          });
          await tx.student.update({
            where: { id: enrolment.studentId },
            data: { status: 'GRADUATED' },
          });
        }
        graduated += active.length;
        continue;
      }

      // m.action === 'move'
      const targetClassroomId = m.targetClassroomId!;
      for (const enrolment of active) {
        await tx.enrollment.update({
          where: { id: enrolment.id },
          data: { withdrawnAt: today },
        });
        // upsert — handles the unique (studentId, classroomId) constraint if
        // the same target was previously seeded for the student.
        await tx.enrollment.upsert({
          where: {
            studentId_classroomId: {
              studentId: enrolment.studentId,
              classroomId: targetClassroomId,
            },
          },
          create: {
            studentId: enrolment.studentId,
            classroomId: targetClassroomId,
            enrolledAt: today,
          },
          update: {
            enrolledAt: today,
            withdrawnAt: null,
          },
        });
      }
      moved += active.length;
    }

    // Flip the current-year flag.
    await tx.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
    await tx.academicYear.update({
      where: { id: parsed.data.targetYearId },
      data: { isCurrent: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'promotion.execute',
        entityType: 'AcademicYear',
        entityId: parsed.data.targetYearId,
        diff: {
          sourceYear: sourceYear.name,
          targetYear: targetYear.name,
          moved,
          graduated,
          skipped,
          mappings: parsed.data.mappings,
        },
      },
    });
  });

  revalidatePath('/settings/promotion');
  revalidatePath('/settings/academic-years');
  revalidatePath('/settings');
  revalidatePath('/students');
  revalidatePath('/dashboard');

  return {
    ok: true,
    data: {
      moved,
      graduated,
      skipped,
      sourceYearName: sourceYear.name,
      targetYearName: targetYear.name,
    },
  };
}
