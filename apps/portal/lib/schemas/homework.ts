import { z } from 'zod';

/**
 * Homework schemas — server-action validation for create/update.
 *
 * The Prisma `Homework` row stores `subject` as a free-text String. We keep
 * the form bound to the `Subject` master table (subjectId) so admins can rely
 * on a canonical list, but persist the human label on the homework row so
 * historic posts stay readable even if a Subject is renamed.
 */

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .trim()
    .optional()
    .or(z.literal('').transform(() => undefined));

const optionalUrl = z
  .string()
  .url('Must be a valid URL')
  .max(500)
  .optional()
  .or(z.literal('').transform(() => undefined));

export const createHomeworkSchema = z.object({
  classroomId: z.string().min(1, 'Pick a classroom'),
  subjectId: z.string().min(1, 'Pick a subject'),
  title: z.string().trim().min(2, 'Title is too short').max(160),
  description: optionalString(4000),
  dueDate: isoDateString,
  attachmentUrl: optionalUrl,
});

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;

export const updateHomeworkSchema = z.object({
  classroomId: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  title: z.string().trim().min(2).max(160).optional(),
  description: optionalString(4000),
  dueDate: isoDateString.optional(),
  attachmentUrl: optionalUrl,
});

export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
