import { z } from 'zod';

/**
 * Teachers module — zod schemas for server-action input validation.
 *
 * Phone is optional but, when provided, must look like a Pakistani mobile.
 * Email is canonicalised (trim + lowercase) before uniqueness check.
 */

const phoneRegex = /^[+0-9\s\-()]{7,20}$/;

export const createTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120).trim(),
  email: z
    .string()
    .email('Please enter a valid email')
    .max(180)
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .regex(phoneRegex, 'Phone must be 7–20 digits')
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  qualification: z
    .string()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({
  qualification: z
    .string()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  active: z.boolean(),
});

export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

export const assignHomeroomSchema = z.object({
  teacherId: z.string().min(1),
  classroomId: z.string().min(1).nullable(),
});

export type AssignHomeroomInput = z.infer<typeof assignHomeroomSchema>;
