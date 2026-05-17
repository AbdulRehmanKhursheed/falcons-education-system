import { z } from 'zod';

/**
 * Students module — zod schemas for server-action input validation.
 *
 * Phone is validated loosely (Pakistani formats with optional country code).
 * Date fields flow as `YYYY-MM-DD` from native <input type="date">.
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

export const studentStatusSchema = z.enum([
  'ACTIVE',
  'ON_LEAVE',
  'INACTIVE',
  'GRADUATED',
]);

export type StudentStatusInput = z.infer<typeof studentStatusSchema>;

export const genderSchema = z.enum(['female', 'male', 'other']);
export type GenderInput = z.infer<typeof genderSchema>;

// ── Update student ──────────────────────────────────────────────────────

export const updateStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80).trim(),
  lastName: z.string().min(1, 'Last name is required').max(80).trim(),
  dateOfBirth: isoDateString,
  gender: genderSchema.optional(),
  bloodGroup: optionalString(8),
  status: studentStatusSchema,
  admissionDate: isoDateString.optional().or(z.literal('').transform(() => undefined)),
  photoUrl: z
    .string()
    .url('Photo URL must be a valid URL')
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notes: optionalString(2000),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

// ── Create student ──────────────────────────────────────────────────────
//
// Guardian section either references an existing guardian by id, or creates
// a brand-new one inline.

export const newGuardianSchema = z.object({
  mode: z.literal('new'),
  fullName: z.string().min(2, 'Guardian name is too short').max(120).trim(),
  relation: z.string().min(1, 'Relation is required').max(40).trim(),
  phone: z.string().regex(phoneRegex, 'Phone must be 7–20 digits').max(20),
  whatsapp: z
    .string()
    .regex(phoneRegex, 'WhatsApp must be 7–20 digits')
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  email: z
    .string()
    .email('Invalid email')
    .max(180)
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  occupation: optionalString(120),
  cnic: optionalString(20),
});

export const existingGuardianSchema = z.object({
  mode: z.literal('existing'),
  guardianId: z.string().min(1, 'Pick an existing guardian'),
});

export const guardianSectionSchema = z.discriminatedUnion('mode', [
  newGuardianSchema,
  existingGuardianSchema,
]);

export const createStudentSchema = z.object({
  student: z.object({
    firstName: z.string().min(1, 'First name is required').max(80).trim(),
    lastName: z.string().min(1, 'Last name is required').max(80).trim(),
    dateOfBirth: isoDateString,
    gender: genderSchema.optional(),
    bloodGroup: optionalString(8),
    status: studentStatusSchema.optional(),
    admissionDate: isoDateString.optional().or(z.literal('').transform(() => undefined)),
    photoUrl: z
      .string()
      .url('Photo URL must be a valid URL')
      .max(500)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    notes: optionalString(2000),
  }),
  classroomId: z.string().min(1, 'Classroom is required'),
  guardian: guardianSectionSchema,
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
