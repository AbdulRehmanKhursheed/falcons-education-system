import { z } from 'zod';

/**
 * Admissions module — zod schemas for server-action input validation.
 *
 * Application stage transitions are enforced in the server action, not at
 * the schema level — the schema only constrains shape.
 */

const phoneRegex = /^[+0-9\s\-()]{7,20}$/;

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const programKindSchema = z.enum([
  'NURSERY',
  'MONTESSORI',
  'KINDERGARTEN',
  'PRIMARY',
  'EVENING_COACHING',
  'SATURDAY_COACHING',
  'COMPUTER_COURSE',
]);

export const applicationSourceSchema = z.enum([
  'WEBSITE',
  'WHATSAPP',
  'PHONE',
  'WALK_IN',
  'REFERRAL',
]);

// ── Create application ──────────────────────────────────────────────────

export const createApplicationSchema = z.object({
  applicantName: z.string().min(2, 'Applicant name is too short').max(120).trim(),
  dateOfBirth: isoDateString.optional().or(z.literal('').transform(() => undefined)),
  childAge: z.string().min(1, 'Child age is required').max(40).trim(),
  programInterest: programKindSchema,
  parentName: z.string().min(2, 'Parent name is too short').max(120).trim(),
  parentPhone: z.string().regex(phoneRegex, 'Phone must be 7–20 digits').max(20),
  parentEmail: z
    .string()
    .email('Invalid email')
    .max(180)
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  source: applicationSourceSchema,
  notes: optionalString(2000),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

// ── Update application ──────────────────────────────────────────────────

export const updateApplicationSchema = z.object({
  applicantName: z.string().min(2).max(120).trim().optional(),
  dateOfBirth: isoDateString.optional().or(z.literal('').transform(() => undefined)),
  childAge: z.string().max(40).trim().optional(),
  programInterest: programKindSchema.optional(),
  parentName: z.string().min(2).max(120).trim().optional(),
  parentPhone: z
    .string()
    .regex(phoneRegex, 'Phone must be 7–20 digits')
    .max(20)
    .optional(),
  parentEmail: z
    .string()
    .email('Invalid email')
    .max(180)
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  interviewAt: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  interviewNotes: optionalString(2000),
  notes: optionalString(2000),
});

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

// ── Schedule interview ──────────────────────────────────────────────────

export const scheduleInterviewSchema = z.object({
  interviewAt: z.string().min(1, 'Interview date/time is required'),
  interviewNotes: optionalString(2000),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

// ── Decline ─────────────────────────────────────────────────────────────

export const declineApplicationSchema = z.object({
  reason: z.string().min(2, 'Reason is required').max(2000),
});

export type DeclineApplicationInput = z.infer<typeof declineApplicationSchema>;

// ── Convert to student ──────────────────────────────────────────────────

export const convertToStudentSchema = z.object({
  classroomId: z.string().min(1, 'Classroom is required'),
  rollNo: z
    .string()
    .max(40)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type ConvertToStudentInput = z.infer<typeof convertToStudentSchema>;

// ── Add document ────────────────────────────────────────────────────────

export const addDocumentSchema = z.object({
  label: z.string().min(1, 'Label is required').max(120).trim(),
  url: z.string().url('Must be a valid URL').max(500),
  mimeType: optionalString(80),
  sizeBytes: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type AddDocumentInput = z.infer<typeof addDocumentSchema>;
