import { z } from 'zod';

/**
 * Coaching center — zod schemas for server-action input validation.
 *
 * Subject is free-text (matches schema) so the front office can spin up new
 * subjects without a separate Subject row. Weekdays come in from a checkbox
 * group as an array of `CoachingWeekday` enum values.
 */

export const coachingLevelSchema = z.enum([
  'MATRIC_9',
  'MATRIC_10',
  'FSC_1',
  'FSC_2',
  'O_LEVEL',
  'A_LEVEL',
  'MDCAT',
  'ECAT',
  'GENERAL',
]);

export type CoachingLevelInput = z.infer<typeof coachingLevelSchema>;

export const coachingWeekdaySchema = z.enum([
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
]);

export const coachingEnrollmentStatusSchema = z.enum([
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'DROPPED',
]);

export type CoachingEnrollmentStatusInput = z.infer<
  typeof coachingEnrollmentStatusSchema
>;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

const baseBatchShape = {
  name: z.string().min(1, 'Batch name is required').max(80).trim(),
  subject: z.string().min(1, 'Subject is required').max(40).trim(),
  level: coachingLevelSchema,
  weekdays: z
    .array(coachingWeekdaySchema)
    .min(1, 'Select at least one weekday'),
  startTime: z
    .string()
    .regex(timeRegex, 'Start time must be HH:MM (24h)'),
  endTime: z.string().regex(timeRegex, 'End time must be HH:MM (24h)'),
  teacherId: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  monthlyFee: z.coerce
    .number()
    .nonnegative('Monthly fee must be 0 or more')
    .max(10_000_000),
  capacity: z.coerce
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(500),
  notes: optionalString(2000),
};

export const createBatchSchema = z
  .object(baseBatchShape)
  .refine((d) => d.endTime > d.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const updateBatchSchema = z
  .object(baseBatchShape)
  .refine((d) => d.endTime > d.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export const enrollStudentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  joinedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Joined on must be YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notes: optionalString(2000),
});

export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;

export const updateEnrollmentStatusSchema = z.object({
  status: coachingEnrollmentStatusSchema,
});

export type UpdateEnrollmentStatusInput = z.infer<
  typeof updateEnrollmentStatusSchema
>;
