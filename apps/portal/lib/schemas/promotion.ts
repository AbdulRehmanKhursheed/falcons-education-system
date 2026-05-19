import { z } from 'zod';

/**
 * Year-end promotion schemas.
 *
 * - "Move" carries source enrollments forward into a target classroom.
 * - "Graduate" marks students as GRADUATED with no new enrollment.
 * - "Skip" leaves the source enrollments alone (they remain active).
 */

export const promotionActionEnum = z.enum(['move', 'graduate', 'skip']);
export type PromotionAction = z.infer<typeof promotionActionEnum>;

export const promotionMappingSchema = z
  .object({
    sourceClassroomId: z.string().min(1),
    action: promotionActionEnum,
    /** Required when action === 'move'. */
    targetClassroomId: z.string().optional().nullable(),
  })
  .refine(
    (v) =>
      v.action !== 'move' || (!!v.targetClassroomId && v.targetClassroomId.length > 0),
    {
      message: 'Target classroom is required when action is move',
      path: ['targetClassroomId'],
    },
  );

export type PromotionMapping = z.infer<typeof promotionMappingSchema>;

export const promotionPlanSchema = z
  .object({
    sourceYearId: z.string().min(1),
    targetYearId: z.string().min(1),
    mappings: z.array(promotionMappingSchema).min(1),
  })
  .refine((v) => v.sourceYearId !== v.targetYearId, {
    message: 'Source and target academic year must be different',
    path: ['targetYearId'],
  });

export type PromotionPlanInput = z.infer<typeof promotionPlanSchema>;

export const cloneClassroomsSchema = z.object({
  sourceYearId: z.string().min(1),
  targetYearId: z.string().min(1),
});

export type CloneClassroomsInput = z.infer<typeof cloneClassroomsSchema>;

export const createTargetYearSchema = z
  .object({
    name: z.string().trim().min(4, 'Name is too short').max(16, 'Name is too long'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((v) => v.endDate.getTime() > v.startDate.getTime(), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type CreateTargetYearInput = z.infer<typeof createTargetYearSchema>;
